import { Schema, model, Document } from "mongoose";

interface IComplaint extends Document {
  fullName: string;
  address: string;
  meterNumber: string;
  phoneNumber: string;
  complaintDetails: string;
  status: "Pending" | "In Progress" | "Resolved";
  createdAt: Date;
  updatedAt: Date;
  assignedTo?: string;
  resolutionNotes?: string;
  tickedID?: number;
}

const complaintSchema = new Schema<IComplaint>(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    address: {
      type: String,
      required: [true, "Address is required"],
      trim: true,
    },
    meterNumber: {
      type: String,
      required: [true, "Meter number is required"],
    },
    phoneNumber: {
      type: String,
      required: [true, "Phone number is required"],
      match: [
        /^0[7-9][0-1]\d{8}$/,
        "Please enter a valid Nigerian phone number",
      ],
    },
    complaintDetails: {
      type: String,
      required: [true, "Complaint details are required"],
    },
    status: {
      type: String,
      enum: ["Pending", "In Progress", "Resolved"],
      default: "Pending",
    },
    assignedTo: {
      type: String,
      default: "Unassigned",
    },
    resolutionNotes: {
      type: String,
      default: "",
    },
    tickedID: {
      type: Number,
      default: null,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        delete ret._id;
        delete ret.__v;
      },
    },
  }
);

const Complaint = model<IComplaint>("Complaint", complaintSchema);

export default Complaint;
