import React from 'react';
import DocToImageConverter from './DocsToImage.jsx';
import conversionQA from './data/qaData.js';
import ConversionQA from './QA.jsx';

export const PDFToImage = () => (
  <>
  <DocToImageConverter
    title="PDF to Image"
    inputLabel="PDF files"
    inputMimeTypes={['application/pdf']}
    inputExtensions={['.pdf']}
    outputFormats={['jpg', 'png']}
    endpointBase="/ccimgConvert"
  />
  <ConversionQA {...conversionQA.pdfToImage} />
  </>
);



export const WordToImage = () => (
  <>
  <DocToImageConverter
    title="Word to Image"
    inputLabel="Word files"
    inputMimeTypes={['application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document']}
    inputExtensions={['.docx', '.doc']}
    outputFormats={['jpg', 'png']}
    endpointBase="/ccimgConvert"
  />
  <ConversionQA {...conversionQA.wordToImage} />
  </>
);


export const ExcelToImage = () => (
  <>
  <DocToImageConverter
    title="Excel to Image"
    inputLabel="Excel files"
    inputMimeTypes={['application/vnd.ms-excel','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet','application/vnd.ms-excel.sheet.macroEnabled.12','text/csv']}
    inputExtensions={['.xls','.xlsx', '.csv','xlsm']}
    outputFormats={['jpg', 'png']}
    endpointBase="/ccimgConvert"
  />
  <ConversionQA {...conversionQA.excelToImage} />
  </>
);


export const PowerpointToImage = () => (
  <>
  <DocToImageConverter
    title="Presenations to Image"
    inputLabel="Powerpoint files"
    inputMimeTypes={['application/vnd.ms-powerpoint','application/vnd.openxmlformats-officedocument.presentationml.presentation']}
    inputExtensions={['.ppt', '.pptx']}
    outputFormats={['jpg', 'png']}
    endpointBase="/ccimgConvert"
  />
  <ConversionQA {...conversionQA.pptToImage} />
  </>
);


export const BMPToImage = () => (
  <>
  <DocToImageConverter
    title="BMP to Image"
    inputLabel="BMP images"
    inputMimeTypes={['image/bmp']}
    inputExtensions={['.bmp']}
    outputFormats={['jpg', 'png']}
    endpointBase="/ccimgConvert"
  />
  <ConversionQA {...conversionQA.bmpToImage} />
  </>
);



export const PNGToJPG = () => (
  <>
  <DocToImageConverter
    title="PNG to JPG"
    inputLabel="PNG images"
    inputMimeTypes={['image/png']}
    inputExtensions={['.png']}
    outputFormats={['jpg']}
    endpointBase="/ccimgConvert"
  />
  <ConversionQA {...conversionQA.pngToJpg} />
  </>
);



export const JPGToPNG = () => (
  <>
  <DocToImageConverter
    title="JPG to PNG"
    inputLabel="JPEG images"
    inputMimeTypes={['image/jpeg']}
    inputExtensions={['.jpg', '.jpeg']}
    outputFormats={['png']}
    endpointBase="/ccimgConvert"
  />
  <ConversionQA {...conversionQA.jpgToPng} />
   </>
);





