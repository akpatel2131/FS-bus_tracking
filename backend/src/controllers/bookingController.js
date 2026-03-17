const mongoose = require("mongoose");
const Trip = require("../models/Trip");
const Booking = require("../models/Booking");

const bookSeats = async (req, res) => {
  const session = await mongoose.startSession();

  let pendingBooking = null;

  try {
    const { tripId, seatsCount, preferredSeatNumbers } = req.body;

    if (!tripId || !seatsCount) {
      return res.status(400).json({
        success: false,
        message: "tripId and seatsCount are required",
      });
    }

    const numSeats = parseInt(seatsCount);
    if (isNaN(numSeats) || numSeats < 1 || numSeats > 10) {
      return res.status(400).json({
        success: false,
        message: "seatsCount must be between 1 and 10",
      });
    }

    if (preferredSeatNumbers && preferredSeatNumbers.length !== numSeats) {
      return res.status(400).json({
        success: false,
        message: `preferredSeatNumbers count must match seatsCount (${numSeats})`,
      });
    }

    const trip = await Trip.findById(tripId);

    if (!trip) {
      return res
        .status(404)
        .json({ success: false, message: "Trip not found" });
    }

    if (!trip.isActive) {
      return res
        .status(400)
        .json({ success: false, message: "This trip is not active" });
    }

    if (new Date(trip.startTime) <= new Date()) {
      return res
        .status(400)
        .json({ success: false, message: "This trip has already departed" });
    }

    if (trip.availableSeats < numSeats) {
      return res.status(409).json({
        success: false,
        message: `Only ${trip.availableSeats} seat(s) available, but ${numSeats} requested`,
      });
    }

    let selectedSeats;

    if (preferredSeatNumbers && preferredSeatNumbers.length > 0) {
      const outOfRange = preferredSeatNumbers.filter(
        (s) => s < 1 || s > trip.totalSeats,
      );
      if (outOfRange.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Seat number(s) out of range: ${outOfRange.join(", ")}`,
        });
      }

      const alreadyBooked = preferredSeatNumbers.filter((s) =>
        trip.bookedSeatNumbers.includes(s),
      );
      if (alreadyBooked.length > 0) {
        return res.status(409).json({
          success: false,
          message: `Seat(s) ${alreadyBooked.join(", ")} are already booked`,
        });
      }
      selectedSeats = preferredSeatNumbers;
    } else {
      const allSeatNumbers = Array.from(
        { length: trip.totalSeats },
        (_, i) => i + 1,
      );
      const availableSeatNumbers = allSeatNumbers.filter(
        (s) => !trip.bookedSeatNumbers.includes(s),
      );

      if (availableSeatNumbers.length < numSeats) {
        return res.status(409).json({
          success: false,
          message: "Not enough available seats",
        });
      }
      selectedSeats = availableSeatNumbers.slice(0, numSeats);
    }

    const totalAmount = trip.price * numSeats;

    pendingBooking = await Booking.create({
      user: req.user._id,
      trip: tripId,
      seatsBooked: numSeats,
      seatNumbers: selectedSeats,
      totalAmount,
      status: "PENDING",
    });

    session.startTransaction();

    const updatedTrip = await Trip.findOneAndUpdate(
      {
        _id: tripId,
        isActive: true,
        availableSeats: { $gte: numSeats },
        bookedSeatNumbers: { $nin: selectedSeats },
      },
      {
        $inc: { availableSeats: -numSeats },
        $push: { bookedSeatNumbers: { $each: selectedSeats } },
      },
      {
        new: true,
        session,
        runValidators: true,
      },
    );

    if (!updatedTrip) {
      await session.abortTransaction();

      await Booking.findByIdAndUpdate(pendingBooking._id, {
        status: "FAILED",
        failureReason:
          "Requested seats were taken by another booking. Please try again.",
      });

      return res.status(409).json({
        success: false,
        message:
          "Seats are no longer available (concurrent booking). Please choose different seats or try again.",
      });
    }

    const confirmedBooking = await Booking.findByIdAndUpdate(
      pendingBooking._id,
      { status: "CONFIRMED" },
      { new: true, session },
    );

    await session.commitTransaction();

    const populatedBooking = await Booking.findById(confirmedBooking._id)
      .populate("user", "name email")
      .populate("trip", "busName source destination startTime price");

    return res.status(201).json({
      success: true,
      message: "Seats booked successfully!",
      data: { booking: populatedBooking },
    });
  } catch (error) {
    await session.abortTransaction();

    if (pendingBooking) {
      await Booking.findByIdAndUpdate(pendingBooking._id, {
        status: "FAILED",
        failureReason: "Internal server error during booking",
      }).catch(() => {});
    }

    console.error("BookSeats error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  } finally {
    session.endSession();
  }
};

const getMyBookings = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const filter = { user: req.user._id };
    if (status) filter.status = status.toUpperCase();

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [bookings, total] = await Promise.all([
      Booking.find(filter)
        .populate("trip", "busName source destination startTime price")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Booking.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        bookings,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    console.error("GetMyBookings error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("user", "name email")
      .populate("trip", "busName source destination startTime price");

    if (!booking) {
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    }

    if (
      req.user.role !== "admin" &&
      booking.user._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied. You can only view your own bookings.",
      });
    }

    return res.status(200).json({ success: true, data: { booking } });
  } catch (error) {
    if (error.name === "CastError") {
      return res
        .status(400)
        .json({ success: false, message: "Invalid booking ID" });
    }
    console.error("GetBookingById error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const cancelBooking = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const booking = await Booking.findById(req.params.id).session(session);

    if (!booking) {
      await session.abortTransaction();
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    }

    if (
      req.user.role !== "admin" &&
      booking.user.toString() !== req.user._id.toString()
    ) {
      await session.abortTransaction();
      return res.status(403).json({
        success: false,
        message: "Access denied. You can only cancel your own bookings.",
      });
    }

    if (booking.status !== "CONFIRMED") {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: `Cannot cancel a booking with status "${booking.status}"`,
      });
    }

    const trip = await Trip.findById(booking.trip).session(session);
    if (trip && new Date(trip.startTime) <= new Date()) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: "Cannot cancel a booking for a trip that has already departed",
      });
    }

    await Trip.findByIdAndUpdate(
      booking.trip,
      {
        $inc: { availableSeats: booking.seatsBooked },
        $pull: { bookedSeatNumbers: { $in: booking.seatNumbers } },
      },
      { session },
    );

    booking.status = "FAILED";
    booking.failureReason = "Cancelled by user";
    booking.cancelledAt = new Date();
    await booking.save({ session });

    await session.commitTransaction();

    return res.status(200).json({
      success: true,
      message: "Booking cancelled successfully. Seats have been released.",
      data: { booking },
    });
  } catch (error) {
    await session.abortTransaction();
    console.error("CancelBooking error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  } finally {
    session.endSession();
  }
};

const getAllBookings = async (req, res) => {
  try {
    const { status, tripId, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status.toUpperCase();
    if (tripId) filter.trip = tripId;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [bookings, total] = await Promise.all([
      Booking.find(filter)
        .populate("user", "name email")
        .populate("trip", "busName source destination startTime")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Booking.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        bookings,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    console.error("GetAllBookings error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = {
  bookSeats,
  getMyBookings,
  getBookingById,
  cancelBooking,
  getAllBookings,
};
