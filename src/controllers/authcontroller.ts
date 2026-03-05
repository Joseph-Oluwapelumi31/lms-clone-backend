// src/controllers/auth.controller.ts
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import User from "../models/User.js";
import { cookieOptions } from "../config/cookie.js";
import { signAccessToken } from "../utils/jwt.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  // 1) Basic validation
  if (!name || !email || !password) {
    throw new AppError("name, email and password are required", 400);
  }

  // 2) Check if email already exists
  const existing = await User.findOne({ email });
  if (existing) {
    throw new AppError("Email already used", 409);
  }

  // 3) Hash password
  const hashed = await bcrypt.hash(password, 10);

  // 4) Create user
  const user = await User.create({
    name,
    email,
    password: hashed,
    role: "student",
  });

  // 5) Return safe user data (never return password)
  return res.status(201).json({
    success: true,
    message: "Registered",
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // 1) Basic validation
  if (!email || !password) {
    throw new AppError("email and password are required", 400);
  }

  // 2) Find user (+password in case schema uses select:false)
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    throw new AppError("Invalid credentials", 401);
  }

  // 3) Compare password
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) {
    throw new AppError("Invalid credentials", 401);
  }

  // 4) Create JWT
  const accessToken = signAccessToken({ userId: user._id.toString(), role: user.role });

  // 5) Set JWT in HTTP-only cookie
  res.cookie("accessToken", accessToken, {
    ...cookieOptions,
    maxAge: 15 * 60 * 1000, // 15 minutes
  });

  // 6) Return safe user info
  return res.status(200).json({
    success: true,
    message: "Logged in",
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
});

export const logout = asyncHandler(async (_req: Request, res: Response) => {
  // Clear the cookie (same options used to set it)
  res.clearCookie("accessToken", cookieOptions);

  return res.status(200).json({
    success: true,
    message: "Logged out",
  });
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  // requireAuth middleware should set req.user
  const user = (req as any).user;

  if (!user) {
    throw new AppError("Not authenticated", 401);
  }

  return res.status(200).json({
    success: true,
    user,
  });
});