import { Router } from "express";
import Auth from "./auth/auth.route";

const router = Router();

router.use("/auth", Auth);

export default router;
