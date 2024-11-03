import jwt from "jsonwebtoken";
import user from "../Models/userModel.js";
import { compare } from "bcrypt";
import { renameSync, unlinkSync } from "fs";
const maxAge = 3 * 24 * 60 * 60 * 1000;
const createToken = (email, userId) => {
  return jwt.sign({ email, userId }, process.env.JWT_KEY, {
    expiresIn: maxAge,
  });
};
export const signUp = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).send("Email and passsword is required");
    }
    const newUser = await user.create({ email, password });
    res.cookie("jwt", createToken(email, newUser.id), {
      maxAge,
      secure: true,
      sameSite: "none",
    });
    return res.status(201).send({
      user: {
        id: newUser.id,
        email: newUser.email,
        profileSetup: newUser.profileSetup,
      },
    });
  } catch (error) {
    console.log({ error });
    return res.status(500).send("Internal Server Error");
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).send("Email and passsword is required");
    }
    const loggedInUser = await user.findOne({ email });
    if (!loggedInUser) {
      return res.status(404).send("User not found");
    }
    const checkPassword = await compare(password, loggedInUser.password);
    if (!checkPassword) {
      return res.status(404).send("Invalid credentials");
    }
    res.cookie("jwt", createToken(email, loggedInUser.id), {
      maxAge,
      secure: true,
      sameSite: "none",
    });
    return res.status(200).send({
      user: {
        id: loggedInUser.id,
        email: loggedInUser.email,
        profileSetup: loggedInUser.profileSetup,
        firstName: loggedInUser.firstName,
        lastName: loggedInUser.lastName,
        image: loggedInUser.image,
        color: loggedInUser.color,
      },
    });
  } catch (error) {
    console.log({ error });
    return res.status(500).send("Internal Server Error");
  }
};

export const logout = async (req, res, next) => {
  try {
    res.cookie("jwt", "", { maxAge: 1, secure: true, sameSite: "none" });
    return res.status(200).send({ message: "Logged out successfully" });
  } catch (error) {
    console.log({ error });
    return res.status(500).send("Internal Server Error");
  }
};

export const getUserInfo = async (req, res, next) => {
  try {
    const userId = req.userId;
    const userData = await user.findById(userId);
    if (!userData) {
      return res.status(403).send("User not found");
    }
    return res.status(200).send({
      id: userData.id,
      email: userData.email,
      profileSetup: userData.profileSetup,
      firstName: userData.firstName,
      lastName: userData.lastName,
      image: userData.image,
      color: userData.color,
    });
  } catch (error) {
    console.log({ error });
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { firstName, lastName, color } = req.body;
    if (!firstName || !lastName) {
      return res
        .status(404)
        .send("First name and last name and color is required");
    }

    const userData = await user.findByIdAndUpdate(
      userId,
      {
        firstName,
        lastName,
        color,
        profileSetup: true,
      },
      { new: true, runValidators: true }
    );
    return res.status(200).send({
      id: userData.id,
      email: userData.email,
      profileSetup: userData.profileSetup,
      firstName: userData.firstName,
      lastName: userData.lastName,
      image: userData.image,
      color: userData.color,
    });
  } catch (error) {
    console.log({ error });
  }
};
export const addProfileImage = async (req, res, next) => {
  try {
    const userId = req.userId;
    if (!req.file) {
      response.status(404).send({ message: "File is required" });
    }

    const date = Date.now();
    let fileName = "uploads/profiles/" + date + req.file.originalname;
    renameSync(req.file.path, fileName);
    const userData = await user.findByIdAndUpdate(
      userId,
      {
        image: fileName,
      },
      { new: true, runValidators: true }
    );
    return res.status(200).send({
      image: userData.image,
    });
  } catch (error) {
    console.log({ error });
  }
};

export const removeProfileImage = async (req, res, next) => {
  try {
    const userId = req.userId;
    const findUser = await user.findById(userId);
    if (!findUser) {
      return res.status(404).send("User not found");
    }
    if (findUser.image) {
      unlinkSync(findUser.image);
    }
    findUser.image = null;
    await findUser.save();
    return res
      .status(200)
      .send({ message: "Profile image deleted successfully" });
  } catch (error) {
    console.log({ error });
  }
};
