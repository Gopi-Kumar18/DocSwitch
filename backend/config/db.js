import mongoose from 'mongoose';

const connectDB = async () => {
   await mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB\n'))
  .catch(err => console.error('❌ MongoDB connection error:', err));
};
export default connectDB;