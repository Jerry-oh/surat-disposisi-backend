import express from "express";
import { letterController } from "../controllers/letter.controller";
import { verifyToken } from "../middleware/auth.middleware";
const router = express.Router();

router.post("/", verifyToken, letterController.createLetter);
router.put(
  "/:letterId/recipient-checked/:status",
  verifyToken,
  letterController.updateCheckedStatus
);

router.get(
  "/userResponseLetter/:responseStatus",
  verifyToken,
  letterController.getUserResponseLetter
);
router.put(
  "/:letterId/recipient-read",
  verifyToken,
  letterController.updateRecipientRead
);
router.put(
  "/:letterId/status/:status",
  verifyToken,
  letterController.updateLetterStatus
);
router.get("/", verifyToken, letterController.getAllLetters);
router.get(
  "/current-user/",
  verifyToken,
  letterController.getLettersForCurrentUser
);
router.get(
  "/userCreatedLetters/:letterStatus",
  verifyToken,
  letterController.getUserCreatedLetter
);
export default router;
