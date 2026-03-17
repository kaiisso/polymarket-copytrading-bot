import mongoose from 'mongoose';
import { ENV } from './env';
import process from 'process';

// Simple, explicit MongoDB connection using ENV.MONGO_URI
// This avoids any hidden or obfuscated connection strings.
const connectionString: string = ENV.MONGO_URI;

const connectDB = async () => {
    try {
        await mongoose.connect(connectionString);
    } catch (error) {
        // Exit the process if we cannot connect to MongoDB
        process.exit(1);
    }
};

export default connectDB;
