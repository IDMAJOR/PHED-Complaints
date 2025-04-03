import { Request, RequestHandler, Response } from "express";
import Complaint from "../models/complaintSchema";

interface ComplaintRequest {
  fullName: string;
  address: string;
  meterNumber: string;
  phoneNumber: string;
  complaintDetails: string;
}

export const createComplaint: RequestHandler = async (
  req,
  res
): Promise<void> => {
  try {
    const { fullName, address, meterNumber, phoneNumber, complaintDetails } =
      req.body;

    console.log({
      fullName,
      address,
      meterNumber,
      phoneNumber,
      complaintDetails,
    });

    // Validate required fields
    if (
      !fullName ||
      !address ||
      !meterNumber ||
      !phoneNumber ||
      !complaintDetails
    ) {
      res.status(400).json({
        success: false,
        message: "All fields are required",
      });
      return;
    }

    // Create new complaint
    const newComplaint = await Complaint.create({
      fullName,
      address,
      meterNumber,
      phoneNumber,
      complaintDetails,
      status: "Pending", // Default status
    });

    res.status(201).json({
      success: true,
      message: "Complaint created successfully",
      data: {
        complaintId: newComplaint._id,
        meterNumber: newComplaint.meterNumber,
        status: newComplaint.status,
      },
    });
    return;
  } catch (error: any) {
    console.error("Error creating complaint:", error);

    // Handle specific Mongoose validation errors
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err: any) => err.message);
      res.status(400).json({
        success: false,
        message: "Validation error",
        errors,
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
    return;
  }
};

export const getComplaints: RequestHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const complaints = await Complaint.find();

    if (complaints === null) {
      res.status(404).json({
        success: false,
        message: "No complaints found...",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Complaints successfully fetched!",
      data: {
        complaints,
      },
    });
  } catch (error: any) {
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err: any) => err.message);
      res.status(400).json({
        success: false,
        message: "Validation error",
        errors,
      });
      return;
    }

    console.log(error);
    res.status(500).json({
      success: false,
      message: "Interval server error",
    });

    return;
  }
};
