
import {fs, path, FileToken} from '../utils/coreModules.js';
import { deleteLocalFile } from '../utils/cleanUp.js';
import { verifyDownloadToken } from '../utils/tokenUtils.js';


export const downloadConvertedFile = async (req, res) => {
  try {
    const { token } = req.query;

    // const clientIp = req.ip;

    const decoded = verifyDownloadToken(token);

    // console.log("Encoded file path :- ",decoded.file,"\n");   //debugging

    if (!decoded?.file) {
      console.log('JWT Verification Failed - Decoded:', decoded,"\n");
      return res.status(401).json({ error: 'Invalid token structure' });
    }
    

    const fileToken = await FileToken.findOne({ token });
    // console.log("databse filepath" , fileToken.filePath);  //debuggin..

    if (!fileToken) {
        return res.status(401).json({ error: 'Token not found' });
      }

     
    if (fileToken.filePath !== decoded.file) {
      return res.status(401).json({ error: 'Invalid file path' });
    }
    

    // 2. Decode file path
    const relativeFilePath = Buffer.from(decoded.file, 'base64url').toString();
    // console.log('Decoded Path:', relativeFilePath,"\n");

    
    if (new Date() > fileToken.expiresAt) {
      return res.status(401).json({ error: 'Token expired' });
    }

    
    const absolutePath = path.join(process.cwd(), relativeFilePath);
    // console.log('Absolute Path:', absolutePath,"\n");
    
    if (!fs.existsSync(absolutePath)) {
      console.log('File not found at:', absolutePath,"\n");
      return res.status(404).json({ error: 'File not found' });
    }


    res.download(absolutePath, async (err) => {
      try {
        
        if (!err) {
          await deleteLocalFile(absolutePath); 
        }
      } catch (err) {
        console.error('Cleanup failed:', err);
      }
    });

  } catch (error) {
    console.error('Download Error:');
    res.status(500).json({ error: error.message });
  }
};


































