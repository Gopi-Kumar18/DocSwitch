import mongoose from 'mongoose';
import { GridFSBucket } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();

let gfsProcessed;

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;

    // Set TTL value expiry
    const ttlSeconds = 5;
    const processedFiles = db.collection('processed.files');

    // Checking if any existing indexes
    const indexes = await processedFiles.indexes();
    const existingTTLIndex = indexes.find(index => index.name === 'uploadDate_1');

    if (existingTTLIndex) {
      if (existingTTLIndex.expireAfterSeconds !== ttlSeconds) {
        console.log(`⚠️ TTL index exists with different expiry (${existingTTLIndex.expireAfterSeconds}s), dropping...`);
        await processedFiles.dropIndex('uploadDate_1');
        console.log(' Old TTL index dropped.');
      } else {
        console.log(` TTL index already set to ${ttlSeconds} seconds. No action needed.`);
      }
    }


    const hasCorrectIndex = indexes.some(
      i => i.name === 'uploadDate_1' && i.expireAfterSeconds === ttlSeconds );
    if (!hasCorrectIndex) {
      await processedFiles.createIndex(
        { uploadDate: 1 },
        { expireAfterSeconds: ttlSeconds, name: 'uploadDate_1' }
      );
      console.log(` TTL index (${ttlSeconds} sec) created on processed.files`);
    }

    gfsProcessed = new GridFSBucket(db, { bucketName: 'processed' });

  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  }
};

export { connectDB, gfsProcessed };
