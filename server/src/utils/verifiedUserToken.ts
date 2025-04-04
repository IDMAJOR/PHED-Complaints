import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

// Define the JWT payload type
interface JwtPayload {
  id: string;
  role?: string; // Add other user properties you expect in the token
  [key: string]: any; // For additional properties
}

// Extend the Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

const verifyAdmin = (req: Request, res: Response, next: NextFunction): void => {
  const token = req.cookies?.authToken;

  console.log("Token from cookie:", token);

  if (!token) {
    res.status(401).json({
      success: false,
      message: "Token is required to access this resource.",
    });
    return;
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    res.status(500).json({
      success: false,
      message: "JWT_SECRET is not configured.",
    });
    return;
  }

  jwt.verify(token, secret, (err: any, decoded: any) => {
    if (err) {
      const message =
        err.name === "TokenExpiredError"
          ? "Token has expired"
          : "Invalid token";

      return res.status(401).json({
        success: false,
        message,
      });
    }

    // Type assertion for the decoded payload
    const user = decoded as JwtPayload;

    // Attach typed user to request
    req.user = user;
    next();
  });
};

export default verifyAdmin;
