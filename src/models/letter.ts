import mongoose from "mongoose";
import { RecipientCheckedStatus } from "../enums/recipient-checked-status.enum";
import { LetterStatus } from "../enums/letter-status.enum";
import { LetterPriority } from "../enums/letter-priority.enum";

// interface Letter {
//   creator: string;
//   to: string[];
//   priority: string[];
//   subject: string;
//   description: string;
// }

// const letterSchema = new mongoose.Schema<Letter>({
//   creator: { type: String, required: true },
//   to: { type: [String], required: true },
//   priority: { type: [String], required: true },
//   subject: { type: String, required: true },
//   description: { type: String, required: true },
// });

export interface UserRecipient {
  _id: string;
  name: string;
  role: string;
}
export interface Recipient {
  userId: UserRecipient | mongoose.Schema.Types.ObjectId;
  priority: number;
  checked: RecipientCheckedStatus;
  read: boolean;
}

interface Letter {
  dateCreated: Date;
  creator: mongoose.Schema.Types.ObjectId;
  recipients: Recipient[];
  subject: string;
  description: string;
  status: LetterStatus;
  priority: LetterPriority;
  progres: number;
}

const letterSchema = new mongoose.Schema<Letter>(
  {
    progres: { type: Number, required: true, default: 0, max: 1, min: 0 },
    dateCreated: { type: Date, required: true, default: Date.now() },
    priority: {
      type: String,
      enum: LetterPriority,
      required: true,
      default: LetterPriority.REGULAR,
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    recipients: {
      type: [
        {
          userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
          },
          priority: { type: Number, required: true },
          checked: { type: String, default: RecipientCheckedStatus.PENDING },
          read: { type: Boolean, default: false },
        },
      ],
      required: true,
    },
    subject: { type: String, required: true, default: " " },
    description: { type: String, required: true, default: " " },
    status: { type: String, default: LetterStatus.ONGOING },
  },
  { versionKey: false }
);

export default mongoose.model<Letter>("Letter", letterSchema);
