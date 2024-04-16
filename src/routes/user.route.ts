import express from "express";
import { listUsers, login, register } from "../controllers/user.controller";
import { verifyToken } from "../middleware/auth.middleware";
import { verifySuperAdmin } from "../middleware/superadmin.middleware";

const router = express.Router();

router.post("/login", login);
router.post("/register", verifyToken, verifySuperAdmin, register);
router.get("/list-users", verifyToken, verifySuperAdmin, listUsers);

export default router;
