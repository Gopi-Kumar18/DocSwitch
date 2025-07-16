
import {
  
  fs,path,crypto,dotenv,fileTypeFromFile,promisify,FileToken,generateToken,gfsProcessed
  
} from '../utils/coreModules.js';

import {
  ServicePrincipalCredentials,
  PDFServices,
  MimeType,
  ProtectPDFParams,
  EncryptionAlgorithm,
  ProtectPDFJob,
  ProtectPDFResult,
  SDKError,
  ServiceUsageError,
  ServiceApiError,
  ClientConfig
} from '@adobe/pdfservices-node-sdk';

dotenv.config();

const unlinkAsync = promisify(fs.unlink);

export const protectPdf = async (req, res) => {
  let inputFilePath;

  try {
    if (!req.file || !req.body.password) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    inputFilePath = req.file.path;
    const fileInfo = await fileTypeFromFile(inputFilePath);
    if (!fileInfo || fileInfo.mime !== MimeType.PDF) {
      await unlinkAsync(inputFilePath);
      return res.status(400).json({ error: 'Only PDFs allowed' });
    }

    const password     = req.body.password.replace(/[^a-zA-Z0-9!@#_$%^&*()\-+=]/g, '');
    const originalName = req.file.originalname.replace(/[^a-zA-Z0-9-_.]/g, '_').slice(0, 100);
    const baseName     = path.parse(originalName).name;

    const credentials = new ServicePrincipalCredentials({
      clientId:     process.env.PDF_SERVICES_CLIENT_ID,
      clientSecret: process.env.PDF_SERVICES_CLIENT_SECRET
    });
    const clientConfig = new ClientConfig({ timeout: 60000 });
    const pdfServices  = new PDFServices({ credentials, clientConfig });

    const inputAsset = await pdfServices.upload({
      readStream: fs.createReadStream(inputFilePath),
      mimeType:   MimeType.PDF
    });

    const params = new ProtectPDFParams({
      userPassword:       password,
      encryptionAlgorithm: EncryptionAlgorithm.AES_256
    });
    const job       = new ProtectPDFJob({ inputAsset, params });
    const pollingURL = await pdfServices.submit({ job });
    const result     = await pdfServices.getJobResult({
      pollingURL,
      resultType: ProtectPDFResult
    });

    const { asset } = result.result;
    const streamRes = await pdfServices.getContent({ asset });

    const uniqueName   = `${baseName}_protected_${crypto.randomBytes(4).toString('hex')}.pdf`;
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

    res.json({ success: true, token, fileName: uniqueName });

  } catch (err) {
    console.error('Protect PDF error:', err);
    if (req.file?.path) await unlinkAsync(req.file.path).catch(() => {});
    const msg =
      err instanceof ServiceApiError   ? 'Adobe API error' :
      err instanceof ServiceUsageError ? 'Adobe usage error' :
      err instanceof SDKError          ? 'Adobe SDK error' :
      'Internal error';
    res.status(500).json({
      error:   msg,
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

