import mongoose from 'mongoose'

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI

  if (!uri) {
    throw new Error('MONGODB_URI is not set. Add it to your .env file (see .env.example).')
  }

  mongoose.connection.on('error', (error) => {
    console.error('MongoDB connection error:', error.message)
  })

  await mongoose.connect(uri)
  console.log('MongoDB connected')
}

export const disconnectDB = async () => {
  await mongoose.disconnect()
}
