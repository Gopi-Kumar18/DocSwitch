
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
  PDFDocument
} from '../utils/coreModules.js';

dotenv.config();
const unlinkAsync = promisify(fs.unlink);

export const sealPdf = async (req, res) => {
  let pdfPath, imgPath;
  try {
    if (!req.files?.file?.[0]) return res.status(400).json({ error: 'Missing PDF (file).' });
    if (!req.files?.sealImage?.[0]) return res.status(400).json({ error: 'Missing signature image (sealImage).' });

    pdfPath = req.files.file[0].path;
    imgPath = req.files.sealImage[0].path;

    // Validate PDF MIME
    const info = await fileTypeFromFile(pdfPath);
    if (!info || !allowedMimes.pdfOnly.includes(info.mime)) {
      await unlinkAsync(pdfPath).catch(()=>{});
      await unlinkAsync(imgPath).catch(()=>{});
      return res.status(400).json({ error: 'Only PDFs allowed.' });
    }

    // coords parsing
    const coordsRaw = (req.body.coords || '').split(',').map(v => parseFloat(v));
    const [xPct = 0.1, yPct = 0.8, wPct = 0.18, hPct = 0] = coordsRaw;
    const pageNumber = Math.max(1, parseInt(req.body.pageNumber || '1', 10));

    const pdfBytes = await fs.promises.readFile(pdfPath);
    const imgBytes = await fs.promises.readFile(imgPath);

    const pdfDoc = await PDFDocument.load(pdfBytes);

    const pageIndex = Math.min(Math.max(pageNumber - 1, 0), pdfDoc.getPageCount() - 1);
    const page = pdfDoc.getPage(pageIndex);
    const { width: pageW, height: pageH } = page.getSize();

    const mimetype = req.files.sealImage[0].mimetype || '';
    let embeddedImage;
    if (mimetype.includes('png')) {
      embeddedImage = await pdfDoc.embedPng(imgBytes);
    } else {
      embeddedImage = await pdfDoc.embedJpg(imgBytes);
    }

    const dims = embeddedImage.scale(1);
    const naturalW = dims.width;
    const naturalH = dims.height;

    const desiredW = Math.max(0.01, wPct) * pageW;
    const scale = desiredW / naturalW;
    const desiredH = naturalH * scale;

    const x = xPct * pageW;
    const yTop = yPct * pageH;
    const y = pageH - yTop - desiredH;

    page.drawImage(embeddedImage, { x, y, width: desiredW, height: desiredH });

    const modifiedPdfBytes = await pdfDoc.save();

    const originalName = req.files.file[0].originalname.replace(/[^a-zA-Z0-9-_.]/g, '_').slice(0, 100);
    const uniqueName = `${path.parse(originalName).name}_${crypto.randomBytes(4).toString('hex')}.pdf`;

    const uploadStream = gfsProcessed.openUploadStream(uniqueName, { contentType: 'application/pdf' });

    uploadStream.end(Buffer.from(modifiedPdfBytes));
    await new Promise((resolve, reject) => {
      uploadStream.on('finish', resolve);
      uploadStream.on('error', reject);
    });

    const token = generateToken(uploadStream.id.toString(), req.ip);
    await FileToken.create({
      token,
      fileId: uploadStream.id,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000)
    });

    await unlinkAsync(pdfPath).catch(()=>{});
    await unlinkAsync(imgPath).catch(()=>{});

    return res.json({ success: true, token, fileName: uniqueName });

  } catch (err) {
    console.error('Local seal error:', err);
    if (pdfPath) await unlinkAsync(pdfPath).catch(()=>{});
    if (imgPath) await unlinkAsync(imgPath).catch(()=>{});
    return res.status(500).json({
      error: 'Seal operation failed (local)',
      details: process.env.NODE_ENV === 'development' ? (err.message || String(err)) : undefined
    });
  }
};