import express from "express";
import {
  getAllUsers,
  listUsers,
  login,
  register,
  updateUserData,
} from "../controllers/user.controller";
import { verifyToken } from "../middleware/auth.middleware";
import { verifySuperAdmin } from "../middleware/superadmin.middleware";

const router = express.Router();

router.post("/login", login);
router.get("/list-all-users", verifyToken, getAllUsers);
router.post("/register", register);
router.patch("/updateUserData", verifyToken, verifySuperAdmin, updateUserData);
router.get("/list-users", verifyToken, verifySuperAdmin, listUsers);
export default router;
