import mongoose from "mongoose";
import { Role } from "../enums/role.enum";

interface Letter {
  creator: string;
  to: string[];
  priority: string[];
  subject: string;
  description: string;
}

const letterSchema = new mongoose.Schema<Letter>({
  creator: { type: String, required: true },
  to: { type: [String], required: true },
  priority: { type: [String], required: true },
  subject: { type: String, required: true },
  description: { type: String, required: true },
});

export default mongoose.model<Letter>("Letter", letterSchema);
