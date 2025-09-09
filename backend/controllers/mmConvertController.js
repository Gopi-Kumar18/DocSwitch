// backend/controllers/multimediaConverter.js
import { fileTypeFromFile, crypto, dotenv, axios, FileToken, generateToken, CloudConvert, fs, promisify, gfsProcessed } from '../utils/coreModules.js';

dotenv.config();
const unlinkAsync = promisify(fs.unlink);

const cloudConvert = new CloudConvert(process.env.CLOUDC_APIK);

// Allowed MIME types for multimedia uploads (common set)
const ALLOWED_MIMES = [
  // video
  'video/mp4', 'video/webm', 'video/quicktime', 'video/x-matroska', 'video/x-msvideo', 'video/3gpp',
  // audio
  'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/x-wav', 'audio/x-flac', 'audio/flac', 'audio/mp4', 'audio/x-m4a', 'audio/wma',
  // images (GIF)
  'image/gif'
];

export const multimediaConverter = async (req, res) => {
  let inputFilePath;
  try {
    // 1. Validate input presence
    if (!req.file || !req.body.outputFormat) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    // 2. Determine temp file path and MIME
    inputFilePath = req.file.path; // multer disk storage path
    const fileInfo = await fileTypeFromFile(inputFilePath);

    if (!fileInfo || !ALLOWED_MIMES.includes(fileInfo.mime)) {
      // remove temp upload and respond
      try { await unlinkAsync(inputFilePath); } catch (e) {}
      return res.status(400).json({ error: 'Invalid file type' });
    }

    // 3. sanitize names and formats
    const originalName = (req.file.originalname || 'file')
      .replace(/[^a-zA-Z0-9-_.]/g, '_')
      .slice(0, 100);
    const outputFormat = String(req.body.outputFormat).replace(/[^a-z0-9]/gi, '').toLowerCase();

    // 4. Prepare CloudConvert job using ffmpeg engine
    const job = await cloudConvert.jobs.create({
      tasks: {
        'import-upload': { operation: 'import/upload' },
        'convert-file': {
          operation: 'convert',
          input: ['import-upload'],
          output_format: outputFormat,
          engine: 'ffmpeg' // use ffmpeg for multimedia conversions
        },
        'export-url': { operation: 'export/url', input: ['convert-file'] }
      }
    });

    // 5. Upload original file to CloudConvert from disk
    const uploadTask = job.tasks.find(t => t.name === 'import-upload');
    await cloudConvert.tasks.upload(uploadTask, fs.createReadStream(inputFilePath), originalName);

    // 6. Wait for conversion & extract download URL
    const completedJob = await cloudConvert.jobs.wait(job.id);
    const exportTask = completedJob.tasks.find(t => t.name === 'export-url');

    if (!exportTask || !exportTask.result || !exportTask.result.files || !exportTask.result.files[0]) {
      // cleanup input
      try { await unlinkAsync(inputFilePath); } catch(e) {}
      return res.status(500).json({ error: 'Conversion produced no output' });
    }

    const downloadUrl = exportTask.result.files[0].url;

    // 7. Download converted file (stream)
    const downloadResponse = await axios.get(downloadUrl, { responseType: 'stream', timeout: 60000 });

    // 8. Store converted file in GridFS
    const uniqueName = `${originalName}_${crypto.randomBytes(4).toString('hex')}.${outputFormat}`;
    const contentType = downloadResponse.headers['content-type'] || `application/octet-stream`;

    const processedStream = gfsProcessed.openUploadStream(uniqueName, { contentType });
    downloadResponse.data.pipe(processedStream);

    // wait for GridFS write to finish (or fail)
    await new Promise((resolve, reject) => {
      processedStream.on('finish', resolve);
      processedStream.on('error', reject);
    });

    // 9. Generate and store access token (bind to client IP)
    const token = generateToken(processedStream.id.toString(), req.ip);

    // If your FileToken model requires userId, include it (safe check)
    const fileTokenDoc = {
      token,
      fileId: processedStream.id,
      expiresAt: new Date(Date.now() + (15 * 1000)) // 15 minutes
    };
    if (req.session?.user?._id) fileTokenDoc.userId = req.session.user._id;

    await FileToken.create(fileTokenDoc);

    // 10. Clean up the original temp upload file from uploads/
    try { await unlinkAsync(inputFilePath); } catch (e) {
      console.warn('Failed to remove temp upload:', inputFilePath, e?.message);
    }

    // 11. Respond to client
    return res.json({
      success: true,
      token,
      fileName: uniqueName,
      outputFormat
    });

  } catch (err) {
    console.error('Multimedia conversion error:', err);

    // attempt to remove temp file if present
    if (inputFilePath) {
      try {
        await unlinkAsync(inputFilePath);
        console.log(`[${new Date().toISOString()}] 🗑️ Temp file removed: ${inputFilePath}`);
      } catch (deleteErr) {
        console.warn(`Failed to delete temp file: ${inputFilePath}`, deleteErr.message);
      }
    } else {
      console.warn('inputFilePath was not defined, skipping temp cleanup.');
    }

    return res.status(500).json({ error: 'Conversion failed', details: err.message });
  }
};
