import mongoose from "mongoose"
import dotenv, { config } from "dotenv"

dotenv.config()

export const connectDB = async () => {
    try{
        await mongoose.connect(process.env.MONGO_URI!)
        console.log("MongoDB Connected Successfully")
    } catch (error){
        console.log("MongoDB Connection Error", error)
    }
}