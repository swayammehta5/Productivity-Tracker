const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is not set. Please set it in your Render environment variables.');
    }

    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB Connected Successfully');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    if (error.message.includes('MONGODB_URI')) {
      console.error('⚠️  Please set the MONGODB_URI environment variable in your Render dashboard.');
      console.error('⚠️  Example: mongodb+srv://username:password@cluster.mongodb.net/habit-tracker');
    }
    // Don't exit immediately - let the server start so Render can detect the port
    // The server will still fail on actual API calls, but this helps with deployment
    throw error;
  }
};

module.exports = connectDB;