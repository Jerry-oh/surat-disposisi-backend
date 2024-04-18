import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload, Secret } from "jsonwebtoken";

// Interface for request with user data
export interface AuthRequest extends Request {
  user?: JwtPayload;
}

export const verifyToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const secretKey = process.env.JWT_SECRET! as Secret;
  const token = req.header("Authorization");
  if (!token) return res.status(401).json({ error: "Access denied" });
  try {
    const decoded: JwtPayload = jwt.verify(token!, secretKey) as JwtPayload;
    req.user = decoded;
    next();
  } catch (error) {
    console.log(error);
    res.status(401).json({ error: "Invalid token" });
  }
};
