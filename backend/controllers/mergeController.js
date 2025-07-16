import {
  
  fs,path,crypto,dotenv,fileTypeFromFile,promisify,FileToken,generateToken,CloudConvert,gfsProcessed,allowedMimes

} from '../utils/coreModules.js';

dotenv.config();

const unlinkAsync = promisify(fs.unlink);

export const mergePdfs = async (req, res) => {
  let cloudConvert;
  try {
    const files = req.files;
    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No files provided for merge' });
    }

    const allowed = [
       ...allowedMimes.documents,
        ...allowedMimes.spreadsheets,
        ...allowedMimes.presentations,
        ...allowedMimes.archives.filter(type => type === 'application/zip'),
        ...allowedMimes.images.filter(type => type === 'image/png' || type === 'image/jpeg' || type === 'image/bmp' || type === 'image/gif' || type === 'image/tiff' || type === 'image/webp'),
    ];
    for (const file of files) {
      const info = await fileTypeFromFile(file.path);
      if (!info || !allowed.includes(info.mime)) {
        await unlinkAsync(file.path).catch(() => {});
        return res.status(400).json({ error: `Invalid file type: ${file.originalname}` });
      }
    }

    cloudConvert = new CloudConvert(process.env.CLOUDC_APIK);
    const importTasks = {};
    const convertTasks = {};

    files.forEach((file, idx) => {
      const safeName = file.originalname
        .replace(/[^a-zA-Z0-9-_.]/g, '_')
        .slice(0, 100);

      importTasks[`import-${idx}`] = { operation: 'import/upload' };
      convertTasks[`convert-${idx}`] = {
        operation:     'convert',
        input:         [`import-${idx}`],
        output_format: 'pdf'
      };

      file.safeName = safeName;
    });

    const job = await cloudConvert.jobs.create({
      tasks: {
        ...importTasks,
        ...convertTasks,
        'merge': {
          operation:     'merge',
          input:         Object.keys(convertTasks),
          output_format: 'pdf'
        },
        'export': {
          operation: 'export/url',
          input:     ['merge']
        }
      }
    });

    await Promise.all(files.map(async (file, idx) => {
      const task = job.tasks.find(t => t.name === `import-${idx}`);
      await cloudConvert.tasks.upload(task, fs.createReadStream(file.path), file.safeName);
    }));

    const completed = await cloudConvert.jobs.wait(job.id);
    const exportTask = completed.tasks.find(t => t.name === 'export');
    const downloadUrl = exportTask.result.files[0].url;

    const baseName = path.parse(files[0].originalname).name.replace(/[^a-zA-Z0-9-_]/g, "_").slice(0, 50);

    const mergedName = `${baseName}_${crypto.randomBytes(4).toString('hex')}.pdf`;
    const downloadRes = await (await import('axios')).default.get(downloadUrl, {
      responseType: 'stream',
      timeout: 30000
    });
    const uploadStream = gfsProcessed.openUploadStream(mergedName, {
      contentType: 'application/pdf'
    });
    downloadRes.data.pipe(uploadStream);
    await new Promise((resolve, reject) => {
      uploadStream.on('finish', resolve);
      uploadStream.on('error', reject);
    });

    const token = generateToken(uploadStream.id.toString(), req.ip);
    await FileToken.create({
      token,
      fileId:    uploadStream.id,
      expiresAt: new Date(Date.now() + 5 * 1000)
    });

    await Promise.all(files.map(f => unlinkAsync(f.path).catch(() => {})));

    res.json({
      success:      true,
      token,
      fileName:     mergedName,
      outputFormat: 'pdf'
    });

  } catch (err) {
    console.error('Merge error:', err);
    if (req.files) {
      await Promise.all(req.files.map(f => unlinkAsync(f.path).catch(() => {})));
    }
    return res.status(500).json({
      error:   'Document merge failed',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};



