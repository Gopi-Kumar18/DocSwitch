import {

  fileTypeFromFile, crypto, dotenv, axios, FileToken, generateToken, CloudConvert, fs, path, promisify, gfsProcessed, allowedMimes
  
} from '../utils/coreModules.js';

dotenv.config();

const unlinkAsync = promisify(fs.unlink);
const cloudConvert = new CloudConvert(process.env.CLOUDC_APIK);

/**
 * Generic converter factory for CloudConvert tasks, with multi-page support.
 * If multiple output files are generated (e.g., multi-page PDFs), archives them into ZIP.
 *
 * @param {string} outputFormat - Desired output format, like 'jpg' or 'png'.
 */
const createConverter = (outputFormat) => {
  return async (req, res) => {
    let inputFilePath;

    try {
      // 1. Validate input
      if (!req.file || !req.body.conversionType) {
        return res.status(400).json({ error: 'Missing required parameters' });
      }

      inputFilePath = req.file.path;

      // 2. Check MIME type
      const fileInfo = await fileTypeFromFile(inputFilePath);
      const allowed = [
        ...allowedMimes.documents,
        ...allowedMimes.spreadsheets,
        ...allowedMimes.presentations,
        ...allowedMimes.images.filter(type =>
          ['image/png', 'image/jpeg', 'image/bmp', 'image/gif', 'image/tiff', 'image/webp'].includes(type)
        ),
        ...allowedMimes.archives.filter(type => type === 'application/zip'),
      ];

      if (!fileInfo || !allowed.includes(fileInfo.mime)) {
        await unlinkAsync(inputFilePath);
        return res.status(400).json({ error: 'Invalid file type' });
      }

      // 3. Sanitize and extract file info
      const originalName = req.file.originalname
        .replace(/[^a-zA-Z0-9-_.]/g, '_')
        .slice(0, 100);
      const ext = path.extname(originalName).slice(1).toLowerCase();
      const baseName = path.parse(originalName).name;

      // 4. Choose conversion engine
      const office = ['docx', 'doc', 'pptx', 'ppt', 'xls', 'xlsx'];
      const images = ['pdf', 'jpg', 'jpeg', 'png', 'gif', 'bmp', 'tiff', 'webp'];
      let engine = null;

      if (office.includes(ext)) engine = 'libreoffice';
      else if (images.includes(ext)) engine = 'imagemagick';
      else {
        await unlinkAsync(inputFilePath);
        return res.status(400).json({ error: `Unsupported extension .${ext}` });
      }

      // 5. Create CloudConvert job
      const job = await cloudConvert.jobs.create({
        tasks: {
          'import-upload': { operation: 'import/upload' },
          'convert-file': {
            operation: 'convert',
            input: ['import-upload'],
            output_format: outputFormat,
            engine,
          },
          'export-url': { operation: 'export/url', input: ['convert-file'] }
        }
      });

      // 6. Upload file
      const importTask = job.tasks.find(t => t.name === 'import-upload');
      await cloudConvert.tasks.upload(importTask, fs.createReadStream(inputFilePath), originalName);

      // 7. Wait for export task to finish
      const completedJob = await cloudConvert.jobs.wait(job.id);
      const exportTask = completedJob.tasks.find(t => t.name === 'export-url');
      const files = exportTask?.result?.files;

      if (!files || files.length === 0) {
        throw new Error('No output generated');
      }

      let downloadUrl;
      let resultName;
      let contentType;

      // 8. Handle single/multiple outputs
      if (files.length === 1) {
        downloadUrl = files[0].url;
        resultName = `${baseName}_${crypto.randomBytes(4).toString('hex')}.${outputFormat}`;
        contentType = `image/${outputFormat}`;
      } else {
        // Archive multiple output files into ZIP
        const convertTask = completedJob.tasks.find(t => t.name === 'convert-file');

        const zipJob = await cloudConvert.jobs.create({
          tasks: {
            'archive-files': {
              operation: 'archive',
              input: [convertTask.id],
              output_format: 'zip',
              filename: `${baseName}.zip`,
            },
            'export-archive': { operation: 'export/url', input: ['archive-files'] },
          }
        });

        const finishedZip = await cloudConvert.jobs.wait(zipJob.id);
        const zipTask = finishedZip.tasks.find(t => t.name === 'export-archive');
        const zipFiles = zipTask?.result?.files;

        if (!zipFiles || zipFiles.length === 0) {
          throw new Error('No archive generated');
        }

        downloadUrl = zipFiles[0].url;
        resultName = `${baseName}_${crypto.randomBytes(4).toString('hex')}.zip`;
        contentType = 'application/zip';
      }

      // 9. Stream to GridFS
      const downloadRes = await axios.get(downloadUrl, {
        responseType: 'stream',
        timeout: 30000
      });

      const uploadStream = gfsProcessed.openUploadStream(resultName, { contentType });
      downloadRes.data.pipe(uploadStream);

      await new Promise((resolve, reject) => {
        uploadStream.on('finish', resolve);
        uploadStream.on('error', reject);
      });

      // 10. Generate secure token for download
      const token = generateToken(uploadStream.id.toString(), req.ip);
      await FileToken.create({
        token,
        fileId: uploadStream.id,
        expiresAt: new Date(Date.now() + 5 * 1000),
      });

      // 11. Cleanup
      await unlinkAsync(inputFilePath);

      // 12. Response
      return res.json({
        success: true,
        token,
        fileName: resultName,
        outputFormat: path.extname(resultName).slice(1),
      });

    } catch (err) {
      console.error(`Conversion to ${outputFormat} error:`, err);
      if (inputFilePath) {
        try { await unlinkAsync(inputFilePath); } catch {}
      }
      return res.status(500).json({
        error: `${outputFormat.toUpperCase()} conversion failed`,
        details: process.env.NODE_ENV === 'development' ? err.message : undefined,
      });
    }
  };
};


export const convertToJpg = createConverter('jpg');
export const convertToPng = createConverter('png');
