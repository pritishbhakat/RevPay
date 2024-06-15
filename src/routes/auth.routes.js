import { Router } from "express";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { registerBusiness, loginBusiness, logoutBusiness } from "../controllers/business.controller.js";
import { createAccount } from "../controllers/account.controller.js";

const router = Router();



router.route("/register").post(registerBusiness);

router.route("/login").post(loginBusiness);

// secured routes
router.route("/create-account").post(verifyToken, createAccount);

router.route("/logout").get(verifyToken, logoutBusiness);



export default router;