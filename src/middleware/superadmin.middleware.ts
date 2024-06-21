import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload, Secret } from "jsonwebtoken";

// Interface for request with user data
interface AuthRequest extends Request {
  user?: JwtPayload;
}

export const verifySuperAdmin = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (req.user!.role !== "super_admin") {
      return res.status(401).json({ error: "Access denied" });
    }
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
};
