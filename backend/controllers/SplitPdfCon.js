import {
  
  fs,crypto,dotenv,fileTypeFromFile,promisify,FileToken,generateToken,path,gfsProcessed

} from '../utils/coreModules.js';

import {
  ServicePrincipalCredentials,
  PDFServices,
  MimeType,
  SplitPDFParams,
  SplitPDFJob,
  SplitPDFResult,
  SDKError,
  ServiceUsageError,
  ServiceApiError,
  ClientConfig
} from '@adobe/pdfservices-node-sdk';

dotenv.config();

const unlinkAsync = promisify(fs.unlink);

export const splitPdf = async (req, res) => {
  let inputFilePath;
  const outputParts = [];

  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    inputFilePath = req.file.path;
    const info = await fileTypeFromFile(inputFilePath);
    if (!info || info.mime !== MimeType.PDF) {
      await unlinkAsync(inputFilePath);
      return res.status(400).json({ error: 'Only PDFs allowed.' });
    }

    const pageCount = parseInt(req.body.pageCount, 10) || 2;
    const baseName  = req.file.originalname.replace(/[^a-zA-Z0-9-_.]/g, '_').slice(0, 100);

    const credentials  = new ServicePrincipalCredentials({
      clientId:     process.env.PDF_SERVICES_CLIENT_ID,
      clientSecret: process.env.PDF_SERVICES_CLIENT_SECRET
    });
    const clientConfig = new ClientConfig({ timeout: 60000 });
    const pdfServices  = new PDFServices({ credentials, clientConfig });

    const inputAsset = await pdfServices.upload({
      readStream: fs.createReadStream(inputFilePath),
      mimeType:   MimeType.PDF
    });
    const params = new SplitPDFParams({ pageCount });
    const job    = new SplitPDFJob({ inputAsset, params });
    const pollingURL = await pdfServices.submit({ job });
    const result     = await pdfServices.getJobResult({
      pollingURL,
      resultType: SplitPDFResult
    });

    const assets = result.result.assets;
    for (let i = 0; i < assets.length; i++) {
      const streamRes = await pdfServices.getContent({ asset: assets[i] });
      const partName  = `${path.parse(baseName).name}_part${i+1}_${crypto.randomBytes(4).toString('hex')}.pdf`;

      const uploadStream = gfsProcessed.openUploadStream(partName, {
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
        expiresAt: new Date(Date.now() + 30 * 1000)
      });

      outputParts.push({ fileName: partName, token });
    }

    await unlinkAsync(inputFilePath);

    res.json({
      success: true,
      parts:   outputParts
    });

  } catch (err) {
    console.error('Split PDF error:', err);
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
