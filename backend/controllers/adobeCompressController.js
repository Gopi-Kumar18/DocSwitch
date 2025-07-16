
import { 
  
  fs,path,crypto,dotenv,fileTypeFromFile,promisify,FileToken,generateToken,gfsProcessed,allowedMimes

} from '../utils/coreModules.js';

import {
  ServicePrincipalCredentials,
  PDFServices,
  MimeType,
  CompressPDFJob,
  CompressPDFResult,
  SDKError,
  ServiceUsageError,
  ServiceApiError,
  ClientConfig
} from '@adobe/pdfservices-node-sdk';


dotenv.config();
const unlinkAsync = promisify(fs.unlink);

export const adobeCompressor = async (req, res) => {
  let inputFilePath;

  try {
    // 1. Input validation
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    // 2. File validation
    inputFilePath = req.file.path;

    const info = await fileTypeFromFile(inputFilePath);

    const isPdf = info && allowedMimes.pdfOnly.includes(info.mime);

    if (!isPdf) {
      await unlinkAsync(inputFilePath);            
      return res.status(400).json({ error: 'Only PDFs allowed.' });
    }

    // 3. Initialize SDK
    const credentials = new ServicePrincipalCredentials({
      clientId:     process.env.PDF_SERVICES_CLIENT_ID,
      clientSecret: process.env.PDF_SERVICES_CLIENT_SECRET
    });
    const clientConfig = new ClientConfig({ timeout: 60000 });
    const pdfServices  = new PDFServices({ credentials, clientConfig });

    // 4. Upload to SDK
    const inputAsset = await pdfServices.upload({
      readStream: fs.createReadStream(inputFilePath),
      mimeType:   MimeType.PDF
    });

    // 5. Submit compress job
    const job       = new CompressPDFJob({ inputAsset });
    const pollingURL = await pdfServices.submit({ job });
    const result     = await pdfServices.getJobResult({
      pollingURL,
      resultType: CompressPDFResult
    });

    // 6. Get compressed stream
    const { asset }   = result.result;
    const streamRes   = await pdfServices.getContent({ asset });

    // 7. Pipe into GridFS
    const baseName    = path.parse(req.file.originalname).name
                          .replace(/[^a-zA-Z0-9-_]/g, '_').slice(0, 50);
    const uniqueName  = `${baseName}_${crypto.randomBytes(4).toString('hex')}.pdf`;
    const uploadStream = gfsProcessed.openUploadStream(uniqueName, {
      contentType: MimeType.PDF
    });
    streamRes.readStream.pipe(uploadStream);

    await new Promise((resolve, reject) => {
      uploadStream.on('finish', resolve);
      uploadStream.on('error', reject);
    });

    // 8. Token & DB entry
    const token = generateToken(uploadStream.id.toString(), req.ip);
    await FileToken.create({
      token,
      fileId:    uploadStream.id,
      expiresAt: new Date(Date.now() + 5 * 1000)
    });

    // 9. Cleanup upload
    await unlinkAsync(inputFilePath);

    // 10. Response
    return res.json({
      success:  true,
      token,
      fileName: uniqueName
    });

  } catch (err) {
    console.error('Compress error:', err);

    // destroy any open streams
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
