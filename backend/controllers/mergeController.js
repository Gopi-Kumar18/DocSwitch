
import {fs, path, crypto, dotenv, fileTypeFromFile, promisify, FileToken, generateToken, axios, CloudConvert } from "../utils/coreModules.js";

dotenv.config();

const unlinkAsync = promisify(fs.unlink);

export const mergePdfs = async (req, res) => {
  try {
    
    const files = req.files;
    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No files provided for merge' });
    }
    
    const outputFormat = 'pdf';
    const conversionType = 'merged-docs';

      const allowedMimes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'image/png',
      'image/jpeg'
    ];
    
    for (const file of files) {
      const fileInfo = await fileTypeFromFile(file.path);
      console.log('Detected MIME type for', file.originalname, ':', fileInfo?.mime); 
      if (!fileInfo || !allowedMimes.includes(fileInfo.mime)) {
        await unlinkAsync(file.path);
        return res.status(400).json({ error: `Invalid file type: ${file.originalname}` });
      }
    }

    const cloudConvert = new CloudConvert(process.env.CLOUDC_APIK2);

    const importTasks = {};
    const convertTasks = {};
    
    files.forEach((file, index) => {
      const sanitizedOriginalName = file.originalname.replace(/[^a-zA-Z0-9-_.]/g, '_').substring(0, 100);
      
      importTasks[`import-upload-${index}`] = {
        operation: 'import/upload'
      };

      convertTasks[`convert-to-pdf-${index}`] = {
        operation: 'convert',
        input: [`import-upload-${index}`],
        output_format: 'pdf'
      };

      file.sanitizedOriginalName = sanitizedOriginalName;
    });

    const job = await cloudConvert.jobs.create({
      tasks: {
        ...importTasks,
        ...convertTasks,
        'merge-pdfs': {
          operation: 'merge',
          input: Object.keys(convertTasks), 
          output_format: outputFormat,
        },
        'export-url': {
          operation: 'export/url',
          input: ['merge-pdfs']
        }
      }
    });

    
    await Promise.all(files.map(async (file, index) => {
      const uploadTask = job.tasks.find(t => t.name === `import-upload-${index}`);
      await cloudConvert.tasks.upload(
        uploadTask,
        fs.createReadStream(file.path),
        file.sanitizedOriginalName
      );
    }));

    
    const completedJob = await cloudConvert.jobs.wait(job.id);
    const exportTask = completedJob.tasks.find(t => t.name === 'export-url');
    const downloadUrl = exportTask.result.files[0].url;

    const downloadsDir = path.join(process.cwd(), 'downloads', conversionType.slice(0,50)); //conversionTypes.slice(0,50)
    if (!fs.existsSync(downloadsDir)) {
      fs.mkdirSync(downloadsDir, { recursive: true, mode: 0o755 }); 
    }

    const outputFileName = `${sanitizedOriginalName}_${crypto.randomBytes(4).toString('hex')}.pdf`;
    const outputFilePath = path.join(downloadsDir, outputFileName);
    const relativeFilePath = path.join('downloads', conversionType, outputFileName);

    const response = await axios.get(downloadUrl, {
      responseType: 'stream',
      timeout: 30000 
    });
    const writer = fs.createWriteStream(outputFilePath, { mode: 0o600 }); 
    response.data.pipe(writer);
    await new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });

    const encodedFilePath = Buffer.from(relativeFilePath).toString('base64url');
    
    const token = generateToken(encodedFilePath, req.ip);

    await FileToken.create({
      token,
      filePath: encodedFilePath,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000)
    });

    await Promise.all(files.map(async (file) => {
      try {
        await unlinkAsync(file.path);
        console.log(`[${new Date().toISOString()}] File removed: ${file.path}`);
      } catch (err) {
        console.error(`Error removing file ${file.path}:`, err);
      }
    }));

    res.json({
      success: true,
      token,
      outputFormat,
      fileName: outputFileName
    });

  } catch (error) {
    console.error('Merge error:', error);
    res.status(500).json({
      error: 'Document merge failed',
      details: process.env.NODE_ENV === 'development' ? error.message : null
    });
  }
};





