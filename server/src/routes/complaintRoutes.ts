import express from "express";
import {
  createComplaint,
  getComplaints,
} from "../controllers/complaintController";
const router = express.Router();

router.route("/create").post(createComplaint);
router.route("/get/:isAdmin").get(getComplaints);

export default router;
