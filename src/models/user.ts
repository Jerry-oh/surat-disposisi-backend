import mongoose from "mongoose";
import { Role } from "../enums/role.enum";
import bcrypt from "bcrypt";

export interface User extends mongoose.Document {
  name: string;
  password: string;
  username: string;
  email: string;
  phone_number: number;
  role: string;
}

const userSchema = new mongoose.Schema<User>({
  name: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  username: { type: String, required: false },
  email: { type: String, required: false },
  phone_number: { type: Number, required: false },
  role: {
    type: String,
    required: true,
  },
});

userSchema.pre<User>("save", async function (next) {
  if (!this.isModified("password")) {
    next();
    return;
  }

  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(this.password, salt);
  this.password = hash;
  next();
});

export default mongoose.model<User>("User", userSchema);
