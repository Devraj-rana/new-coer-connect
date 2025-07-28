import mongoose, { Connection } from "mongoose";

let isConnected: Connection | boolean = false;

const connectDB = async () => {
    if (isConnected) {
        console.log("MongoDB already connected");
        return isConnected;
    }
    
    try {
        // Check if MONGO_URI exists
        if (!process.env.MONGO_URI) {
            throw new Error("MONGO_URI is not defined in environment variables");
        }

        const res = await mongoose.connect(process.env.MONGO_URI);
        isConnected = res.connection;
        console.log("MongoDB connected successfully to:", res.connection.name);
        return isConnected;
    } catch (error) {
        console.error("MongoDB connection error:", error);
        throw error;
    }
}

export default connectDB;