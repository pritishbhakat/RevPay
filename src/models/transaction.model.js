import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
    accountId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Account",
        required: true,
    },
    accountNumber:{
        type: String,
        required: true
    },
    sortCode:{
        type: String,
        required: true
    }
    ,
    type: {
        type: String,
        enum: ["DEPOSIT", "WITHDRAWAL"],
        required: true
    },
    amount: {
        type: Number,
        required: true,
    },
}, { timestamps: true })

const Transaction = mongoose.model("Transaction", transactionSchema);

export { Transaction }