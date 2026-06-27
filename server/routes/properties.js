const express = require("express");
const router = express.Router();
const Property = require("../models/Property");
const { protect } = require("../middleware/auth");
const { landlordOnly } = require("../middleware/role");

// @route  GET /api/properties
// @desc   Get all active properties (with optional filters)
// @access Public
router.get("/", async (req, res) => {
  try {
    const { city, type, minPrice, maxPrice, beds, status } = req.query;
    const filter = { status: status || "active" };

    if (city)     filter.city  = { $regex: city, $options: "i" };
    if (type)     filter.type  = type;
    if (beds)     filter.beds  = parseInt(beds);
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseInt(minPrice);
      if (maxPrice) filter.price.$lte = parseInt(maxPrice);
    }

    const properties = await Property.find(filter)
      .populate("landlord", "firstName lastName email phone companyName bio verified")
      .sort({ createdAt: -1 });

    res.json(properties);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route  GET /api/properties/:id
// @desc   Get single property
// @access Public
router.get("/:id", async (req, res) => {
  try {
    const property = await Property.findById(req.params.id)
      .populate("landlord", "firstName lastName email phone companyName bio verified");

    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }
    res.json(property);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route  POST /api/properties
// @desc   Landlord creates a new listing
// @access Private (landlord only)
router.post("/", protect, landlordOnly, async (req, res) => {
  try {
    const {
      title, description, type, city, neighborhood,
      address, price, beds, baths, sqm, available,
      images, amenities,
    } = req.body;

    const property = await Property.create({
      landlord:    req.user._id,
      title, description, type, city,
      neighborhood: neighborhood || "",
      address:      address || "",
      price, beds, baths, sqm,
      available:    available || "Now",
      images:       images || [],
      amenities:    amenities || [],
    });

    res.status(201).json(property);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route  PUT /api/properties/:id
// @desc   Landlord updates their listing
// @access Private (landlord only)
router.put("/:id", protect, landlordOnly, async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }
    if (property.landlord.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to edit this property" });
    }

    const fields = ["title","description","type","city","neighborhood","address","price","beds","baths","sqm","available","images","amenities","status"];
    fields.forEach(f => { if (req.body[f] !== undefined) property[f] = req.body[f]; });

    const updated = await property.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route  DELETE /api/properties/:id
// @desc   Landlord deletes their listing
// @access Private (landlord only)
router.delete("/:id", protect, landlordOnly, async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }
    if (property.landlord.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this property" });
    }

    await property.deleteOne();
    res.json({ message: "Property removed successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route  GET /api/properties/landlord/my-listings
// @desc   Landlord gets all their own listings
// @access Private (landlord only)
router.get("/landlord/my-listings", protect, landlordOnly, async (req, res) => {
  try {
    const properties = await Property.find({ landlord: req.user._id }).sort({ createdAt: -1 });
    res.json(properties);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;