import { NextFunction, Request, Response } from "express";
import Letter, { Recipient, UserRecipient } from "../models/letter";
import mongoose from "mongoose";
import { AuthRequest } from "../middleware/auth.middleware";
import { RecipientCheckedStatus } from "../enums/recipient-checked-status.enum";
import { LetterStatus } from "../enums/letter-status.enum";

async function createLetter(
  creator: string,
  recipients: Recipient[],
  subject: string,
  description: string
) {
  const formattedRecipients = recipients.map((recipient, i) => {
    return {
      ...recipient,
      checked:
        recipient.priority === 1
          ? RecipientCheckedStatus.REQUEST
          : RecipientCheckedStatus.PENDING,
    };
  });

  const newLetter = new Letter({
    creator,
    recipients: formattedRecipients,
    subject,
    description,
  });

  await newLetter.save();
}

async function updateRecipientRead(letterId: string, userId: string) {
  const letter = await Letter.findById(letterId);

  if (!letter) {
    throw new Error("Letter not found.");
  }

  const recipientIndex = letter.recipients.findIndex(
    (recipient) => recipient.userId.toString() === userId
  );

  if (recipientIndex === -1) {
    throw new Error("User is not a recipient of this letter.");
  }

  letter.recipients[recipientIndex].read = true;
  await letter.save();
}

async function updateCheckedStatus(
  letterId: string,
  userId: string,
  recipientCheckedStatus: string
) {
  const letter = await Letter.findById(letterId);

  if (!letter) {
    throw new Error("Letter not found.");
  }

  const recipientIndex = letter.recipients.findIndex(
    (recipient) => recipient.userId.toString() === userId
  );
  if (recipientIndex === -1) {
    throw new Error("User is not a recipient of this letter.");
  }
  if (
    letter.recipients[recipientIndex].checked !== RecipientCheckedStatus.REQUEST
  ) {
    throw new Error(
      "You can only update status if the current position is request"
    );
  }
  letter.recipients[recipientIndex].checked =
    recipientCheckedStatus as RecipientCheckedStatus;

  if (recipientCheckedStatus === RecipientCheckedStatus.APPROVED) {
    const nextRecipientIndex = letter.recipients.findIndex(
      (recipient) =>
        recipient.priority == letter.recipients[recipientIndex].priority + 1
    );
    if (nextRecipientIndex !== -1) {
      letter.recipients[nextRecipientIndex].checked =
        RecipientCheckedStatus.REQUEST;
    }
  }

  await letter.save();
}

async function updateLetterStatus(letterId: string, letterStatus: string) {
  const letter = await Letter.findById(letterId);

  if (!letter) {
    throw new Error("Letter not found.");
  }
  letter.status = letterStatus as LetterStatus;

  await letter.save();
}

interface RecipientsFilter {
  userId: mongoose.Types.ObjectId;
  checked?: RecipientCheckedStatus;
}
async function getLettersForCurrentUser(
  userId: string,
  checkedStatusRequest: boolean,
  status: LetterStatus
) {
  const recipientsFilter: RecipientsFilter = {
    userId: new mongoose.Types.ObjectId(userId),
  };
  if (checkedStatusRequest === true && status === LetterStatus.ONGOING) {
    recipientsFilter.checked = RecipientCheckedStatus.REQUEST;
  }
  const letters = await Letter.find(
    {
      recipients: {
        $elemMatch: recipientsFilter,
      },
      status: status,
    },
    {
      _id: 1,
      creator: 1,
      dateCreated: 1,
      subject: 1,
      description: 1,
      status: 1,
      priority: 1,
      "recipients.$": 1,
    }
  ).populate(["creator", "recipients.userId"]);

  return letters;
}

async function getAllLetters() {
  const letters = await Letter.find().populate([
    "creator",
    "recipients.userId",
  ]);

  return letters;
}

class LetterController {
  async createLetter(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const creator = req.user?.userId;
      const { recipients, subject, description } = req.body;
      await createLetter(creator, recipients, subject, description);
      res.status(201).json({ message: "Letter created successfully!" });
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json({ error: error.message });
      }
      return res.status(500).json({ error: error });
    }
  }

  async updateCheckedStatus(req: AuthRequest, res: Response) {
    try {
      const { letterId, status } = req.params;
      const userId = req.user?.userId;
      await updateCheckedStatus(letterId, userId, status);
      res.status(200).json({ message: "Recipient checked status updated!" });
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({ error: error.message });
      }
      return res.status(400).json({ error: error });
    }
  }

  async updateRecipientRead(req: AuthRequest, res: Response) {
    try {
      const { letterId } = req.params;
      const userId = req.user?.userId;
      await updateRecipientRead(letterId, userId);
      res.status(200).json({ message: "Recipient read updated!" });
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({ error: error.message });
      }
      return res.status(400).json({ error: error });
    }
  }

  async updateLetterStatus(req: AuthRequest, res: Response) {
    try {
      const { letterId, status } = req.params;
      await updateLetterStatus(letterId, status);
      res.status(200).json({ message: "Letter status updated!" });
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({ error: error.message });
      }
      return res.status(400).json({ error: error });
    }
  }

  async getLettersForCurrentUser(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      const checkedStatusIsRequest: boolean =
        req.query?.checkedStatusIsRequest === "true" ? true : false;
      const letterStatus: LetterStatus =
        (req.query.status as LetterStatus) ?? LetterStatus.ONGOING;
      const letters = await getLettersForCurrentUser(
        userId,
        checkedStatusIsRequest,
        letterStatus
      );
      res.status(200).json({ letters });
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({ error: error.message });
      }
      return res.status(400).json({ error: error });
    }
  }

  async getAllLetters(req: AuthRequest, res: Response) {
    try {
      const letters = await getAllLetters();
      res.status(200).json({ letters });
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({ error: error.message });
      }
      return res.status(400).json({ error: error });
    }
  }
}

export const letterController = new LetterController();
