import mongoose from 'mongoose';

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;

  if (!uri) {
    throw new Error('MONGODB_URI or MONGO_URI is not set in Environment Variables.');
  }

  if (mongoose.connection.readyState >= 1) {
    return;
  }

  await mongoose.connect(uri);
  console.log('MongoDB connected');
};

export const disconnectDB = async () => {
  await mongoose.disconnect();
};