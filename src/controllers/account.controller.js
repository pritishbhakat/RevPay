import mongoose from "mongoose";
import { Account } from "../models/account.model.js";

const createAccount = async (req, res) => {

    const session = await mongoose.startSession();
    session.startTransaction();

    try {

        const { accountNumber, sortCode, status } = req.body;
        if(!accountNumber || !sortCode || !status) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({message: "All fields are required."});
        }

        if(accountNumber.length !== 10) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({message: "Account number must be 10 digits."});
        }

        if(sortCode.length !== 8) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({message: "sortCode must be 8 digits."});
        }

        const existingAccount = await Account.findOne({accountNumber});
        if(existingAccount) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({message: "Account already exists."});
        }


        const account = new Account({
            businessName: req.business.username,
            accountNumber,
            sortCode,
            status
        })

        await account.save({session});
        await session.commitTransaction();

        const accountDetails = {
            accountId: account._id,
            businessName: account.businessName,
            accountNumber: account.accountNumber,
            sortCode: account.sortCode,
            status: account.status,
            balance: account.balance,
            allowCredit: account.allowCredit,
            allowDebit: account.allowDebit,
            dailyWithdrawalAmount: account.dailyWithdrawalAmount,
            dailyWithdrawalLimit: account.dailyWithdrawalLimit,
            lastWithrawalDate: account.lastWithrawalDate
        };

        res
        .status(201)
        .json({
            message: "Account created successfully.",
            accountDetails: accountDetails
        });
        
    } catch (error) {
        await session.abortTransaction();
        console.log("Error while creating account: ", error.message);
        res.status(500).json({message: "Internal server error."});
        
    } finally {
        session.endSession();
    }
}


const updateAccountStatus = async (req,res) => {
    const {status, accountId} = req.body;

    if(!status) {
        return res.status(400).json({message: "Status is required."});
    }

    if(status !== "ACTIVE" && status !== "INACTIVE") {
        return res.status(400).json({message: "Invalid status."});
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {

        const account = await Account.findById(accountId);

        if(!account) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({message: "Account not found."});
        }

        account.status = status;
        await account.save({session});

        await session.commitTransaction();

        res
        .status(200)
        .json({
            message: "Account status updated successfully.",
            status: account.status
        });
        
    } catch (error) {
        await session.abortTransaction();
        console.log("Error while updating account status: ", error.message);
        res.status(500).json({message: "Internal server error."});

    } finally {
        session.endSession();
    }
}

const updateTransactionControl = async (req,res) => {
    const { allowCredit, allowDebit, setDailyWithdrawalLimit, accountId } = req.body;

    if(!accountId){
        return res.status(400).json({message: "Account id is required."});
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const account = await Account.findById(accountId);

        if(! account){
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({message: "Account not found."});
        }

        if(allowCredit !== undefined) account.allowCredit = allowCredit;
        if(allowDebit !== undefined) account.allowDebit = allowDebit;
        if(setDailyWithdrawalLimit !== undefined) account.dailyWithdrawalLimit = setDailyWithdrawalLimit;

        await account.save({session});

        await session.commitTransaction();

        res
        .status(200)
        .json({
            message: "Transaction control updated successfully.",
            allowCredit: account.allowCredit,
            allowDebit: account.allowDebit,
            dailyWithdrawalLimit: account.dailyWithdrawalLimit,
            dailyWithdrawalAmount: account.dailyWithdrawalAmount

        });

    } catch (error) {
        await session.abortTransaction();
        console.log("Error while updating transaction control: ", error.message);
        res.status(500).json({message: "Internal server error."});

    } finally {
        session.endSession();
    }

}

const getAccountBalance = async (req,res) => {
    const {accountId} = req.body;

    if(!accountId) {
        return res.status(400).json({message: "Account id is required."});
    }

    try {

        const account = await Account.findById(accountId);
        if(!account) {
            return res.status(404).json({message: "Account not found."});
        }

        res
        .status(200)
        .json({balance:account.balance});
        
    } catch (error) {
        console.log('Error while getting account balance: ', error.message);
        res.status(500).json({message: "Internal server error."});
    }
}

export { createAccount, updateAccountStatus, updateTransactionControl, getAccountBalance}


