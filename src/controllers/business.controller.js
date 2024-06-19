import mongoose from "mongoose";
import { Business } from "../models/business.model.js";
import { options } from "../constants/index.js";
import { Account } from "../models/account.model.js";


const registerBusiness = async (req, res) => {

    let { username, password } = req.body;

    if(!username || !password){
        return res.status(400).json({message: "username and password are required."});
    }


    try {
        //converting into lowercase 
        username = username.toLowerCase();  

        const existingBusiness = await Business.findOne({ username })

        if (existingBusiness) {
            return res.status(400).json({ message: "Business already registered." })
        }


        const business = new Business({ username, password });

        await business.save();

        res
        .status(201)
        .json({ 
            message: "Business created successfully." ,
            username: business.username
        });

    } catch (error) {
        console.log("Error while creating business:", error.message);
        res.status(500).json({ message: "Internal server error." });
    } 
}




const loginBusiness = async (req, res) => {

    const { username, password } = req.body;

    if (!username) {
        res.status(400).json({ message: "username is required." })
    }

    if (!password) {
        res.status(400).json({ message: "password is required." })
    }

    try {

        const business = await Business.findOne({ username });

        if (!business) {
            return res.status(400).json({ message: "Business does not exist." })
        }

        const isPasswordValid = await business.isPasswordCorrect(password);


        if (!isPasswordValid) {
            return res.status(400).json({ message: "Invalid password." })
        }

        const accessToken = await business.generateAccessToken();


        const loggedInBusiness = {
            username: business.username,
        }

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .json({
                business: loggedInBusiness,
                accessToken,
                message: "Business Account logged in successfully.",

            })
            
    } catch (error) {
        console.log("Error while loging in business:", error.message);
        res.status(500).json({ message: "Internal server error." });
    }

}




const logoutBusiness = async (req, res) => {
    try {
        return res
            .status(200)
            .clearCookie("accessToken", options)
            .json({ message: "Business Account logged out successfully." });

    } catch (error) {
        console.log("Error while loging out business:", error.message);
        res.status(500).json({ message: "Internal server error." });
    }
}



const getAccountsDetails = async (req, res) => {
    try {
        const query = await Account.find({
            businessName: req.business.username
        }).select("-__v");

        let accounts = [];
        query.map((q) => {
            const account = {
                businessName: q.businessName,
                accountId: q._id,
                accountNumber: q.accountNumber,
                sortCode: q.sortCode,
                status: q.status,
                balance: q.balance,
                allowCredit: q.allowCredit,
                allowDebit: q.allowDebit,
                dailyWithdrawalAmount: q.dailyWithdrawalAmount,
                dailyWithdrawalLimit: q.dailyWithdrawalLimit,
                lastWithdrawalDate: q.lastWithdrawalDate,

            };
            accounts.push(account);
        })

        res.status(200).json({ accounts: accounts });

    } catch (error) {
        console.log("Error while getting accounts details:", error.message);
        res.status(500).json({ message: "Internal server error." });
    }
}

export { registerBusiness, loginBusiness, logoutBusiness, getAccountsDetails }