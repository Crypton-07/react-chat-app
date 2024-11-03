import Channel from "../Models/channelModel.js";
import user from "../Models/userModel.js";

export const createChannel = async (req, res, next) => {
  try {
    const { name, members } = req.body;
    const userId = req.userId;
    const admin = await user.findById(userId);
    if (!admin) {
      return res.status(400).send("Admin user is not found");
    }
    const validMembers = await user.find({ _id: { $in: members } });
    if (validMembers.length !== members.length) {
      return res.status(400).send("Some members are not valid users.");
    }
    const newChannel = new Channel({
      name,
      members,
      admin: userId,
    });
    await newChannel.save();
    return res.status(201).send({ channel: newChannel });
  } catch (error) {
    console.log({ error });
    return res.status(500).send("Internal Server Error");
  }
};

export const getUserChannels = async (req, res, next) => {
  try {
    const userId = req.userId;
    const channels = await Channel.find({
      $or: [{ admin: userId }, { members: userId }],
    }).sort({ updatedAt: -1 });

    return res.status(200).send({ channels });
  } catch (error) {
    console.log({ error });
    return res.status(500).send("Internal Server Error");
  }
};

export const getChannelsMessages = async (req, res, next) => {
  try {
    const { channelId } = req.params;
    const channels = await Channel.findById(channelId).populate({
      path: "messages",
      populate: {
        path: "sender",
        select: "_id firstName lastName email image color",
      },
    });
    if (!channels) {
      return res.status(400).send("channel not found");
    }
    const messages = channels.messages;
    return res.status(200).json({ messages });
  } catch (error) {
    console.log({ error });
    return res.status(500).send("Internal Server Error");
  }
};
