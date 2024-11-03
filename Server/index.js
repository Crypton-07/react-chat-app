import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import authRoutes from "./Routes/authRoute.js";
import contactsRoutes from "./Routes/contactRoute.js";
import setupSpcket from "./socket.js";
import messageRoute from "./Routes/messageRoute.js";
import channelRoutes from "./Routes/channelRoutes.js";

dotenv.config();
const app = express();
const port = process.env.PORT || 8085;
const databseUrl = process.env.DATABASE_URL;

app.use(
  cors({
    origin: [process.env.ORIGIN],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  })
);
app.use("/uploads/profiles", express.static("uploads/profiles"));
app.use("/uploads/files", express.static("uploads/files"));
app.use(cookieParser());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/contacts", contactsRoutes);
app.use("/api/messages", messageRoute);
app.use("/api/channel", channelRoutes);
const server = app.listen(port, () => {
  console.log("server listening at" + `http://localhost:${port}`);
});

setupSpcket(server);

mongoose.connect(databseUrl).then(() => {
  console.log("Database connection established");
});
