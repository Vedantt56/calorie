import express from "express";
import {
  registerUser,
  loginUser,
  updateProfile,
  getProfile,
  startGoogleAuth,
  handleGoogleCallback
} from "../controllers/authController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.put("/profile", authMiddleware, updateProfile);
router.get("/me", authMiddleware, getProfile);
router.get("/google", startGoogleAuth);
router.get("/google/callback", handleGoogleCallback);

export default router;
