import { Request, Response } from "express";
import User from "../models/user";
import { Role } from "../enums/role.enum";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const register = async (req: Request, res: Response) => {
  const { name, password, role } = req.body;

  try {
    const existingUser = await User.findOne({ name });
    if (existingUser) {
      return res.status(400).send("Name already in use");
    }
    let found: boolean = false;

    for (const x of Object.values(Role)) {
      if (role === x) {
        found = true;
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

    const newUser = new User({ name, password, role });
    await newUser.save();
    res.send("User registered successfully!");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error registering user");
  }
};

export const login = async (req: Request, res: Response) => {
  const { name, password } = req.body;

  try {
    const user = await User.findOne({ name }).select("password");
    if (!user) {
      return res.status(401).json({ message: "Invalid name or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid name or password" });
    }

    const payload = {
      userId: user._id,
      role: user.role,
      name: user.name,
      email: user?.email,
      username: user?.username,
    };
    const secret: string = process.env.JWT_SECRET!;

    const token = jwt.sign(payload, secret, { expiresIn: "1h" });

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
