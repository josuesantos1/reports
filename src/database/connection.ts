import mongoose from 'mongoose'

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/scr'

export const connectDB = async (useSecondary = false) => {
  try {
    const options: mongoose.ConnectOptions = {
      ...(useSecondary && {
        readPreference: 'secondaryPreferred',
        readConcern: { level: 'local' }
      })
    }

    await mongoose.connect(MONGO_URI, options)

    const readPrefMsg = useSecondary
      ? '(Read Preference: secondaryPreferred)'
      : '(Read Preference: primary)'

    console.log(`MongoDB connected ${readPrefMsg}`)
  } catch (error) {
    console.error('Error connecting to MongoDB:', error)
    process.exit(1)
  }
}

export const connectForReports = async () => {
  return connectDB(true)
}

export const disconnectDB = async () => {
  try {
    await mongoose.disconnect()
    console.log('MongoDB disconnected')
  } catch (error) {
    console.error('Error disconnecting from MongoDB:', error)
  }
}
