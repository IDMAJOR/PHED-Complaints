import express from "express";
import { createAdmin, loginAdmin } from "../controllers/adminController";
import verifiedUserToken from "../utils/verifiedUserToken";

const router = express.Router();

router.post("/login", loginAdmin);

export default router;
