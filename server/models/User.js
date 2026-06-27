const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    firstName:          { type: String, required: true, trim: true },
    lastName:           { type: String, required: true, trim: true },
    email:              { type: String, required: true, unique: true, lowercase: true, trim: true },
    password:           { type: String, required: true, minlength: 6 },
    role:               { type: String, enum: ["tenant", "landlord"], required: true },
    phone:              { type: String, default: "" },
    avatar:             { type: String, default: "" },
    companyName:        { type: String, default: "" },
    bio:                { type: String, default: "" },
    verified:           { type: Boolean, default: false },
    verifyToken:        { type: String, default: "" },
    verifyTokenExpiry:  { type: Date, default: null },
    resetToken:         { type: String, default: "" },
    resetTokenExpiry:   { type: Date, default: null },
  },
  { timestamps: true }
);

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);