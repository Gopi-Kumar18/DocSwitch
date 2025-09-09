
import {
  fs,
  path,
  crypto,
  dotenv,
  fileTypeFromFile,
  promisify,
  FileToken,
  generateToken,
  gfsProcessed,
  allowedMimes,
  multer
} from '../utils/coreModules.js';

import ILovePDFApi from '@ilovepdf/ilovepdf-nodejs/index.js';
import ILovePDFFile from '@ilovepdf/ilovepdf-nodejs/ILovePDFFile.js';

dotenv.config();
const unlinkAsync = promisify(fs.unlink);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); 
  },
  filename: function (req, file, cb) {

    cb(null, file.originalname);
  }
});
export const uploads = multer({ storage: storage });

export const iloveWatermark = async (req, res) => {
  let pdfPath = null;
  let watermarkPath = null;

  try {
    if (!req.files?.file?.[0]) {
      return res.status(400).json({ error: 'Missing required PDF file (field name: file).' });
    }

    const uploadedPdf = req.files.file[0];
    const uploadsDir = path.join(process.cwd(), 'uploads');

    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

    const finalPdfPath = path.join(uploadsDir, uploadedPdf.originalname);

    if (uploadedPdf.path !== finalPdfPath) {
      if (fs.existsSync(finalPdfPath)) {
        const parsed = path.parse(finalPdfPath);
        const unique = `${parsed.name}_${Date.now()}${parsed.ext}`;
        await fs.promises.rename(uploadedPdf.path, path.join(uploadsDir, unique));
        pdfPath = path.join(uploadsDir, unique);
      } else {
        await fs.promises.rename(uploadedPdf.path, finalPdfPath);
        pdfPath = finalPdfPath;
      }
    } else {
      pdfPath = uploadedPdf.path;
    }

    const fileInfo = await fileTypeFromFile(pdfPath);
    if (!fileInfo || !allowedMimes.pdfOnly.includes(fileInfo.mime)) {
      await unlinkAsync(pdfPath).catch(() => {});
      return res.status(400).json({ error: 'Only PDFs allowed for the input file.' });
    }

    const mode = (req.body.mode || 'text').toLowerCase(); // 'text' or 'image'
    const watermarkText = req.body.watermarkText ?? '';
    const pages = req.body.pages || 'all';
    const opacity = Math.max(0, Math.min(100, parseInt(req.body.opacity || '100', 10)));
    const layer = req.body.layer === 'below' ? 'below' : 'above';
    const vertical_position = req.body.verticalPosition || 'middle';
    const horizontal_position = req.body.horizontalPosition || 'center';
    const mosaic = req.body.mosaic === 'true' || req.body.mosaic === true;
    const rotation = parseFloat(req.body.rotation || '0') || 0;
    const font_size = parseInt(req.body.fontSize || '18', 10);
    const font_color = req.body.fontColor || '#000000';

    let imageFilenameForAPI = null;
    if (mode === 'image') {
      if (req.files?.watermarkImage?.[0]) {
        const uploadedImage = req.files.watermarkImage[0];
        const finalImagePath = path.join(uploadsDir, uploadedImage.originalname);

        if (uploadedImage.path !== finalImagePath) {
          if (fs.existsSync(finalImagePath)) {
            const parsedImg = path.parse(finalImagePath);
            const uniqueImg = `${parsedImg.name}_${Date.now()}${parsedImg.ext}`;
            await fs.promises.rename(uploadedImage.path, path.join(uploadsDir, uniqueImg));
            watermarkPath = path.join(uploadsDir, uniqueImg);
            imageFilenameForAPI = path.basename(watermarkPath);
          } else {
            await fs.promises.rename(uploadedImage.path, finalImagePath);
            watermarkPath = finalImagePath;
            imageFilenameForAPI = uploadedImage.originalname;
          }
        } else {
          watermarkPath = uploadedImage.path;
          imageFilenameForAPI = uploadedImage.originalname;
        }
      } else if (req.body.serverFallbackImage) {
        watermarkPath = path.join(process.cwd(), req.body.serverFallbackImage);
        if (!fs.existsSync(watermarkPath)) {
          await unlinkAsync(pdfPath).catch(()=>{});
          return res.status(400).json({ error: 'Watermark image not uploaded and server fallback not found.' });
        }
        imageFilenameForAPI = path.basename(watermarkPath);
      } else {
        await unlinkAsync(pdfPath).catch(()=>{});
        return res.status(400).json({ error: 'mode=image requires a watermarkImage file upload.' });
      }
    } else {
      if (!watermarkText || !String(watermarkText).trim()) {
        await unlinkAsync(pdfPath).catch(()=>{});
        return res.status(400).json({ error: 'mode=text requires watermarkText.' });
      }
    }

    const PUBLIC_KEY = process.env.ILOVEPDF_PUBLIC_KEY;
    const SECRET_KEY = process.env.ILOVEPDF_SECRET_KEY;

    if (!PUBLIC_KEY || !SECRET_KEY) {
      if (pdfPath) await unlinkAsync(pdfPath).catch(()=>{});
      if (watermarkPath) await unlinkAsync(watermarkPath).catch(()=>{});
      return res.status(500).json({ error: 'Server missing iLovePDF credentials (set env variables).' });
    }

    const ilovepdf = new ILovePDFApi(PUBLIC_KEY, SECRET_KEY);

    const task = ilovepdf.newTask('watermark');
    await task.start();

    const sourceFile = new ILovePDFFile(pdfPath);
    await task.addFile(sourceFile);

    if (mode === 'image' && watermarkPath) {
      const imgFile = new ILovePDFFile(watermarkPath);
      await task.addFile(imgFile);
      imageFilenameForAPI = imageFilenameForAPI || path.basename(watermarkPath);
    }

    const processOptions = {
      mode: mode,                       // 'text' or 'image'
      text: watermarkText,              // text used when mode === 'text'
      pages: pages,                     // page selector string
      opacity: opacity,                 // 0..100
      layer: layer,                     // 'above' | 'below'
      vertical_position: vertical_position,
      horizontal_position: horizontal_position,
      mosaic: mosaic,
      rotation: rotation,
      font_size: font_size,
      font_color: font_color
    };

    if (mode === 'image' && imageFilenameForAPI) {
      processOptions.image = imageFilenameForAPI;
    }

    await task.process(processOptions);

    const resultData = await task.download();

    const originalName = path.parse(uploadedPdf.originalname).name.replace(/[^a-zA-Z0-9-_.]/g, '_').slice(0, 100);
    const uniqueName = `${originalName}_${crypto.randomBytes(4).toString('hex')}.pdf`;

    const uploadStream = gfsProcessed.openUploadStream(uniqueName, {
      contentType: 'application/pdf'
    });

    uploadStream.end(Buffer.from(resultData));
    await new Promise((resolve, reject) => {
      uploadStream.on('finish', resolve);
      uploadStream.on('error', reject);
    });

    const token = generateToken(uploadStream.id.toString(), req.ip);
    await FileToken.create({
      token,
      fileId: uploadStream.id,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000) // 15 minutes
    });

    if (pdfPath) await unlinkAsync(pdfPath).catch(()=>{});
    if (watermarkPath && req.files?.watermarkImage?.[0]) await unlinkAsync(watermarkPath).catch(()=>{});

    return res.json({
      success: true,
      token,
      fileName: uniqueName,
      outputFormat: 'pdf'
    });

  } catch (err) {
    console.error('iLovePDF watermark error:', err);

    if (err?.response?.data) {
      console.error('iLovePDF API response:', err.response.data);
    }

    try { if (pdfPath) await unlinkAsync(pdfPath).catch(()=>{}); } catch {}
    try { if (watermarkPath && req.files?.watermarkImage?.[0]) await unlinkAsync(watermarkPath).catch(()=>{}); } catch {}

    return res.status(500).json({
      error: 'Watermark operation failed',
      details: process.env.NODE_ENV === 'development' ? (err.response?.data || err.message || String(err)) : undefined
    });
  }
};
