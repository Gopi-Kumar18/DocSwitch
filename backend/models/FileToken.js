import { mongoose } from '../utils/coreModules.js';

const FileTokenSchema = new mongoose.Schema({
  token: { type: String, required: true, unique: true },
  fileId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
  expiresAt: { type: Date, required: true},
  
});

FileTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model('FileToken', FileTokenSchema);