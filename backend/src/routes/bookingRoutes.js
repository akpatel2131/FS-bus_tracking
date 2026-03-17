const express = require("express");
const router = express.Router();
const {
  bookSeats,
  getMyBookings,
  getBookingById,
  cancelBooking,
  getAllBookings,
} = require("../controllers/bookingController");
const authorization = require("../middleware/auth");
const adminOnly = require("../middleware/admin");


router.use(authorization);

router.post("/", bookSeats);
router.get("/my", getMyBookings);
router.get("/admin/all", adminOnly, getAllBookings);
router.get("/:id", getBookingById);
router.patch("/:id/cancel", cancelBooking);

module.exports = router;