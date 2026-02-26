import mongoose from "mongoose";

const connectDb = async () => {
  try {
    if (!process.env.MONGODB_URL) {
      throw new Error("MONGODB_URL is missing")
    }
    await mongoose.connect(process.env.MONGODB_URL, {
      serverSelectionTimeoutMS: 30000,
    })
    console.log("DataBase Connected")
  } catch (error) {
    console.log(`DataBase Error: ${error.message}`)
    throw error
  }
}

export default connectDb
