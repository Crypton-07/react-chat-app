import mongoose from "mongoose";
import user from "../Models/userModel.js";
import Message from "../Models/messagesModel.js";

export const searchContact = async (req, res, next) => {
  try {
    const { searchTerm } = req.body;
    if (searchTerm === undefined || searchTerm === null) {
      return res.status(400).send("Search term is required");
    }
    const sanetizeSearchTerm = searchTerm.replace(
      /[.*+?^${}()|[\][\\]]/g,
      "\\$&"
    );
    // To make regex case-insensitive here we are passing "i" as second argument
    const regex = new RegExp(sanetizeSearchTerm, "i");
    const contacts = await user.find({
      $and: [{ _id: { $ne: req.userId } }],
      $or: [{ firstName: regex }, { lastName: regex }, { email: regex }],
    });

    return res.status(200).json({ contacts });
  } catch (error) {
    console.log({ error });
    return res.status(500).send("Internal Server Error");
  }
};

export const getAllContacts = async (req, res, next) => {
  try {
    const users = await user.find(
      { _id: { $ne: req.userId } },
      "firstName lastName _id"
    );
    const contacts = users.map((user) => ({
      label: user.firstName ? `${user.firstName} ${user.lastName}` : user.email,
      value: user._id,
    }));

    return res.status(200).json({ contacts });
  } catch (error) {
    console.log({ error });
    return res.status(500).send("Internal Server Error");
  }
};

export const getContactsForDmList = async (req, res, next) => {
  try {
    let { userId } = req;
    userId = new mongoose.Types.ObjectId(userId);
    const contacts = await Message.aggregate([
      {
        $match: {
          $or: [{ sender: userId }, { recipient: userId }],
        },
      },
      {
        $sort: { timeStamp: -1 },
      },
      {
        $group: {
          _id: {
            $cond: {
              if: { $eq: ["$sender", userId] },
              then: "$recipient",
              else: "$sender",
            },
          },
          lastMessageTime: { $first: "$timeStamp" },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "contactInfo",
        },
      },
      {
        $unwind: "$contactInfo",
      },
      {
        $project: {
          _id: 1,
          lastMessageTime: 1,
          email: "$contactInfo.email",
          firstName: "$contactInfo.firstName",
          lastName: "$contactInfo.lastName",
          image: "$contactInfo.image",
          color: "$contactInfo.color",
        },
      },
      {
        $sort: {
          lastMessageTime: -1,
        },
      },
    ]);
    return res.status(200).json({ contacts });
  } catch (error) {
    console.log({ error });
    return res.status(500).send("Internal Server Error");
  }
};
