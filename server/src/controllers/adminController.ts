import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import Admin from "../models/AdminSchema"; // Adjust the path as needed
import jwt from "jsonwebtoken";

// Corrected CreateAdmin type
type CreateAdmin = {
  key: string; // Expecting a string for the key (password or API key)
  agentname: string; // Expecting a string for the agent name
};

// **Admin Registration (Create Admin)**
export const createAdmin = async (
  req: Request<{}, {}, CreateAdmin>,
  res: Response
) => {
  const { key, agentname }: CreateAdmin = req.body;

  try {
    const existingAdmin = await Admin.findOne({ agentname });
    if (existingAdmin) {
      res.status(400).json({ message: "Agent name already exists" });
      return;
    }
    const hashedKey = await bcrypt.hash(key, 10);

    const newAdmin = new Admin({ key: hashedKey, agentname });
    await newAdmin.save();

    res.status(201).json({ message: "Admin created successfully" });
    return;
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const loginAdmin = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { agentname, key }: { agentname: string; key: string } = req.body;

  try {
    // Ensure key is coming from the request properly
    console.log("Received Key:", key);

    const admin = await Admin.findOne({ agentname });

    if (!admin) {
      console.log("No admin found with this agent name.");
      res.status(400).json({ message: "Invalid agent Key" });
      return;
    }

    // Debugging the comparison between keys
    console.log("Stored Hash:", admin.key); // The hashed key in the DB

    // Compare the provided key with the hashed key from the database
    const isKeyValid = await bcrypt.compare(key, admin.key);
    console.log("Key valid:", isKeyValid);

    if (!isKeyValid) {
      res.status(400).json({ message: "Invalid agent Key -" });
      return;
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      res
        .status(500)
        .json({ message: "Internal server error: JWT secret missing" });
      return;
    }

    const token = jwt.sign(
      { id: admin._id, agentname: admin.agentname },
      jwtSecret,
      { expiresIn: "30d" }
    );

    res.cookie("authToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
