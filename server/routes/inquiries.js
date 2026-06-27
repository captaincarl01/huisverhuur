const express = require("express");
const router = express.Router();
const Inquiry = require("../models/Inquiry");
const Property = require("../models/Property");
const { protect } = require("../middleware/auth");
const { tenantOnly, landlordOnly } = require("../middleware/role");

// @route  POST /api/inquiries
// @desc   Tenant sends an inquiry to landlord about a property
// @access Private (tenant only)
router.post("/", protect, tenantOnly, async (req, res) => {
  try {
    const { propertyId, message, moveInDate, lease } = req.body;

    if (!propertyId || !message) {
      return res.status(400).json({ message: "Property ID and message are required" });
    }

    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    // Prevent duplicate inquiries for same property
    const existing = await Inquiry.findOne({ property: propertyId, tenant: req.user._id, status: "pending" });
    if (existing) {
      return res.status(400).json({ message: "You already have a pending inquiry for this property" });
    }

    const inquiry = await Inquiry.create({
      property:   propertyId,
      tenant:     req.user._id,
      landlord:   property.landlord,
      message,
      moveInDate: moveInDate || "",
      lease:      lease || "12 months",
    });

    await inquiry.populate([
      { path: "property", select: "title city price" },
      { path: "tenant",   select: "firstName lastName email phone" },
    ]);

    res.status(201).json(inquiry);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route  GET /api/inquiries/tenant
// @desc   Tenant views all their sent inquiries
// @access Private (tenant only)
router.get("/tenant", protect, tenantOnly, async (req, res) => {
  try {
    const inquiries = await Inquiry.find({ tenant: req.user._id })
      .populate("property", "title city price type")
      .populate("landlord", "firstName lastName email phone companyName")
      .sort({ createdAt: -1 });

    res.json(inquiries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route  GET /api/inquiries/landlord
// @desc   Landlord views all inquiries they received
// @access Private (landlord only)
router.get("/landlord", protect, landlordOnly, async (req, res) => {
  try {
    const inquiries = await Inquiry.find({ landlord: req.user._id })
      .populate("property", "title city price type")
      .populate("tenant",   "firstName lastName email phone")
      .sort({ createdAt: -1 });

    res.json(inquiries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route  PUT /api/inquiries/:id/reply
// @desc   Landlord replies to an inquiry
// @access Private (landlord only)
router.put("/:id/reply", protect, landlordOnly, async (req, res) => {
  try {
    const { reply } = req.body;
    if (!reply) {
      return res.status(400).json({ message: "Reply message is required" });
    }

    const inquiry = await Inquiry.findById(req.params.id);
    if (!inquiry) {
      return res.status(404).json({ message: "Inquiry not found" });
    }
    if (inquiry.landlord.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    inquiry.reply  = reply;
    inquiry.status = "replied";
    await inquiry.save();

    res.json(inquiry);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route  PUT /api/inquiries/:id/close
// @desc   Landlord or tenant closes an inquiry
// @access Private
router.put("/:id/close", protect, async (req, res) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id);
    if (!inquiry) {
      return res.status(404).json({ message: "Inquiry not found" });
    }

    const isOwner =
      inquiry.landlord.toString() === req.user._id.toString() ||
      inquiry.tenant.toString()   === req.user._id.toString();

    if (!isOwner) {
      return res.status(403).json({ message: "Not authorized" });
    }

    inquiry.status = "closed";
    await inquiry.save();
    res.json({ message: "Inquiry closed", inquiry });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;