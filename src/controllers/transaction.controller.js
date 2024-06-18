import mongoose from "mongoose";
import { Transaction } from "../models/transaction.model.js";
import { Account } from "../models/account.model.js";

const createTransaction = async (req, res) => {
    const { accountId, type, amount, beneficiaryAccountNumber, beneficiarySortCode} = req.body;

    if(!accountId || !type || !amount || !beneficiaryAccountNumber || !beneficiarySortCode) {
        return res.status(400).json({message: "All fields are required."});
    }

    if(type !== "DEPOSIT" && type !== "WITHDRAWAL"){
        return res.status(400).json({message: "Invalid transaction type."});
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

        if(account.accountNumber !== beneficiaryAccountNumber || account.sortCode !== beneficiarySortCode){
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({message: "Invalid beneficiary account details."});
        }

        if(account.status !== 'ACTIVE'){
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({message: "Account is  inactive."});
        }

        if(type === "DEPOSIT" && !account.allowCredit){
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({message: "Account does not allow deposits."});
        }

        if(type === "WITHDRAWAL" && !account.allowDebit){
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({message: "Account does not allow to withdrawal money."});
        }

        const today = new Date().toDateString();

        if(type === "WITHDRAWAL"){
            if(account.lastWithdrawalDate?.toDateString() !== today){
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
            account.lastWithdrawalDate = new Date();

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

        console.log(`accountId: ${account._id}, accountNumber: ${account.accountNumber}, businessName: ${account.businessName},  Rs${amount} -> ${type}, New Balance: ${account.balance}`);

        await transaction.save({session});

        await session.commitTransaction();

        res.status(201).json({message: `Rs${amount} ${type === "DEPOSIT" ? "deposited" : "withdrawn" } successfully.`});

        
        
    } catch (error) {
        
        await session.abortTransaction();
        console.log("Error while creating transaction: ", error.message);
        res.status(500).json({message: "Internal server error."});

    } finally {
        session.endSession()
    }
}

export { createTransaction };

