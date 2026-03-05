import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt.js";
import User from "../models/User.js";
import { AppError } from "../utils/AppError.js";

export async function requireAuth(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  try {
    // 1️⃣ Get token from cookie
    const token = req.cookies?.accessToken;

    if (!token) {
      return next(new AppError("Not authenticated", 401));
    }

    // 2️⃣ Verify token
    const decoded = verifyAccessToken(token);

    // 3️⃣ Find user in database
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return next(new AppError("User no longer exists", 401));
    }

    // 4️⃣ Attach user to request
    (req as any).user = user;

    // 5️⃣ Continue to controller
    next();
  } catch (err) {
    return next(new AppError("Invalid or expired token", 401));
  }
}