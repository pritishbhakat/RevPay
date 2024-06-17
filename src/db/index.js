import mongoose from "mongoose";
import { DB_NAME } from "../constants/index.js";


const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`);
        console.log(`MongoDB connected !!! DB HOST: ${connectionInstance.connection.host}`)
        console.log(`DB Name: ${connectionInstance.connection.name}`)
        
    } catch (error) {
        console.log("MONGODB ERROR: ", error);
        process.exit(1);
    }
}

export default connectDB;