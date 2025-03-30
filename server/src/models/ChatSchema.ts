import mongoose from "mongoose";

const ChatSchema = new mongoose.Schema({
  roomId: { type: Number, required: true },
  userName: { type: String, required: true },
  messages: {
    id: { type: Number, required: true, unique: true }, // Unique ID for each message
    text: { type: String, required: true },
    sender: { type: String, enum: ["user", "admin"], required: true },
    status: {
      type: String,
      enum: ["sent", "delivered", "read"],
      default: "sent",
    },
  },
  unreadCount: { type: Number, default: 0 },
  lastActivity: { type: Date, default: Date.now },
});

export default mongoose.model("Chat", ChatSchema);
