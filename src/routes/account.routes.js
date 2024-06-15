import { Router } from "express";
import {  updateAccountStatus, updateTransactionControl, getAccountBalance} from "../controllers/account.controller.js"


const router = Router();


router.route("/:accoundId/status").put(updateAccountStatus);

router.route("/:accoundId/control").put(updateTransactionControl);

router.route("/:accoundId/balance").get(getAccountBalance);

export default router;