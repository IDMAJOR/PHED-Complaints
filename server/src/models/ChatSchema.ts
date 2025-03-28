import mongoose from "mongoose";

const ChatSchema = new mongoose.Schema({
  text: String,
  sender: String,
  timestamp: Date,
  status: String,
});

export default mongoose.model("Chat", ChatSchema);
