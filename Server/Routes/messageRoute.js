import e, { Router } from "express";
import { verifyToken } from "../Middleware/authMiddleware.js";
import { getMessages, uploadFiles } from "../Controllers/messageController.js";
import multer from "multer";

const messageRoute = Router();
const upload = multer({ dest: "uploads/files" });
messageRoute.post("/get-messages", verifyToken, getMessages);
messageRoute.post(
  "/upload-files",
  verifyToken,
  upload.single("file"),
  uploadFiles
);
export default messageRoute;
