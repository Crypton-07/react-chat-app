import { Router } from "express";
import {
  addProfileImage,
  getUserInfo,
  login,
  signUp,
  updateProfile,
  removeProfileImage,
  logout,
} from "../Controllers/authController.js";
import { verifyToken } from "../Middleware/authMiddleware.js";
import multer from "multer";

const upload = multer({ dest: "uploads/profiles/" });
const authRoutes = Router();

authRoutes.post("/signup", signUp);
authRoutes.post("/login", login);
authRoutes.post("/logout", logout);
authRoutes.get("/user-info", verifyToken, getUserInfo);
authRoutes.post("/update-profile", verifyToken, updateProfile);
authRoutes.post(
  "/add-profile-image",
  verifyToken,
  upload.single("profile-image"),
  addProfileImage
);

authRoutes.delete("/remove-profile-image", verifyToken, removeProfileImage);

export default authRoutes;
