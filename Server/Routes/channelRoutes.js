import { Router } from "express";
import { verifyToken } from "../Middleware/authMiddleware.js";
import {
  createChannel,
  getChannelsMessages,
  getUserChannels,
} from "../Controllers/channelController.js";

const channelRoutes = Router();
channelRoutes.post("/create-channel", verifyToken, createChannel);
channelRoutes.get("/get-user-channels", verifyToken, getUserChannels);
channelRoutes.get(
  "/get-channel-messages/:channelId",
  verifyToken,
  getChannelsMessages
);

export default channelRoutes;
