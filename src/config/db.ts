import { env } from "./env.js";
import mongoose from "mongoose";
import User from "../models/User.js";

export const connectDB = async () => {
  try {
    await mongoose.connect(env.MONGO_URI as string);
    console.log("MongoDB Connected");
  } catch (error) {
    console.error("Database connection failed", error);
    process.exit(1);
  }
};