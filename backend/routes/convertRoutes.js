
import { express, multer } from '../utils/coreModules.js'; 

import {

  convertFile, adobeConverter, mergePdfs, downloadConvertedFile, adobeCompressor, adobeCreatePDF, splitPdf, ocr_pdf, protectPdf, removePass, convertImg 

}from '../controllers/routesHeader.js'; 


const router = express.Router();

const upload = multer({ dest: 'uploads/' });

router.post('/convert', upload.single('file'), convertFile); // Endpoint for file conversion
router.post('/adobeConvert', upload.single('file'), adobeConverter); // Endpoint for Adobe conversion
router.post('/merge', upload.array('files', 10), mergePdfs); // Endpoint for file merging
router.post('/compress', upload.single('file'), adobeCompressor); // Endpoint for file compression
router.post('/adobeCreatePDF', upload.single('file'), adobeCreatePDF); // Endpoint for Adobe Create PDF
router.post('/split-pdf', upload.single('file'), splitPdf); // Endpoint for PDF splitting
router.post('/ocr-convert', upload.single('file'), ocr_pdf); // Endpoint for OCR PDF conversion
router.post('/protect', upload.single('file'), protectPdf); // Endpoint for PDF protection
router.post('/unlock', upload.single('file'), removePass); // Endpoint for PDF unlocking

router.post('/ccimgConvert', upload.single('file'), convertImg); // Endpoint for image conversion using CloudConvert

router.get('/download', downloadConvertedFile); // Endpoint for file download



export default router;
