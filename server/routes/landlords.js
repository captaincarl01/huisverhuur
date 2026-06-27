const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Property = require("../models/Property");
const Review = require("../models/Review");

// @route  GET /api/landlords/:id
// @desc   Get public landlord profile
// @access Public
router.get("/:id", async (req, res) => {
  try {
    const landlord = await User.findOne({
      _id:  req.params.id,
      role: "landlord",
    }).select("firstName lastName companyName bio phone avatar verified createdAt");

    if (!landlord) {
      return res.status(404).json({ message: "Landlord not found" });
    }

    // Get their active listings
    const properties = await Property.find({
      landlord: req.params.id,
      status:   "active",
    }).sort({ createdAt: -1 });

    // Get their reviews
    const reviews = await Review.find({ landlord: req.params.id })
      .populate("tenant",   "firstName lastName avatar")
      .populate("property", "title city")
      .sort({ createdAt: -1 });

    const avg = reviews.length
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

    res.json({
      landlord,
      properties,
      reviews,
      averageRating: Math.round(avg * 10) / 10,
      totalReviews:  reviews.length,
      totalListings: properties.length,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;