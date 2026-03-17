const express = require("express");
const router = express.Router();
const { getTrips, getTripById, createTrip, updateTrip, deleteTrip } = require("../controllers/tripController");
const authorization = require("../middleware/auth");
const adminOnly = require("../middleware/admin");


router.get("/", getTrips);
router.get("/:id", getTripById);

router.use(authorization);

router.post("/", adminOnly, createTrip);
router.put("/:id", adminOnly, updateTrip);
router.delete("/:id", adminOnly, deleteTrip);

module.exports = router;
