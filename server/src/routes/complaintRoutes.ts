import express from "express";
import {
  createComplaint,
  getComplaints,
} from "../controllers/complaintController";
import verifyAdmin from "../utils/verifiedUserToken";
const router = express.Router();

router.route("/create").post(createComplaint);
router.get("/get", verifyAdmin, getComplaints);

export default router;
