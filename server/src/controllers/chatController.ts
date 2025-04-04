import { Request, Response } from "express";
import ChatSchema from "../models/ChatSchema";

export const fetchChat = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const chats = await ChatSchema.find().sort({ timestamp: -1 });
    res.status(200).json(chats);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch chat history" });
  }
};
