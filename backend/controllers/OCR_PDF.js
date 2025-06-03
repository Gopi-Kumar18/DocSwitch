import { fs, path, crypto, dotenv, fileTypeFromFile, promisify, FileToken, generateToken } from "../utils/coreModules.js";

import {
  ServicePrincipalCredentials,
  PDFServices,
  MimeType,
  OCRJob,
  OCRResult,
  SDKError,
  ServiceUsageError,
  ServiceApiError,
   ClientConfig
} from "@adobe/pdfservices-node-sdk";

dotenv.config();
const unlinkAsync = promisify(fs.unlink);

export const ocr_pdf = async (req, res) => {
  let outputFilePath = null;
  try {
    if (!req.file || !req.body.conversionType) {
      return res.status(400).json({ error: "Missing required parameters" });
    }

    const inputFilePath = req.file.path;
    const fileInfo = await fileTypeFromFile(inputFilePath);

    if (!fileInfo || fileInfo.mime !== "application/pdf") {
      await unlinkAsync(inputFilePath);
      return res.status(400).json({ error: "Invalid file type. Only PDFs are supported." });
    }

    const conversionType = req.body.conversionType.replace(/[^a-zA-Z0-9-_]/g, "");
    const originalName = req.file.originalname.replace(/[^a-zA-Z0-9-_.]/g, "_").substring(0, 100);

    const credentials = new ServicePrincipalCredentials({
      clientId: process.env.PDF_SERVICES_CLIENT_ID,
      clientSecret: process.env.PDF_SERVICES_CLIENT_SECRET
    });

    const clientConfig = new ClientConfig({ timeout: 60000 });

    const pdfServices = new PDFServices({ credentials, clientConfig });

    const inputAsset = await pdfServices.upload({
      readStream: fs.createReadStream(inputFilePath),
      mimeType: MimeType.PDF
    });

    const job = new OCRJob({ inputAsset });

    const pollingURL = await pdfServices.submit({ job });

    const pdfServicesResponse = await pdfServices.getJobResult({
      pollingURL,
      resultType: OCRResult
    });

    const downloadsDir = path.join(process.cwd(), "downloads", conversionType.slice(0, 50));
    if (!fs.existsSync(downloadsDir)) {
      fs.mkdirSync(downloadsDir, { recursive: true, mode: 0o755 });
    }

    const outputFileName = `${originalName}_ocr_${crypto.randomBytes(4).toString("hex")}.pdf`;
    outputFilePath = path.join(downloadsDir, outputFileName);
    const relativeFilePath = path.join("downloads", conversionType, outputFileName);

    const streamAsset = await pdfServices.getContent({
      asset: pdfServicesResponse.result.asset
    });

    const writer = fs.createWriteStream(outputFilePath, { mode: 0o600 });
    streamAsset.readStream.pipe(writer);
    await new Promise((resolve, reject) => {
      writer.on("finish", resolve);
      writer.on("error", reject);
    });

    const encodedFilePath = Buffer.from(relativeFilePath).toString("base64url");
    const token = generateToken(encodedFilePath, req.ip);

    await FileToken.create({
      token,
      filePath: encodedFilePath,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000)
    });

    await unlinkAsync(inputFilePath);

    res.json({
      success: true,
      token,
      outputFormat: "pdf",
      fileName: outputFileName
    });
  } catch (err) {
    if (err instanceof SDKError || err instanceof ServiceUsageError || err instanceof ServiceApiError) {
      console.error("Adobe SDK Error:", err);
    } else {
      console.error("General Error:", err);
    }

    res.status(500).json({
      error: "OCR Conversion failed",
      details: process.env.NODE_ENV === "development" ? err.message : null
    });
  }
};
