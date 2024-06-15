import { Account } from "../models/account.model.js";

const createAccount = async (req, res) => {
    try {

        const { accountNumber, sortCode, status } = req.body;
        if(!accountNumber || !sortCode || !status) {
            return res.status(400).json({message: "All fields are required."});
        }

        const account = new Account({
            businessId: req.business._id,
            accountNumber,
            sortCode,
            status
        })

        await account.save();
        res.status(201).json(account);
        
    } catch (error) {
        console.log("Error while creating account: ", error.message);
        res.status(500).json({message: "Internal server error."});
    }
}


const updateAccountStatus = async (req,res) => {
    const {status} = req.body;
    const {accoundId} = req.params;

    if(!status) {
        return res.status(400).json({message: "Status is required."});
    }

    try {

        const account = await Account.findById(accoundId);
        if(!account) {
            return res.status(404).json({message: "Account not found."});
        }

        account.status = status;
        await account.save();
        res.status(200).json(account);
        
    } catch (error) {
        console.log("Error while updating account status: ", error.message);
        res.status(500).json({message: "Internal server error."});   
    }
}

const updateTransactionControl = async (req,res) => {
    const { allowCredit, allowDebit, setDailyWithdrawalLimit } = req.body;
    const { accoundId } = req.params;

    try {
        const account = await Account.findById(accoundId);

        if(! accoundId){
            return res.status(404).json({message: "Account not found."});
        }

        if(allowCredit !== undefined) account.allowCredit = allowCredit;
        if(allowDebit !== undefined) account.allowDebit = allowDebit;
        if(setDailyWithdrawalLimit !== undefined) account.dailyWithdrawalLimit = setDailyWithdrawalLimit;

        await account.save();

        res.status(200).json(account);

    } catch (error) {
        console.log("Error while updating transaction control: ", error.message);
        res.status(500).json({message: "Internal server error."});
    }
}

const getAccountBalance = async (req,res) => {
    const {accoundId} = req.params;

    try {

        const account = await Account.findById(accoundId);
        if(!account) {
            return res.status(404).json({message: "Account not found."});
        }

        res.status(200).json(account.balance);
        
    } catch (error) {
        console.log('Error while getting account balance: ', error.message);
        res.status(500).json({message: "Internal server error."});
    }
}

export { createAccount, updateAccountStatus, updateTransactionControl, getAccountBalance}


