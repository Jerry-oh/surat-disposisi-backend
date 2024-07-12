import mongoose from "mongoose";
import { Role } from "../enums/role.enum";
import bcrypt from "bcrypt";

export interface User extends mongoose.Document {
  nik: number;
  name: string;
  password: string;
  username: string;
  email: string;
  phone_number: number;
  role: Role;
  priority: number;
}

const userSchema = new mongoose.Schema<User>(
  {
    priority: {
      type: Number,
      required: true,
      enum: Object.values(Role).map((Role) => Role.priority),
    },
    nik: { type: Number, required: true, unique: true },
    name: { type: String, required: true },
    password: { type: String, required: true, select: false },
    username: { type: String, required: false },
    email: { type: String, required: false },
    phone_number: { type: Number, required: false },
    role: {
      type: String,
      required: true,
    },
  },
  { versionKey: false }
);

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
