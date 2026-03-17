const Trip = require("../models/Trip");

const createTrip = async (req, res) => {
  try {
    const { busName, source, destination, startTime, totalSeats, price } =
      req.body;
 
    if (!busName || !source || !destination || !startTime || !totalSeats || price === undefined) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide busName, source, destination, startTime, totalSeats, and price",
      });
    }
 
    const parsedStartTime = new Date(startTime);
    if (isNaN(parsedStartTime.getTime())) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid startTime format" });
    }
 
    if (parsedStartTime <= new Date()) {
      return res.status(400).json({
        success: false,
        message: "Start time must be in the future",
      });
    }
 
    const trip = await Trip.create({
      busName,
      source,
      destination,
      startTime: parsedStartTime,
      totalSeats,
      price,
      createdBy: req.user._id,
    });
 
    return res.status(201).json({
      success: true,
      message: "Trip created successfully",
      data: { trip },
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages[0] });
    }
    console.error("CreateTrip error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const getTrips = async (req, res) => {
  try {
    const {
      source,
      destination,
      date,
      minSeats = 1,
      page = 1,
      limit = 10,
    } = req.query;

    const filter = {
      isActive: true,
      availableSeats: { $gte: parseInt(minSeats) },
      startTime: { $gt: new Date() }, // Only future trips
    };

    if (source) filter.source = new RegExp(source, "i");
    if (destination) filter.destination = new RegExp(destination, "i");

    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      filter.startTime = { $gte: startOfDay, $lte: endOfDay };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [trips, total] = await Promise.all([
      Trip.find(filter)
        .populate("createdBy", "name email")
        .sort({ startTime: 1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Trip.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        trips,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    console.error("GetTrips error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const getTripById = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id).populate(
      "createdBy",
      "name email",
    );

    if (!trip) {
      return res
        .status(404)
        .json({ success: false, message: "Trip not found" });
    }

    const seatMap = [];
    for (let i = 1; i <= trip.totalSeats; i++) {
      seatMap.push({
        number: i,
        isBooked: trip.bookedSeatNumbers.includes(i),
      });
    }

    return res.status(200).json({
      success: true,
      data: { trip, seatMap },
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res
        .status(400)
        .json({ success: false, message: "Invalid trip ID" });
    }
    console.error("GetTripById error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const updateTrip = async (req, res) => {
  try {
    const allowedFields = ["busName", "source", "destination", "startTime", "price", "isActive"];
    const updates = {};
    for (const key of allowedFields) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }
 
    const trip = await Trip.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });
 
    if (!trip) {
      return res.status(404).json({ success: false, message: "Trip not found" });
    }
 
    return res.status(200).json({
      success: true,
      message: "Trip updated successfully",
      data: { trip },
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ success: false, message: "Invalid trip ID" });
    }
    console.error("UpdateTrip error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
 
const deleteTrip = async (req, res) => {
  try {
    const trip = await Trip.findByIdAndDelete(req.params.id);
    if (!trip) {
      return res.status(404).json({ success: false, message: "Trip not found" });
    }
    return res.status(200).json({
      success: true,
      message: "Trip deleted successfully",
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ success: false, message: "Invalid trip ID" });
    }
    console.error("DeleteTrip error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = { getTrips, getTripById, createTrip, updateTrip, deleteTrip };
