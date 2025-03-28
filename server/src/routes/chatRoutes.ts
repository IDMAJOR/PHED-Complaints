import express from "express";
import { fetchChat } from "../controllers/chatController";
const router = express.Router();

router.route("/get").get(fetchChat);

export default router;
