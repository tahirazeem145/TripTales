import mongoose from 'mongoose';

/**
 * Connect to MongoDB database
 * Uses process.env.MONGO_URI loaded by dotenv
 */
export const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;

    // Check if user still has the placeholder
    if (!mongoUri || mongoUri.includes('<username>') || mongoUri.includes('<password>')) {
      console.warn(
        '\n⚠️  [MongoDB Warning]: Please update MONGO_URI in your server/.env file with your real MongoDB Atlas connection string.\n'
      );
      return;
    }

    const conn = await mongoose.connect(mongoUri);
    console.log(`✅ [MongoDB Connected]: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ [MongoDB Error]: ${error.message}`);
    process.exit(1);
  }
};
