import mongoose from "mongoose";
import { Role } from "../enums/role.enum";

interface User {
  name: string;
  username: string;
  email: string;
  phone_number: number;
  role: string;
}

const userSchema = new mongoose.Schema<User>({
  name: { type: String, required: true },
  username: { type: String, required: false, unique: true },
  email: { type: String, required: true, unique: true },
  phone_number: { type: Number, required: true },
  role: {
    type: String,
    required: true,
    validate: {
      validator: (v: string) => Role.hasOwnProperty(v),
      message:
        "Invalid role value. Allowed values: " + Object.values(Role).join(", "),
    },
  },
});

export default mongoose.model<User>("User", userSchema);
