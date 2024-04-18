import mongoose from "mongoose";
import { RecipientCheckedStatus } from "../enums/recipient-checked-status.enum";
import { LetterStatus } from "../enums/recipient-status.enum";

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
}

interface Letter {
  creator: mongoose.Schema.Types.ObjectId;
  recipients: Recipient[];
  subject: string;
  description: string;
  status: LetterStatus;
}

const letterSchema = new mongoose.Schema<Letter>(
  {
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    recipients: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        priority: { type: Number, required: true },
        checked: { type: String, default: RecipientCheckedStatus.PENDING },
      },
    ],
    subject: { type: String, required: true },
    description: { type: String, required: true },
    status: { type: String, default: LetterStatus.ONGOING },
  },
  { versionKey: false }
);

export default mongoose.model<Letter>("Letter", letterSchema);
