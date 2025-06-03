
import { fs, path, crypto, dotenv, fileTypeFromFile, promisify, FileToken, generateToken } from "../utils/coreModules.js";

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
} from "@adobe/pdfservices-node-sdk";

dotenv.config();
const unlinkAsync = promisify(fs.unlink);

export const splitPdf = async (req, res) => {
  let readStream   = null;
  const outputFiles = [];

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

    const pageCount = parseInt(req.body.pageCount, 10) || 2;

    const credentials = new ServicePrincipalCredentials({
      clientId:     process.env.PDF_SERVICES_CLIENT_ID,
      clientSecret: process.env.PDF_SERVICES_CLIENT_SECRET
    });

    const clientConfig = new ClientConfig({ timeout: 60000 });

    const pdfServices = new PDFServices({ credentials, clientConfig });

    readStream = fs.createReadStream(inputFilePath);
    const inputAsset = await pdfServices.upload({
      readStream,
      mimeType: MimeType.PDF
    });

    const params = new SplitPDFParams({ pageCount });
    const job    = new SplitPDFJob({ inputAsset, params });

    const pollingURL = await pdfServices.submit({ job });
    const result     = await pdfServices.getJobResult({
      pollingURL,
      resultType: SplitPDFResult
    });

    const downloadsDir = path.join(process.cwd(), "downloads", "split");
    fs.mkdirSync(downloadsDir, { recursive: true, mode: 0o755 });

    const assets = result.result.assets;
    for (let i = 0; i < assets.length; i++) {
      const streamAsset = await pdfServices.getContent({ asset: assets[i] });

      const baseName       = path.parse(req.file.originalname).name;
      const safeBase       = baseName.replace(/[^a-zA-Z0-9-_]/g, "_").slice(0, 50);
      const randomHex      = crypto.randomBytes(4).toString("hex");
      const fileName       = `${safeBase}_part${i + 1}_${randomHex}.pdf`;

      const outputFilePath = path.join(downloadsDir, fileName);
      const relativePath   = path.join("downloads", "split", fileName);

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

      outputFiles.push({ fileName, token });
    }


    await unlinkAsync(inputFilePath);
    readStream.destroy();

    res.json({
      success: true,
      parts:   outputFiles
    });

  } catch (err) {
    console.error("Split error:", err);

    readStream?.destroy();

    outputFiles.forEach(({ fileName }) => {
      fs.unlink(path.join(process.cwd(), "downloads", "split", fileName), () => {});
    });
    if (req.file?.path) unlinkAsync(req.file.path).catch(() => {});

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
