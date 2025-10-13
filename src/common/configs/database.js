import mongoose from "mongoose";
import { DB_URI } from "./environment.js";

const connectDB = async () => {
    try {
        await mongoose.connect(DB_URI);
        console.log(`Database Connected`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

export default connectDB;
