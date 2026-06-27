const express = require("express");
const router = express.Router();
const Review = require("../models/Review");
const Inquiry = require("../models/Inquiry");
const { protect } = require("../middleware/auth");
const { tenantOnly } = require("../middleware/role");

// @route  POST /api/reviews
// @desc   Tenant leaves a review for a landlord
// @access Private (tenant only)
router.post("/", protect, tenantOnly, async (req, res) => {
  try {
    const { landlordId, propertyId, rating, comment } = req.body;

    if (!landlordId || !propertyId || !rating || !comment) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }
    if (comment.length < 10) {
      return res.status(400).json({ message: "Review must be at least 10 characters" });
    }

    // Check tenant has actually inquired about this landlord's property
    const hasInquiry = await Inquiry.findOne({
      tenant:   req.user._id,
      landlord: landlordId,
      status:   { $in: ["replied", "closed"] },
    });

    if (!hasInquiry) {
      return res.status(403).json({
        message: "You can only review landlords you have had an inquiry with"
      });
    }

    // Check for existing review
    const existing = await Review.findOne({ landlord: landlordId, tenant: req.user._id });
    if (existing) {
      return res.status(400).json({ message: "You have already reviewed this landlord" });
    }

    const review = await Review.create({
      landlord: landlordId,
      tenant:   req.user._id,
      property: propertyId,
      rating,
      comment,
    });

    await review.populate([
      { path: "tenant",   select: "firstName lastName avatar" },
      { path: "property", select: "title city" },
    ]);

    res.status(201).json(review);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "You have already reviewed this landlord" });
    }
    res.status(500).json({ message: error.message });
  }
});

// @route  GET /api/reviews/landlord/:landlordId
// @desc   Get all reviews for a landlord
// @access Public
router.get("/landlord/:landlordId", async (req, res) => {
  try {
    const reviews = await Review.find({ landlord: req.params.landlordId })
      .populate("tenant",   "firstName lastName avatar")
      .populate("property", "title city")
      .sort({ createdAt: -1 });

    const avg = reviews.length
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

    res.json({
      reviews,
      averageRating: Math.round(avg * 10) / 10,
      totalReviews:  reviews.length,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route  GET /api/reviews/can-review/:landlordId
// @desc   Check if tenant can review a landlord
// @access Private
router.get("/can-review/:landlordId", protect, async (req, res) => {
  try {
    if (req.user.role !== "tenant") {
      return res.json({ canReview: false });
    }

    const hasInquiry = await Inquiry.findOne({
      tenant:   req.user._id,
      landlord: req.params.landlordId,
      status:   { $in: ["replied", "closed"] },
    });

    const alreadyReviewed = await Review.findOne({
      landlord: req.params.landlordId,
      tenant:   req.user._id,
    });

    res.json({
      canReview: !!hasInquiry && !alreadyReviewed,
      alreadyReviewed: !!alreadyReviewed,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route  GET /api/reviews/landlord/:landlordId/property
// @desc   Get landlord's property for review form
// @access Private
router.get("/landlord/:landlordId/inquiry-property", protect, async (req, res) => {
  try {
    const inquiry = await Inquiry.findOne({
      tenant:   req.user._id,
      landlord: req.params.landlordId,
      status:   { $in: ["replied", "closed"] },
    }).populate("property", "title city");

    res.json({ property: inquiry?.property || null });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;