import { Request, Response } from "express";
import User from "../models/user";
import { Role } from "../enums/role.enum";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { AuthRequest } from "../middleware/auth.middleware";

export const register = async (req: Request, res: Response) => {
  const { nik, name, password, role } = req.body;
  let priority: number | undefined;
  try {
    const existingUser = await User.findOne({ nik });
    if (existingUser) {
      return res.status(400).send("NIK already in use");
    }
    let found: boolean = false;

    for (const x of Object.values(Role)) {
      if (role === x.roleName) {
        found = true;
        priority = x.priority;
        break;
      }
    }
    if (!found) {
      return res
        .status(400)
        .send(
          "Invalid role value. Allowed values: " +
            Object.values(Role).join(", ")
        );
    }
    const newUser = new User({ nik, name, password, role, priority });
    await newUser.save();
    res.send("User registered successfully!");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error registering user");
  }
};

export const login = async (req: Request, res: Response) => {
  const { nik, password } = req.body;

  try {
    const user = await User.findOne({ nik }).select("+password");
    if (!user) {
      return res.status(401).json({ message: "Invalid name or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid name or password" });
    }
    const payload = {
      nik: user.nik,
      userId: user._id,
      role: user.role,
      name: user.name,
      email: user?.email,
      username: user?.username,
      priority: user.priority,
    };
    const secret: string = process.env.JWT_SECRET!;

    const token = jwt.sign(payload, secret, { expiresIn: "90d" });

    res.json({ token: token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const listUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find();

    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getAllUsers = async (req: AuthRequest, res: Response) => {
  try {
    const users = await User.find().select("name role");
    res.json({ status: "Success", data: users });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const updateUserData = async (req: AuthRequest, res: Response) => {
  try {
    const {
      nik,
      updatedName,
      updatedNik,
      updatedRole,
      updatedPhoneNum,
      updatedPas,
    } = req.body;
    const user = await User.findOne({ nik }).select("+password");
    if (!user)
      return res
        .status(404)
        .json({ status: "failed", message: "there is no user with that nik" });
    user.name = updatedName ?? user.name;
    user.nik = updatedNik ?? user.nik;
    user.role = updatedRole ?? user.nik;
    user.phone_number = updatedPhoneNum ?? user.phone_number;
    user.password = updatedPas ?? user.password;
    await user.save();
    res
      .status(200)
      .json({ status: "success", message: "user updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const deleteUser = async (req: AuthRequest, res: Response) => {
  try {
    const { nik } = req.body;
    const user = await User.deleteOne({ nik });
    if (user.deletedCount == 0)
      return res
        .status(404)
        .json({ status: "failed", message: "there is no user with that nik" });
    res
      .status(204)
      .json({ status: "success", message: "user deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};
