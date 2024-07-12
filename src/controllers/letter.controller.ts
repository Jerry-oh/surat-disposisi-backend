import { NextFunction, Request, Response } from "express";
import Letter, { Recipient, UserRecipient } from "../models/letter";
import mongoose from "mongoose";
import { AuthRequest } from "../middleware/auth.middleware";
import { RecipientCheckedStatus } from "../enums/recipient-checked-status.enum";
import { LetterStatus } from "../enums/letter-status.enum";
import User from "../models/user";

async function createLetter(
  creator: string,
  recipients: Recipient[],
  subject: string,
  description: string
) {
  const userList: Array<String> = recipients.map((recipient, i) => {
    return String(recipient.userId);
  });
  const recipientsList = await User.find({ _id: { $in: userList } }).select(
    "priority"
  );
  const formattedRecipients = recipientsList.map((recipient, i) => {
    return {
      userId: recipient.id,
      priority: recipient.priority,
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

  await letter.recipients.sort((recipient1, recipient2) => {
    return recipient1.priority - recipient2.priority;
  });
  const recipientIndex = letter.recipients.findIndex(
    (recipient) => recipient.userId.toString() === userId
  );
  console.log("recipientIndex");
  console.log(recipientIndex);
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
  if (recipientCheckedStatus === RecipientCheckedStatus.REJECTED) {
    letter.status = LetterStatus.FINISHED;
  }
  if (recipientCheckedStatus === RecipientCheckedStatus.APPROVED) {
    console.log("letter.recipients order");
    console.log(letter.recipients);
    const totalLetter = letter.recipients.length;
    const letterApproved = letter.recipients.reduce(
      (accumulator, currentValue) =>
        currentValue.checked == "approved" ? (accumulator += 1) : accumulator,
      0
    );
    letter.progres = letterApproved / totalLetter;
    const nextRecipientIndex = letter.recipients.findIndex(
      (recipient) =>
        recipient.priority >= letter.recipients[recipientIndex].priority &&
        recipient.userId != letter.recipients[recipientIndex].userId
    );
    if (nextRecipientIndex !== -1) {
      letter.recipients[nextRecipientIndex].checked =
        RecipientCheckedStatus.REQUEST;
    }
    if (nextRecipientIndex == -1) {
      letter.status = LetterStatus.FINISHED;
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

async function getUserCreatedLetters(creator: string, status: LetterStatus) {
  const letters = await Letter.find({ creator }).populate("creator");
  console.log("letters");
  console.log(letters);
  return letters;
}

async function getUserResponseLetter(
  userId: string,
  responseStatus: RecipientCheckedStatus
) {
  const recipientsFilter: RecipientsFilter = {
    userId: new mongoose.Types.ObjectId(userId),
    checked: responseStatus,
  };
  const letters = await Letter.find({
    recipients: {
      $elemMatch: recipientsFilter,
    },
  });

  return letters;
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
      progres: 1,
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
  async getUserResponseLetter(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const user = req.user?._id;
      const letterStatus = req.params.responseStatus as RecipientCheckedStatus;
      const letters = await getUserResponseLetter(user, letterStatus);
      res.status(200).json({ data: letters });
    } catch (error) {}
  }
  async getUserCreatedLetter(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const creator = req.user?._id;
      const letterStatus = req.params.letterStatus as LetterStatus;
      const letters = await getUserCreatedLetters(creator, letterStatus);
      res.status(200).json({ data: letters });
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json({ error: error.message });
      }
      return res.status(500).json({ error: error });
    }
  }
  async createLetter(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      console.log("asemmmmm");
      const creator = req.user?._id;
      const { recipients, subject, description } = req.body;
      console.log(creator);
      await createLetter(creator, recipients, subject, description);
      res.status(201).json({ message: "Letter created successfully!" });
    } catch (error) {
      console.log("error");
      console.log(error);
      if (error instanceof Error) {
        return res.status(500).json({ error: error.message });
      }
      return res.status(500).json({ error: error });
    }
  }

  async updateCheckedStatus(req: AuthRequest, res: Response) {
    try {
      const { letterId, status } = req.params;
      const userId = req.user?._id;
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
      const userId = req.user?._id;
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
      const userId = req.user?._id;
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
