
import {

  fs,path,crypto,dotenv,fileTypeFromFile,promisify,FileToken,generateToken,gfsProcessed

} from '../utils/coreModules.js';

import {
  ServicePrincipalCredentials,
  PDFServices,
  MimeType,
  CreatePDFJob,
  CreatePDFResult,
  SDKError,
  ServiceUsageError,
  ServiceApiError,
  ClientConfig
} from '@adobe/pdfservices-node-sdk';

dotenv.config();
const unlinkAsync = promisify(fs.unlink);

export const adobeCreatePDF = async (req, res) => {
  let inputFilePath;

  try {
    
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    inputFilePath = req.file.path;
    const fileInfo = await fileTypeFromFile(inputFilePath);
    const map      = {
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': MimeType.DOCX,
      'application/msword': MimeType.DOC,
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': MimeType.PPTX,
      'application/vnd.ms-powerpoint': MimeType.PPT,
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': MimeType.XLSX,
      'application/vnd.ms-excel': MimeType.XLS,
      'application/rtf': MimeType.RTF,
      'text/plain': MimeType.TXT,
      'text/html': MimeType.HTML,
      'image/jpeg': MimeType.JPEG,
      'image/png':  MimeType.PNG,
      'image/bmp':  MimeType.BMP,
      'image/gif':  MimeType.GIF,
      'image/tiff': MimeType.TIFF
    };
    if (!fileInfo || !map[fileInfo.mime]) {
      await unlinkAsync(inputFilePath);
      return res.status(400).json({ error: 'Unsupported file type' });
    }

    const originalName = req.file.originalname
                              .replace(/[^a-zA-Z0-9-_.]/g, '_')
                              .slice(0, 100);
    const baseName     = path.parse(originalName).name;

    const credentials = new ServicePrincipalCredentials({
      clientId:     process.env.PDF_SERVICES_CLIENT_ID,
      clientSecret: process.env.PDF_SERVICES_CLIENT_SECRET
    });
    const clientConfig = new ClientConfig({ timeout: 60000 });
    const pdfServices  = new PDFServices({ credentials, clientConfig });

    const inputAsset = await pdfServices.upload({
      readStream: fs.createReadStream(inputFilePath),
      mimeType:   map[fileInfo.mime]
    });
    const job       = new CreatePDFJob({ inputAsset });
    const pollingURL= await pdfServices.submit({ job });
    const result    = await pdfServices.getJobResult({
      pollingURL,
      resultType: CreatePDFResult
    });

    const { asset }  = result.result;
    const streamRes  = await pdfServices.getContent({ asset });

    const uniqueName   = `${baseName}_${crypto.randomBytes(4).toString('hex')}.pdf`;
    const uploadStream = gfsProcessed.openUploadStream(uniqueName, {
      contentType: MimeType.PDF
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
      success:  true,
      token,
      fileName: uniqueName
    });

  } catch (err) {
    console.error('CreatePDF error:', err);
    if (req.file?.path) await unlinkAsync(req.file.path).catch(() => {});

    const msg =
      err instanceof ServiceApiError   ? 'Adobe API error' :
      err instanceof ServiceUsageError ? 'Adobe usage error' :
      err instanceof SDKError          ? 'Adobe SDK error' :
      'Internal error';

    return res.status(500).json({
      error:   msg,
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

