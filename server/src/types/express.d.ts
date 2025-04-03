// src/utils/verifiedUserToken.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { Types } from "mongoose";

// Define your user payload type
interface JwtPayload {
  id: Types.ObjectId;
  // add other properties you store in the token
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}
