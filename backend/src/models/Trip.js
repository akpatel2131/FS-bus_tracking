const mongoose = require("mongoose");

const tripSchema = new mongoose.Schema(
  {
    busName: {
      type: String,
      required: [true, "Bus name is required"],
      trim: true,
      maxlength: [100, "Bus name cannot exceed 100 characters"],
    },
    source: {
      type: String,
      required: [true, "Source city is required"],
      trim: true,
    },
    destination: {
      type: String,
      required: [true, "Destination city is required"],
      trim: true,
    },
    startTime: {
      type: Date,
      required: [true, "Start time is required"],
    },
    totalSeats: {
      type: Number,
      required: [true, "Total seats is required"],
      min: [1, "Must have at least 1 seat"],
      max: [100, "Cannot exceed 100 seats"],
    },
    availableSeats: {
      type: Number,
      min: [0, "Available seats cannot be negative"],
    },
    bookedSeatNumbers: {
      type: [Number],
      default: [],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
    optimisticConcurrency: true,
  }
);

tripSchema.pre("save", function (next) {
  if (this.isNew) {
    this.availableSeats = this.totalSeats;
  }
  next();
});

tripSchema.virtual("occupancyRate").get(function () {
  return (
    (((this.totalSeats - this.availableSeats) / this.totalSeats) * 100).toFixed(
      1
    ) + "%"
  );
});

tripSchema.index({ startTime: 1, isActive: 1 });
tripSchema.index({ source: 1, destination: 1 });
tripSchema.index({ availableSeats: 1 });

module.exports = mongoose.model("Trip", tripSchema);