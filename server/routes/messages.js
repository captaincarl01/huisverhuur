const express = require("express");
const router = express.Router();
const Message = require("../models/Message");
const { protect } = require("../middleware/auth");

// Generate consistent conversation ID from two user IDs + property
const getConversationId = (userId1, userId2, propertyId) => {
  return [userId1, userId2].sort().join("_") + `_${propertyId}`;
};

// @route  GET /api/messages/conversations
// @desc   Get all conversations for logged in user
// @access Private
router.get("/conversations", protect, async (req, res) => {
  try {
    const userId = req.user._id;

    const messages = await Message.find({
      $or: [{ sender: userId }, { receiver: userId }]
    })
      .populate("sender",   "firstName lastName avatar role")
      .populate("receiver", "firstName lastName avatar role")
      .populate("property", "title city price images")
      .sort({ createdAt: -1 });

    // Group by conversationId — get latest message per conversation
    const conversations = {};
    messages.forEach(msg => {
      if (!conversations[msg.conversationId]) {
        conversations[msg.conversationId] = msg;
      }
    });

    // Count unread per conversation
    const unreadCounts = await Message.aggregate([
      { $match: { receiver: userId, read: false } },
      { $group: { _id: "$conversationId", count: { $sum: 1 } } }
    ]);

    const unreadMap = {};
    unreadCounts.forEach(u => { unreadMap[u._id] = u.count; });

    const result = Object.values(conversations).map(conv => ({
      ...conv.toObject(),
      unread: unreadMap[conv.conversationId] || 0,
    }));

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route  GET /api/messages/:conversationId
// @desc   Get all messages in a conversation
// @access Private
router.get("/:conversationId", protect, async (req, res) => {
  try {
    const messages = await Message.find({
      conversationId: req.params.conversationId
    })
      .populate("sender",   "firstName lastName avatar role")
      .populate("receiver", "firstName lastName avatar role")
      .sort({ createdAt: 1 });

    // Mark messages as read
    await Message.updateMany(
      { conversationId: req.params.conversationId, receiver: req.user._id, read: false },
      { read: true }
    );

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route  POST /api/messages
// @desc   Send a message
// @access Private
router.post("/", protect, async (req, res) => {
  try {
    const { receiverId, propertyId, content } = req.body;
    if (!receiverId || !propertyId || !content) {
      return res.status(400).json({ message: "Receiver, property and content are required" });
    }

    const conversationId = getConversationId(
      req.user._id.toString(),
      receiverId,
      propertyId
    );

    const message = await Message.create({
      conversationId,
      sender:   req.user._id,
      receiver: receiverId,
      property: propertyId,
      content,
    });

    await message.populate([
      { path: "sender",   select: "firstName lastName avatar role" },
      { path: "receiver", select: "firstName lastName avatar role" },
      { path: "property", select: "title city price images" },
    ]);

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route  GET /api/messages/unread/count
// @desc   Get total unread message count
// @access Private
router.get("/unread/count", protect, async (req, res) => {
  try {
    const count = await Message.countDocuments({
      receiver: req.user._id,
      read: false,
    });
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = { router, getConversationId };