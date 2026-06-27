const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const User = require("../models/User");
const { protect } = require("../middleware/auth");
const { sendVerificationEmail, sendPasswordResetEmail } = require("../utils/sendEmail");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// @route  POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const { firstName, lastName, email, password, role, phone, companyName, bio } = req.body;

    if (!firstName || !lastName || !email || !password || !role) {
      return res.status(400).json({ message: "Please fill in all required fields" });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ message: "Please enter a valid email address" });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "An account with this email already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const verifyToken = crypto.randomBytes(32).toString("hex");
    const verifyTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const user = await User.create({
      firstName, lastName, email,
      password: hashedPassword, role,
      phone: phone || "", companyName: companyName || "", bio: bio || "",
      verifyToken, verifyTokenExpiry, verified: false,
    });

    try {
      await sendVerificationEmail(email, firstName, verifyToken);
    } catch (emailErr) {
      console.error("Email send failed:", emailErr.message);
    }

    res.status(201).json({
      _id: user._id, firstName: user.firstName, lastName: user.lastName,
      email: user.email, role: user.role, verified: user.verified,
      token: generateToken(user._id),
      message: "Account created! Please check your email to verify your account.",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route  GET /api/auth/verify/:token
router.get("/verify/:token", async (req, res) => {
  try {
    const user = await User.findOne({
      verifyToken: req.params.token,
      verifyTokenExpiry: { $gt: new Date() },
    });
    if (!user) return res.status(400).json({ message: "Invalid or expired verification link." });

    user.verified = true;
    user.verifyToken = "";
    user.verifyTokenExpiry = null;
    await user.save();

    res.json({ message: "Email verified successfully! You can now log in." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route  POST /api/auth/resend-verification
router.post("/resend-verification", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "No account found with this email" });
    if (user.verified) return res.status(400).json({ message: "This account is already verified" });

    const verifyToken = crypto.randomBytes(32).toString("hex");
    user.verifyToken = verifyToken;
    user.verifyTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await user.save();

    await sendVerificationEmail(email, user.firstName, verifyToken);
    res.json({ message: "Verification email resent! Please check your inbox." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route  POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Email and password are required" });
    if (!isValidEmail(email)) return res.status(400).json({ message: "Please enter a valid email address" });

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid email or password" });

    if (!user.verified) {
      return res.status(403).json({
        message: "Please verify your email before logging in.",
        unverified: true, email: user.email,
      });
    }

    res.json({
      _id: user._id, firstName: user.firstName, lastName: user.lastName,
      email: user.email, role: user.role, verified: user.verified,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route  POST /api/auth/forgot-password
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });
    if (!isValidEmail(email)) return res.status(400).json({ message: "Please enter a valid email address" });

    const user = await User.findOne({ email });

    // Always return success even if email not found (security best practice)
    if (!user) {
      return res.json({ message: "If an account exists with this email, you will receive a reset link shortly." });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetToken = resetToken;
    user.resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    try {
      await sendPasswordResetEmail(email, user.firstName, resetToken);
    } catch (emailErr) {
      console.error("Reset email failed:", emailErr.message);
      return res.status(500).json({ message: "Failed to send reset email. Please try again." });
    }

    res.json({ message: "If an account exists with this email, you will receive a reset link shortly." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route  POST /api/auth/reset-password/:token
router.post("/reset-password/:token", async (req, res) => {
  try {
    const { password } = req.body;
    if (!password || password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const user = await User.findOne({
      resetToken: req.params.token,
      resetTokenExpiry: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired reset link. Please request a new one." });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    user.resetToken = "";
    user.resetTokenExpiry = null;
    await user.save();

    res.json({ message: "Password reset successfully! You can now log in with your new password." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route  GET /api/auth/me
router.get("/me", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password -verifyToken -resetToken");
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route  PUT /api/auth/me
router.put("/me", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const { firstName, lastName, phone, companyName, bio } = req.body;
    if (firstName)   user.firstName   = firstName;
    if (lastName)    user.lastName    = lastName;
    if (phone)       user.phone       = phone;
    if (companyName) user.companyName = companyName;
    if (bio)         user.bio         = bio;
    const updated = await user.save();
    res.json({
      _id: updated._id, firstName: updated.firstName, lastName: updated.lastName,
      email: updated.email, role: updated.role, phone: updated.phone,
      companyName: updated.companyName, bio: updated.bio,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;