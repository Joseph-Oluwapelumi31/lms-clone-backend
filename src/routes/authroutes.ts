// src/routes/auth.routes.ts
import { Router } from "express";
import { register, login, logout, me } from "../controllers/authcontroller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

const router = Router();

// Public
router.post("/register", register);
router.post("/login", login);

// Protected
router.post("/logout", logout);
router.get("/me", requireAuth, me);

export default router;