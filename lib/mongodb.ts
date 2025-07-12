import mongoose from "mongoose"

const MONGO_URI = process.env.MONGO_URI

if (!MONGO_URI) {
  console.log("Warning: MONGO_URI is not defined. Using in-memory mock data.")
}

let cached: any = null

async function dbConnect() {
  if (!MONGO_URI) {
    console.log("=> using mock database")
    return null
  }
  
  if (cached) {
    return cached
  }

  const opts = {
    bufferCommands: false,
  }

  cached = await mongoose.connect(MONGO_URI, opts)
  return cached
}

export default dbConnect
