import { Router } from "express";
import {  updateAccountStatus, updateTransactionControl, getAccountBalance} from "../controllers/account.controller.js"


const router = Router();


router.route("/status").put(updateAccountStatus);

router.route("/control").put(updateTransactionControl);

router.route("/balance").get(getAccountBalance);

export default router;