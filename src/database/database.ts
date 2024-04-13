import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const uri: string = process.env.MONGODB_URI!;
    await mongoose.connect(uri);
    console.log("MongoDB connected successfully!");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  }
};

export default connectDB;
