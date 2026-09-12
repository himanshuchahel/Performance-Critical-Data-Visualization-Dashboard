import { Response, NextFunction } from "express";
import { AuthRequest } from "../types";
import jwt from "jsonwebtoken";
import { env } from "../config/env";

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
  const token = req.cookies?.token || req.headers.authorization?.replace("Bearer ", "");
  if (!token) {
    res.status(401).json({ success: false, message: "Authentication required" });
    return;
  }
  try {
    const decoded = jwt.verify(token, env.AUTH_SECRET) as { userId: string; email: string };
    req.user = { _id: decoded.userId, email: decoded.email, name: "" };
    next();
  } catch {
    res.status(401).json({ success: false, message: "Invalid or expired session" });
  }
}
