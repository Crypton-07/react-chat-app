import { set } from "mongoose";
import { Server as SocketIOServer } from "socket.io";
import Message from "./Models/messagesModel.js";
import Channel from "./Models/channelModel.js";

const setupSpcket = (server) => {
  const io = new SocketIOServer(server, {
    cors: {
      origin: process.env.ORIGIN,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });
  const userSocketMap = new Map();
  const disconnect = (socket) => {
    console.log("Clients disconnected:" + socket.id);
    for (const [userId, socketId] of userSocketMap.entries()) {
      if (socketId === socket.id) {
        userSocketMap.delete(userId);
        break;
      }
    }
  };
  //? Direct Messgae
  const sendMessage = async (message) => {
    const senderSocketid = userSocketMap.get(message.sender);
    const recipientSocketid = userSocketMap.get(message.recipient);

    const createdMessage = await Message.create(message);
    const messageData = await Message.findById(createdMessage._id)
      .populate("sender", "id email firstName lastName image color")
      .populate("recipient", "id email firstName lastName image color");

    if (recipientSocketid) {
      io.to(recipientSocketid).emit("recieveMessage", messageData);
    }
    if (senderSocketid) {
      io.to(senderSocketid).emit("recieveMessage", messageData);
    }
  };

  //? channel message
  const sendChannelMessage = async (message) => {
    const { channelId, sender, content, messageType, fileUrl } = message;
    const createdMessage = await Message.create({
      sender,
      recipient: null,
      content,
      messageType,
      fileUrl,
      timeStamp: new Date(),
    });
    //createdMessage.save();
    const messageData = await Message.findById(createdMessage._id).populate(
      "sender",
      "id email firstName lastName image color"
    );
    await Channel.findByIdAndUpdate(channelId, {
      $push: { messages: createdMessage._id },
    });
    const channel = await Channel.findById(channelId).populate("members");
    const finalData = { ...messageData._doc, channelId: channel._id };
    if (channel && channel.members) {
      channel.members.forEach((member) => {
        const memberSocketId = userSocketMap.get(member._id.toString());

        if (memberSocketId) {
          io.to(memberSocketId).emit("recieve-channel-message", finalData);
        }
      });
      const adminSocketId = userSocketMap.get(channel.admin._id.toString());
      if (adminSocketId) {
        io.to(adminSocketId).emit("recieve-channel-message", finalData);
      }
    }
  };

  //? Main connection
  io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;
    if (userId) {
      userSocketMap.set(userId, socket.id);
      console.log(`User connected: ${userId} with socket Id: ${socket.id}`);
    } else {
      console.log(`User id not provided`);
    }
    socket.on("sendMessage", sendMessage);
    socket.on("send-channel-message", sendChannelMessage);
    socket.on("disconnect", () => disconnect(socket));
  });
};

export default setupSpcket;
