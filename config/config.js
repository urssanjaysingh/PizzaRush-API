import mongoose from "mongoose";
import "colors";

const connectDB = async () => {
  try {
    const url = process.env.MONGO_URI;
    const conn = await mongoose.connect(url);
    console.log(
      `MongoDB Database Connected! ${conn.connection.host}`.green.bold
    );
  } catch (error) {
    console.log(`error: ${error.message}`.red.bold);
  }
};

export default connectDB;
