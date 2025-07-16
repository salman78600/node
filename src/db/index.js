import mongoose from "mongoose";
import { DB_NAME } from "../constant.js";

const connectDB = async () =>{
    try{
        await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
        console.log('Connected to MongoDB:',);
    }catch (error) {
        console.error('Error connecting to MongoDB:', error);
        throw error;
    }
}
export default connectDB;



