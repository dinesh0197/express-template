import { Router } from "express";
import { authController as Auth } from "./auth.controller";
import { authCheck } from "../../middleware/authentication/verifyJwtToken";

const router = Router();

router.route("/signup").post(Auth.signup);

router.route("/signin").post(Auth.signin);

router.route("/verifyOtp").post(Auth.verifyOtp);

router.route("/resendOtp").post(Auth.resendOtp);

router.route("/updatePassword").post(authCheck(), Auth.updatePassword);

router.route("/forgotPassword").post(Auth.forgotPassword);

router.route("/setPassword").post(Auth.setPassword);

export default router;
