import mongoose from 'mongoose';
import { DB_NAME } from '../constant.js';


// Connect to MongoDB using Mongoose
const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URL}/${DB_NAME}`,
    );
    console.log('Connected to MongoDB:', connectionInstance.connection.host);
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    throw error;
  }
};
export default connectDB;
