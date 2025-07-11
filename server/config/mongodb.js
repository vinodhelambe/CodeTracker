import dotenv from 'dotenv';
dotenv.config();
import mongoose from "mongoose";

const mongodbURI = process.env.MONGODB_URI ;



const connectDB = async () => {
    try {
        mongoose.connection.on('connected',()=>{
            console.log("Database Connected");
        })
        await mongoose.connect(mongodbURI);
    } catch (error) {
        console.error('MongoDB connection error:', error);
        throw error;
    }
};

export default connectDB;