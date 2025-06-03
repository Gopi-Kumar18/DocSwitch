
import {fs, path, crypto, dotenv, fileTypeFromFile, promisify, FileToken, generateToken} from "../utils/coreModules.js";

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
} from "@adobe/pdfservices-node-sdk";


dotenv.config();
const unlinkAsync = promisify(fs.unlink);

export const adobeCreatePDF = async (req, res) => {
  let outputFilePath = null;
  let readStream;
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file provided" });
    }

    
    const inputFilePath = req.file.path;
    const fileInfo = await fileTypeFromFile(inputFilePath);

    const allowedMimesMap = {
      // Word formats
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": MimeType.DOCX,
      "application/msword": MimeType.DOC,
      // PowerPoint formats
      "application/vnd.openxmlformats-officedocument.presentationml.presentation": MimeType.PPTX,
      "application/vnd.ms-powerpoint": MimeType.PPT,
      // Excel formats
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": MimeType.XLSX,
      "application/vnd.ms-excel": MimeType.XLS,
      // Rich Text
      "application/rtf": MimeType.RTF,
      // Text and HTML
      "text/plain": MimeType.TXT,
      "text/html": MimeType.HTML,
      // Images
      "image/jpeg": MimeType.JPEG,
      "image/png": MimeType.PNG,
      "image/bmp": MimeType.BMP,
      "image/gif": MimeType.GIF,
      "image/tiff": MimeType.TIFF
    };
    if (!fileInfo || !allowedMimesMap[fileInfo.mime]) {
      await unlinkAsync(inputFilePath);
      return res.status(400).json({ error: "Unsupported file type" });
    }

    
    const originalName = req.file.originalname
      .replace(/[^a-zA-Z0-9-_.]/g, "_")
      .substring(0, 100);

      const credentials = new ServicePrincipalCredentials({
        clientId: process.env.PDF_SERVICES_CLIENT_ID,
        clientSecret: process.env.PDF_SERVICES_CLIENT_SECRET
      });


const clientConfig = new ClientConfig({ timeout: 60000 });


const pdfServices = new PDFServices({ credentials, clientConfig });

   
    readStream = fs.createReadStream(inputFilePath);
    const inputAsset = await pdfServices.upload({
      readStream,
      mimeType: allowedMimesMap[fileInfo.mime]
    });

    
    const job = new CreatePDFJob({ inputAsset });

    const pollingURL = await pdfServices.submit({ job });

    const pdfServicesResponse = await pdfServices.getJobResult({
      pollingURL,
      resultType: CreatePDFResult
    });

    const downloadsDir = path.join(process.cwd(), "downloads", "create-pdf");
    if (!fs.existsSync(downloadsDir)) {
      fs.mkdirSync(downloadsDir, { recursive: true, mode: 0o755 });
    }

    const outputFileName = `${originalName}_${crypto.randomBytes(4).toString("hex")}.pdf`;
    outputFilePath = path.join(downloadsDir, outputFileName);
    const relativeFilePath = path.join("downloads", "create-pdf", outputFileName);

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
    const token = generateToken(encodedFilePath,req.ip); 
    await FileToken.create({
      token,
      filePath: encodedFilePath,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000)
    });

    try {
      await unlinkAsync(inputFilePath);
      console.log(`[${new Date().toISOString()}] File removed: ${inputFilePath}`);
    } catch (err) {
      console.error("File removal error:", err);
    }

    res.json({ success: true, token, fileName: outputFileName });
  } catch (err) {
    if (
      err instanceof SDKError ||
      err instanceof ServiceUsageError ||
      err instanceof ServiceApiError
    ) {
      console.error("Exception encountered while executing operation", err);
    } else {
      console.error("Exception encountered while executing operation", err);
    }
    readStream?.destroy();

    res.status(500).json({
      error: "Conversion failed",
      details: process.env.NODE_ENV === "development" ? err.message : null
    });
  }
};
