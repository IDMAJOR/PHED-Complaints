import express from "express";
import { fetchChat } from "../controllers/chatController";
import verifiedUserToken from "../utils/verifiedUserToken";
const router = express.Router();

router.get("/get", verifiedUserToken, fetchChat);

export default router;
