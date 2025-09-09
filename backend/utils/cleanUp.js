
import { fs } from '../utils/coreModules.js';

export const deleteLocalFile = async (filePath) => {
  try {
    await fs.promises.unlink(filePath);
    console.log(`Successfully deleted: ${filePath}\n\n`);
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.log(`File not found: ${filePath}`);
    } else {
      console.error(`Failed to delete ${filePath}:`, error);
      throw error; 
    }
  }
};
