const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    landlord: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    tenant:   { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    property: { type: mongoose.Schema.Types.ObjectId, ref: "Property", required: true },
    rating:   { type: Number, required: true, min: 1, max: 5 },
    comment:  { type: String, required: true, trim: true, minlength: 10, maxlength: 500 },
  },
  { timestamps: true }
);

// One review per tenant per landlord
reviewSchema.index({ landlord: 1, tenant: 1 }, { unique: true });

module.exports = mongoose.model("Review", reviewSchema);