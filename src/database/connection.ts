import mongoose from 'mongoose'

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/reports'

export const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI)
    console.log('MongoDB conect')
  } catch (error) {
    console.error('Error on connect:', error)
    process.exit(1)
  }
}

export const disconnectDB = async () => {
  try {
    await mongoose.disconnect()
    console.log('disconect database')
  } catch (error) {
    console.error('error on discenect database:', error)
  }
}
