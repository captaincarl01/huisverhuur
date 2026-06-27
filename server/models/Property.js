const mongoose = require("mongoose");

const propertySchema = new mongoose.Schema(
  {
    landlord: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title:        { type: String, required: true, trim: true },
    description:  { type: String, required: true },
    type:         { type: String, enum: ["Apartment", "House", "Studio", "Canal House"], required: true },
    city:         { type: String, required: true },
    neighborhood: { type: String, default: "" },
    address:      { type: String, default: "" },
    price:        { type: Number, required: true },
    beds:         { type: Number, required: true },
    baths:        { type: Number, required: true },
    sqm:          { type: Number, required: true },
    available:    { type: String, default: "Now" },
    images:       [{ type: String }],
    amenities:    [{ type: String }],
    status:       { type: String, enum: ["active", "rented", "inactive"], default: "active" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Property", propertySchema);