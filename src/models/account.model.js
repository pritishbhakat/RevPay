import mongoose from "mongoose";

const accountSchema = new mongoose.Schema({
    businessName: {
        type: String,
        required: true
    },
    accountNumber: {
        type: String,
        required: true,
        unique: true,
        minlength: 10,
        maxlength: 10
    },
    sortCode: {
        type: String,
        required: true,
        minlength: 8,
        maxlength: 8
    },
    balance: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ["ACTIVE", "INACTIVE"],
        default: "ACTIVE"
    },
    allowCredit: {
        type: Boolean,
        default: true
    },
    allowDebit: {
        type: Boolean,
        default: true
    },
    dailyWithdrawalLimit: {
        type: Number,
        default: 10000
    },
    dailyWithdrawalAmount:{
        type: Number,
        default: 0
    },
    lastWithdrawalDate: {
        type: Date,
        default: null
    }
}, { timestamps: true });


export const Account = mongoose.model('Account',accountSchema)