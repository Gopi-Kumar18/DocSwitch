import { dotenv } from '../utils/coreModules.js';
dotenv.config();

import { mongoose } from '../utils/coreModules.js';

const connectAndClean = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log(' Connected to MongoDB');

    const db = mongoose.connection.db;

    const filesCount = await db.collection('processed.files').countDocuments();

    if (filesCount === 0) {
      const deleteResult = await db.collection('processed.chunks').deleteMany({});
      console.log(` Deleted ${deleteResult.deletedCount} orphan chunks from processed.chunks`);
    } else {
      console.log(` Still ${filesCount} files in processed.files. No chunks deleted.`);
    }

    process.exit(0);
  } catch (err) {
    console.error(' Cleanup error:', err);
    process.exit(1);
  }
};

connectAndClean();
