import { Router } from "express";

import { registerUser, loginUser, tokenValidation, forgetPassword, resetPassword } from "../controllers/user.controller.js";


const router = Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/validateToken").post(tokenValidation);
router.route("/forgetPassword").post(forgetPassword);
router.route("/resetPassword").post(resetPassword);

export default router;