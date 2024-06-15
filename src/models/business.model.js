import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const businessSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: [true, "Password is required"],
    }
}, { timestamps: true });


businessSchema.pre('save', async function (next){
    if(!this.isModified('password')) return next();

    this.password = bcrypt.hashSync(this.password, 10);
    next();
})

businessSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password, this.password);
}

businessSchema.methods.generateAccessToken = function(){
    return jwt.sign({
        _id: this._id,
        username: this.username,
        },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_TOKEN_EXPIRY
        }
    )
}

export const Business = mongoose.model("Business", businessSchema)