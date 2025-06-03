
import {fs, path, crypto, dotenv, fileTypeFromFile, promisify, FileToken, generateToken } from "../utils/coreModules.js";

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
} from "@adobe/pdfservices-node-sdk";

dotenv.config();
const unlinkAsync = promisify(fs.unlink);

export const adobeCompressor = async (req, res) => {
  let outputFilePath = null;
  let readStream   = null;

  try {

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded." });
    }

    const inputFilePath = req.file.path;
    const info = await fileTypeFromFile(inputFilePath);
    if (!info || info.mime !== MimeType.PDF) {
      await unlinkAsync(inputFilePath);
      return res.status(400).json({ error: "Only PDFs allowed." });
    }


    const credentials = new ServicePrincipalCredentials({
      clientId:     process.env.PDF_SERVICES_CLIENT_ID,
      clientSecret: process.env.PDF_SERVICES_CLIENT_SECRET
    });

    const clientConfig = new ClientConfig({ timeout: 60000 });
    
    const pdfServices = new PDFServices({ clientConfig, credentials });


    readStream = fs.createReadStream(inputFilePath);
    const inputAsset = await pdfServices.upload({
      readStream,
      mimeType: MimeType.PDF
    });

    const job = new CompressPDFJob({ inputAsset });

   
    const pollingURL = await pdfServices.submit({ job });
    const result     = await pdfServices.getJobResult({
      pollingURL,
      resultType: CompressPDFResult
    });

    const downloadsDir = path.join(process.cwd(), "downloads", "compress");
    fs.mkdirSync(downloadsDir, { recursive: true, mode: 0o755 });


    const baseName       = path.parse(req.file.originalname).name;
    const safeBase       = baseName.replace(/[^a-zA-Z0-9-_]/g, "_").slice(0, 50);
    const randomHex      = crypto.randomBytes(4).toString("hex");
    const outputFileName = `${safeBase}_${randomHex}.pdf`;
    outputFilePath       = path.join(downloadsDir, outputFileName);
    const relativePath   = path.join("downloads", "compress", outputFileName);

    const streamAsset = await pdfServices.getContent({
      asset: result.result.asset
    });
    const writer = fs.createWriteStream(outputFilePath, { mode: 0o600 });
    streamAsset.readStream.pipe(writer);
    await new Promise((resolve, reject) => {
      writer.on("finish", resolve);
      writer.on("error", reject);
    });


    const encodedFilePath = Buffer.from(relativePath).toString("base64url");
    const token = generateToken(encodedFilePath, req.ip); 
    
    await FileToken.create({
      token,
      filePath:  encodedFilePath,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000)
    });

    
    await unlinkAsync(inputFilePath);


    res.json({
      success:      true,
      token,
      fileName:     outputFileName,
    });

  } catch (err) {
    console.error("Compress error:", err);

    readStream?.destroy();
    if (outputFilePath) fs.unlink(outputFilePath, () => {});
    if (req.file?.path)  unlinkAsync(req.file.path).catch(() => {});

    const msg =
      err instanceof ServiceApiError   ? "Adobe API error" :
      err instanceof ServiceUsageError ? "Adobe usage error" :
      err instanceof SDKError          ? "Adobe SDK error" : 
      "Internal error";

    res.status(500).json({
      error:   msg,
      details: process.env.NODE_ENV === "development" ? err.message : undefined
    });
  }
};
