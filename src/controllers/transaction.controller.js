import mongoose from "mongoose";
import { Transaction } from "../models/transaction.model.js";
import { Account } from "../models/account.model.js";

const createTransaction = async (req, res) => {
    const { accountId, type, amount, beneficiaryAccountNumber, beneficiarySortCode} = req.body;

    if(!accountId || !type || !amount || !beneficiaryAccountNumber || !beneficiarySortCode) {
        return res.status(400).json({message: "All fields are required."});
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {

        const account = await Account.findById(accountId).session(session);

        if(!account) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({message: "Account not found."});
        }

        if(account.status !== 'ACTIVE'){
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({message: "Account is not active."});
        }

        if(type === "DEPOSIT" && !account.allowCredit){
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({message: "Account does not allow desposit money."});
        }

        if(type === "WITHDRAWAL" && !account.allowDebit){
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({message: "Account does not allow withdrawal money."});
        }

        const today = new Date().toDateString();

        if(type === "WITHDRAWAL"){
            if(account.lastWithrawalDate?.toDateString() === today){
                account.dailyWithdrawalAmount = 0; 
            }

            if(account.balance < amount){
                await session.abortTransaction();
                session.endSession();
                return res.status(400).json({message: "Insufficient balance."});
            }

            if(account.dailyWithdrawalAmount + amount > account.dailyWithdrawalLimit){
                await session.abortTransaction();
                session.endSession();
                return res.status(400).json({message: "Daily withdrawal limit exceeded."});
            }

            account.dailyWithdrawalAmount += amount;
            account.balance -= amount;

        }

        if(type === "DEPOSIT"){
            account.balance += amount;
        }

        await account.save({session});

        const transaction = new Transaction({
            accountId,
            type,
            amount,
            accountNumber: beneficiaryAccountNumber,
            sortCode: beneficiarySortCode
        })

        await transaction.save({session});

        await session.commitTransaction();
        session.endSession();

        res.status(201).json({message: `Rs ${amount} ${type === "DEPOSIT" ? "deposited" : "withdrawn" } successfully.`});

        
        
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.log("Error while creating transaction: ", error.message);
        res.status(500).json({message: "Internal server error."});
    }
}

export { createTransaction };