import { fileTypeFromFile, crypto, dotenv, axios, FileToken, generateToken, CloudConvert,fs, promisify, gfsProcessed, allowedMimes } from '../utils/coreModules.js';

dotenv.config();
const unlinkAsync = promisify(fs.unlink);

const cloudConvert = new CloudConvert(process.env.CLOUDC_APIK2);

export const convertFile = async (req, res) => {
  let inputFilePath;
  try {
    // 1. Validate input
    if (!req.file || !req.body.outputFormat || !req.body.conversionType) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    // 2. File validation on disk
    inputFilePath = req.file.path;                       

    const fileInfo = await fileTypeFromFile(inputFilePath);

    const allowed = [
  ...allowedMimes.documents,
  ...allowedMimes.spreadsheets,
  ...allowedMimes.presentations,
  ...allowedMimes.archives.filter(type => type === 'application/zip'),
];

    if (!fileInfo || !allowed.includes(fileInfo.mime)) {
      await unlinkAsync(inputFilePath);
      return res.status(400).json({ error: 'Invalid file type' });
    }

    // 3. Prepare names
    const originalName = req.file.originalname
      .replace(/[^a-zA-Z0-9-_.]/g, '_')
      .slice(0, 100);
    const outputFormat = req.body.outputFormat.replace(/[^a-z]/gi, '');

    // 4. Create CloudConvert job
    const job = await cloudConvert.jobs.create({
      tasks: {
        'import-upload': { operation: 'import/upload' },
        'convert-file': {
          operation: 'convert',
          input: ['import-upload'],
          output_format: outputFormat,
          engine: 'libreoffice'
        },
        'export-url': { operation: 'export/url', input: ['convert-file'] }
      }
    });

    // 5. Upload to CloudConvert from disk
    const uploadTask = job.tasks.find(t => t.name === 'import-upload');
    await cloudConvert.tasks.upload(
      uploadTask,
      fs.createReadStream(inputFilePath),
      originalName
    );

    // 6. Wait for conversion & get download URL
    const completedJob = await cloudConvert.jobs.wait(job.id);
    const exportTask = completedJob.tasks.find(t => t.name === 'export-url');
    const downloadUrl = exportTask.result.files[0].url;

    // 7. Download converted file
    const downloadResponse = await axios.get(downloadUrl, {
      responseType: 'stream',
      timeout: 30000
    });

    // 8. Store converted file in GridFS
    const uniqueName = `${originalName}_${crypto.randomBytes(4).toString('hex')}.${outputFormat}`;
    const processedStream = gfsProcessed.openUploadStream(uniqueName, {
      contentType: `application/${outputFormat}`
    });
    downloadResponse.data.pipe(processedStream);

    await new Promise((resolve, reject) => {
      processedStream.on('finish', resolve);
      processedStream.on('error', reject);
    });

    // 9. Generate and store access token
    const token = generateToken(processedStream.id.toString(), req.ip);
    await FileToken.create({
      token,
      fileId: processedStream.id,
      expiresAt: new Date(Date.now() + 5 * 1000)
    });

    // 10. Clean up the original upload from disk
    await unlinkAsync(inputFilePath);

    // 11. Respond
    res.json({
      success: true,
      token,
      fileName: uniqueName,
      outputFormat
    });

  } catch (err) {
  console.error(' Conversion error:', err);

  if (inputFilePath) {
    try {
      await unlinkAsync(inputFilePath);
      console.log(`[${new Date().toISOString()}] 🗑️ Temp file removed: ${inputFilePath}`);
    } catch (deleteErr) {
      console.warn(` !.Failed to delete temp file: ${inputFilePath}`, deleteErr.message);
    }
  } else {
    console.warn(` !.inputFilePath is not defined, skipping temp file cleanup.`);
  }

  res.status(500).json({ error: 'Conversion failed', details: err.message });
}
};
