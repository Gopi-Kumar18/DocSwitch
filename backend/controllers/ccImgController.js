
import { 
  
  fileTypeFromFile, crypto, dotenv, axios, FileToken, generateToken, CloudConvert, fs, path, promisify, gfsProcessed, allowedMimes

} from '../utils/coreModules.js';

dotenv.config();

const unlinkAsync = promisify(fs.unlink);
const cloudConvert = new CloudConvert(process.env.CLOUDC_APIK1);

export const convertImg = async (req, res) => {
  let inputFilePath;

  try {
    if (!req.file || !req.body.outputFormat || !req.body.conversionType) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    inputFilePath = req.file.path;

    const fileInfo = await fileTypeFromFile(inputFilePath);

     const allowed = [
  ...allowedMimes.documents,
  ...allowedMimes.spreadsheets,
  ...allowedMimes.presentations,
  ...allowedMimes.images.filter(type => type === 'image/png' || type === 'image/jpeg' || type === 'image/bmp' || type === 'image/gif' || type === 'image/tiff' || type === 'image/webp'),
  ...allowedMimes.archives.filter(type => type === 'application/zip'),
];
    

    if (!fileInfo || !allowed.includes(fileInfo.mime)) {
      await unlinkAsync(inputFilePath);
      return res.status(400).json({ error: 'Invalid file type' });
    }

    const outputFormat = req.body.outputFormat.replace(/[^a-z]/gi, '');
    const originalName = req.file.originalname.replace(/[^a-zA-Z0-9-_.]/g, '_').slice(0, 100);
    const ext = path.extname(originalName).slice(1).toLowerCase();
    const outputBasename = path.parse(originalName).name;

    const office = ['docx', 'doc', 'pptx', 'ppt', 'xls', 'xlsx'];
    const images = ['pdf', 'jpg', 'jpeg', 'png', 'gif', 'bmp', 'tiff', 'webp'];
    let engine = null;
    if (office.includes(ext)) engine = 'libreoffice';
    else if (images.includes(ext)) engine = 'imagemagick';
    else {
      await unlinkAsync(inputFilePath);
      return res.status(400).json({ error: `Unsupported file extension .${ext}` });
    }

    const job = await cloudConvert.jobs.create({
      tasks: {
        'import-upload': { operation: 'import/upload' },
        'convert-file': {
          operation: 'convert',
          input: ['import-upload'],
          output_format: outputFormat,
          engine
        },
        'export-url': { operation: 'export/url', input: ['convert-file'] }
      }
    });

    const uploadTask = job.tasks.find(t => t.name === 'import-upload');
    await cloudConvert.tasks.upload(uploadTask, fs.createReadStream(inputFilePath), originalName);

    const completedJob = await cloudConvert.jobs.wait(job.id);
    const exportTask = completedJob.tasks.find(t => t.name === 'export-url');
    const files = exportTask.result.files;

    let fileUrl, finalName;
    if (files.length === 1) {
      fileUrl = files[0].url;
      finalName = `${outputBasename}.${outputFormat}`;
    } else {
      const convertTask = completedJob.tasks.find(t => t.name === 'convert-file');
      const zipJob = await cloudConvert.jobs.create({
        tasks: {
          'archive-files': {
            operation: 'archive',
            input: [convertTask.id],
            filename: `${outputBasename}.zip`,
            output_format: 'zip'
          },
          'export-zip': {
            operation: 'export/url',
            input: ['archive-files']
          }
        }
      });

      const finishedZip = await cloudConvert.jobs.wait(zipJob.id);
      const zipTask = finishedZip.tasks.find(t => t.name === 'export-zip');
      fileUrl = zipTask.result.files[0].url;
      finalName = `${outputBasename}.zip`;
    }

    const downloadRes = await axios.get(fileUrl, { responseType: 'stream', timeout: 30000 });
    const uniqueName = `${outputBasename}_${crypto.randomBytes(4).toString('hex')}${path.extname(finalName)}`;

    const uploadStream = gfsProcessed.openUploadStream(uniqueName, {
      contentType: `application/${outputFormat}`
    });

    downloadRes.data.pipe(uploadStream);

    await new Promise((resolve, reject) => {
      uploadStream.on('finish', resolve);
      uploadStream.on('error', reject);
    });

    const token = generateToken(uploadStream.id.toString(), req.ip);
    await FileToken.create({
      token,
      fileId: uploadStream.id,
      expiresAt: new Date(Date.now() + 5 * 1000)
    });

    await unlinkAsync(inputFilePath);

    res.json({
      success: true,
      token,
      fileName: uniqueName,
      outputFormat
    });

  } catch (err) {
    console.error('Conversion error:', err);
    if (inputFilePath) {
      try {
        await unlinkAsync(inputFilePath);
        console.log(`[${new Date().toISOString()}] 🗑️ Temp file removed: ${inputFilePath}`);
      } catch (delErr) {
        console.warn(`!.Failed to delete temp upload: ${delErr.message}`);
      }
    }

    res.status(500).json({
      error: 'Conversion failed',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};
