const express    = require("express");
const cors       = require("cors");
const dotenv     = require("dotenv");
const http       = require("http");
const { Server } = require("socket.io");
const connectDB  = require("./config/db");
const jwt        = require("jsonwebtoken");
const User       = require("./models/User");
const Message    = require("./models/Message");

dotenv.config();
connectDB();

const app    = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: ["http://localhost:3000", "http://localhost:5173"], methods: ["GET", "POST"] },
});

app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://huisverhuuer.vercel.app",
  ],
  credentials: true,
}));
app.use(express.json());

app.get("/api/health", (req, res) => res.json({ status: "HuisVerhuur API running ✅" }));

try { app.use("/api/auth",       require("./routes/auth"));                    console.log("✅ auth routes loaded"); }       catch(e) { console.error("❌ auth:", e.message); }
try { app.use("/api/properties", require("./routes/properties"));              console.log("✅ properties routes loaded"); } catch(e) { console.error("❌ properties:", e.message); }
try { app.use("/api/inquiries",  require("./routes/inquiries"));               console.log("✅ inquiries routes loaded"); }  catch(e) { console.error("❌ inquiries:", e.message); }
try { app.use("/api/payments",   require("./routes/payments"));                console.log("✅ payments routes loaded"); }   catch(e) { console.error("❌ payments:", e.message); }
try { app.use("/api/messages",   require("./routes/messages").router);         console.log("✅ messages routes loaded"); }   catch(e) { console.error("❌ messages:", e.message); }
try { app.use("/api/reviews",    require("./routes/reviews"));                 console.log("✅ reviews routes loaded"); }    catch(e) { console.error("❌ reviews:", e.message); }
try { app.use("/api/landlords",  require("./routes/landlords"));               console.log("✅ landlords routes loaded"); }  catch(e) { console.error("❌ landlords:", e.message); }

// Socket.io
const onlineUsers = new Map();

io.use(async (socket, next) => {
  try {
    const token   = socket.handshake.auth.token;
    if (!token) return next(new Error("No token"));
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user    = await User.findById(decoded.id).select("-password");
    if (!user) return next(new Error("User not found"));
    socket.user = user;
    next();
  } catch (err) { next(new Error("Invalid token")); }
});

io.on("connection", (socket) => {
  const userId = socket.user._id.toString();
  onlineUsers.set(userId, socket.id);
  io.emit("onlineUsers", Array.from(onlineUsers.keys()));

  socket.on("joinConversation", (conversationId) => socket.join(conversationId));

  socket.on("sendMessage", async (data) => {
    try {
      const { receiverId, propertyId, content, conversationId } = data;
      const message = await Message.create({
        conversationId, sender: socket.user._id,
        receiver: receiverId, property: propertyId, content,
      });
      await message.populate([
        { path: "sender",   select: "firstName lastName avatar role" },
        { path: "receiver", select: "firstName lastName avatar role" },
        { path: "property", select: "title city" },
      ]);
      io.to(conversationId).emit("newMessage", message);
      const receiverSocketId = onlineUsers.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("messageNotification", {
          from: `${socket.user.firstName} ${socket.user.lastName}`,
          content, conversationId,
        });
      }
    } catch (err) { console.error("Message error:", err.message); }
  });

  socket.on("typing", ({ conversationId, isTyping }) => {
    socket.to(conversationId).emit("userTyping", { userId, name: socket.user.firstName, isTyping });
  });

  socket.on("disconnect", () => {
    onlineUsers.delete(userId);
    io.emit("onlineUsers", Array.from(onlineUsers.keys()));
  });
});

app.use((err, req, res, next) => {
  console.error("GLOBAL ERROR:", err.message);
  res.status(500).json({ message: err.message });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));