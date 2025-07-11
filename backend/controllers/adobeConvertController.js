
import {fs, path, crypto, dotenv, fileTypeFromFile, promisify, FileToken, generateToken } from "../utils/coreModules.js";

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
    ServiceApiError
} from "@adobe/pdfservices-node-sdk";


dotenv.config();
const unlinkAsync = promisify(fs.unlink);

export const adobeConverter = async (req, res) => {
  let outputFilePath = null;
  try {

    if (!req.file || !req.body.outputFormat || !req.body.conversionType) {
      return res.status(400).json({ error: "Missing required parameters" });
    }


    const inputFilePath = req.file.path;
    const fileInfo = await fileTypeFromFile(inputFilePath);


    const allowedMimes = ["application/pdf"];
    if (!fileInfo || !allowedMimes.includes(fileInfo.mime)) {
      await unlinkAsync(inputFilePath);
      return res.status(400).json({ error: "Invalid file type" });
    }

  
    const outputFormat = req.body.outputFormat.replace(/[^a-z]/gi, "");
    const conversionType = req.body.conversionType.replace(/[^a-zA-Z0-9-_]/g, "");
    const originalName = req.file.originalname.replace(/[^a-zA-Z0-9-_.]/g, "_").substring(0, 100);

      

    let targetFormat;
switch (outputFormat) {
  case "pptx":
    targetFormat = ExportPDFTargetFormat.PPTX;
    break;
  case "xlsx":
    targetFormat = ExportPDFTargetFormat.XLSX;
    break;
  case "jpg":
  case "jpeg":
    targetFormat = ExportPDFTargetFormat.JPEG;
    break;
  case "png":
    targetFormat = ExportPDFTargetFormat.PNG;
    break;
  default:
    return res.status(400).json({ error: "Unsupported conversion format" });
}

    const credentials = new ServicePrincipalCredentials({
      clientId: process.env.PDF_SERVICES_CLIENT_ID,
      clientSecret: process.env.PDF_SERVICES_CLIENT_SECRET
    });

    if (!credentials) {
      console.error("Credentials not found");
    }
    
    const pdfServices = new PDFServices({ credentials });


    const inputAsset = await pdfServices.upload({
      readStream: fs.createReadStream(inputFilePath),
      mimeType: MimeType.PDF
    });

    const params = new ExportPDFParams({
      targetFormat: targetFormat
    });

    const job = new ExportPDFJob({
      inputAsset,
      params
    });

    const pollingURL = await pdfServices.submit({ job });

    const pdfServicesResponse = await pdfServices.getJobResult({
      pollingURL,
      resultType: ExportPDFResult
    });

    const downloadsDir = path.join(process.cwd(),"downloads",conversionType.slice(0, 50));
    if (!fs.existsSync(downloadsDir)) {
      fs.mkdirSync(downloadsDir, { recursive: true, mode: 0o755 });
    }

    const outputFileName = `${originalName}_${crypto.randomBytes(4).toString("hex")}.${outputFormat}`;

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

    const encodedFilePath = Buffer.from(relativeFilePath).toString('base64url');

    const token = generateToken(encodedFilePath, req.ip); 

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

    res.json({
      success: true,
      token,
      outputFormat,
      fileName: outputFileName
    });
  } catch (err) {
    if (err instanceof SDKError || err instanceof ServiceUsageError || err instanceof ServiceApiError) {
      console.error("Exception encountered while executing operation", err);
  } else {
      console.error("Exception encountered while executing operation", err);
  }

    res.status(500).json({
      error: "Conversion failed",
      details: process.env.NODE_ENV === "development" ? err.message : null
    });
  }
};
