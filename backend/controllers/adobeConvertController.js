
import {

  fs,path,crypto,dotenv,fileTypeFromFile,promisify,FileToken,generateToken,gfsProcessed,allowedMimes

} from '../utils/coreModules.js';

import {
  ServicePrincipalCredentials,
  PDFServices,
  MimeType,
  ExportPDFJob,
  ExportPDFTargetFormat,
  ExportPDFParams,
  ExportPDFResult,
  SDKError,
  ServiceUsageError,
  ServiceApiError,
} from '@adobe/pdfservices-node-sdk';


dotenv.config();
const unlinkAsync = promisify(fs.unlink);

export const adobeConverter = async (req, res) => {
  let inputFilePath;

  try {
    if (!req.file || !req.body.outputFormat || !req.body.conversionType) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    inputFilePath = req.file.path;

    const fileInfo = await fileTypeFromFile(inputFilePath);

      const isPdf = fileInfo && allowedMimes.pdfOnly.includes(fileInfo.mime);
    
        if (!isPdf) {
          await unlinkAsync(inputFilePath);            
          return res.status(400).json({ error: 'Only PDFs allowed.' });
        }

    const outputFormat   = req.body.outputFormat.replace(/[^a-z]/gi, '');
    const originalName   = req.file.originalname
                              .replace(/[^a-zA-Z0-9-_.]/g, '_')
                              .slice(0, 100);
    const outputBasename = path.parse(originalName).name;

    let targetFormat;
    switch (outputFormat) {
      case 'pptx': targetFormat = ExportPDFTargetFormat.PPTX; break;
      case 'xlsx': targetFormat = ExportPDFTargetFormat.XLSX; break;
      case 'jpg':
      case 'jpeg': targetFormat = ExportPDFTargetFormat.JPEG; break;
      case 'png':  targetFormat = ExportPDFTargetFormat.PNG; break;
      default:
        await unlinkAsync(inputFilePath);
        return res.status(400).json({ error: 'Unsupported conversion format' });
    }

    const credentials = new ServicePrincipalCredentials({
      clientId:     process.env.PDF_SERVICES_CLIENT_ID,
      clientSecret: process.env.PDF_SERVICES_CLIENT_SECRET
    });

     if (!credentials) {
      console.error("Credentials not found");
    }

    const pdfServices = new PDFServices({ credentials });

    const inputAsset = await pdfServices.upload({
      readStream: fs.createReadStream(inputFilePath),
      mimeType:   MimeType.PDF
    });

    const params = new ExportPDFParams({ targetFormat });
    const job    = new ExportPDFJob({ inputAsset, params });
    const pollingURL = await pdfServices.submit({ job });

    const result = await pdfServices.getJobResult({
      pollingURL,
      resultType: ExportPDFResult
    });

    const { asset } = result.result;
    const streamRes = await pdfServices.getContent({ asset });

    const uniqueName  = `${outputBasename}_${crypto.randomBytes(4).toString('hex')}.${outputFormat}`;
    const uploadStream = gfsProcessed.openUploadStream(uniqueName, {
      contentType: `application/${outputFormat}`
    });
    streamRes.readStream.pipe(uploadStream);

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

    await unlinkAsync(inputFilePath);

    return res.json({
      success:      true,
      token,
      fileName:     uniqueName,
      outputFormat
    });

  } catch (err) {
    console.error('Conversion error:', err);

    if (err instanceof SDKError ||
        err instanceof ServiceUsageError ||
        err instanceof ServiceApiError) {
      console.error('Adobe PDF Services error', err);
    }

    if (inputFilePath) {
      try { await unlinkAsync(inputFilePath); } catch {}
    }

    return res.status(500).json({
      error:   'Conversion failed',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};
