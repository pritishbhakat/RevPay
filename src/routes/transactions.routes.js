import { Router } from "express";
import { createTransaction } from "../controllers/transaction.controller.js"

const router = Router();


router.route("/").post(createTransaction);

export default router;