const mongoose = require("mongoose");

const inquirySchema = new mongoose.Schema(
  {
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: true,
    },
    tenant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    landlord: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message:    { type: String, required: true },
    moveInDate: { type: String, default: "" },
    lease:      { type: String, default: "12 months" },
    status:     { type: String, enum: ["pending", "replied", "closed"], default: "pending" },
    reply:      { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Inquiry", inquirySchema);