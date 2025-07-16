import React from "react";
import PdfToWordlogo from '../assets/Pdf-Word.png';
import PdfToPresentationlogo from '../assets/Pdf-Pres.png';
import PdfToExcellogo from '../assets/Pdf-Excel.png';
import WordToPdflogo from '../assets/Word-Pdf.png';
import PresentationToPdflogo from '../assets/Pres-Pdf.png';
import ExcelToCSVlogo from '../assets/Excel-CSV.png';
import MergeDoclogo from '../assets/Merged-Pdf.png';
import CompressPdflogo from '../assets/Pdf-compress.png';


const CardData = [
  {
    path: "/pdf-to-word",
    img: PdfToWordlogo,
    title: "PDF to Word",
    text: "Transform your PDF to Word format",
    subtext: "Edit text and reuse content in Word easily.",
    footerNote: "Click to convert"
  },
  {
    path: "/pdf-to-presentation",
    img: PdfToPresentationlogo,
    title: "PDF to Presentation",
    text: "Create presentations from PDFs",
    subtext: "Convert your documents into slide-ready visuals.",
    footerNote: "Click to convert"
  },
  {
    path: "/pdf-to-excel",
    img: PdfToExcellogo,
    title: "PDF To SpreadSheets",
    text: "Convert PDFs to various SpreadSheets format.",
    subtext: "Extract tabular data to Excel for quick analysis.",
    footerNote: "Click to convert"
  },
  {
    path: "/word-to-pdf",
    img: WordToPdflogo,
    title: "Word to PDF",
    text: "Transform your Word to PDF",
    subtext: "Preserve formatting and secure your documents.",
    footerNote: "Click to convert"
  },
  {
    path: "/presentation-to-pdf",
    img: PresentationToPdflogo,
    title: "Presentation to PDF",
    text: "Convert presentations to PDFs",
    subtext: "Share slides with consistent formatting anywhere.",
    footerNote: "Click to convert"
  },
  {
    path: "/excel-to-csv",
    img: ExcelToCSVlogo,
    title: "SpreadSheets To CSV",
    text: "Convert spreadsheets to CSV",
    subtext: "Export data into a clean, shareable format.",
    footerNote: "Click to convert"
  },
  {
    path: "/merge-docs",
    img: MergeDoclogo,
    title: "Merge PDFs",
    text: "Combine multiple DOCs into one",
    subtext: "Merge files for streamlined sharing and storage.",
    footerNote: "Click to merge"
  },
  {
    path: "/compress-pdf",
    img: CompressPdflogo,
    title: "Compress PDF",
    text: "Compress an PDF file",
    subtext: "Compress PDF for streamlined storage save.",
    footerNote: "Click to compress"
  },
  {
    path: "/create-pdf",
    img: CompressPdflogo,
    title: "Create PDF",
    text: "Create PDF from any file",
    subtext: "Create PDF for streamlined storage save.",
    footerNote: "Click to create"
  },
  {
    path: "/split-pdf",
    img: CompressPdflogo,
    title: "Split PDF",
    text: "Transform your PDF to Word format",
    subtext: "Edit text and reuse content in Word easily.",
    footerNote: "Click to convert"
  },
  {
    path: "/ocr-pdf",
    img: CompressPdflogo,
    title: "Apply OCR",
    text: "Transform your PDF to Word format",
    subtext: "Edit text and reuse content in Word easily.",
    footerNote: "Click to convert"
  },
  {
    path: "/protect-pdf",
    img: CompressPdflogo,
    title: "Protect PDF",
    text: "Protect your PDF files with a password ",
    subtext: "Secure your documents with encryption.",
    footerNote: "Click to convert"
  },
  {
    path: "/unlock-pdf",
    img: CompressPdflogo,
    title: "Unlock Your PDF",
    text: "Unlock your PDF files ",
    subtext: "Remove password protection from your PDFs.",
    footerNote: "Click to convert"
  },
  {
    path: "/ai-question-generator",
    img: CompressPdflogo,
    title: "AI Question Generator",
    text: "Generate Questions with AI",
    subtext: "Generate questions from pdf using AI.",
    footerNote: "Click to Generate"
  },
  
   {
    path: "/pdf-to-jpg",
    img: CompressPdflogo,
    title: "Convert PDF to JPG",
    text: "Generate Questions with AI",
    subtext: "Generate questions from pdf using AI.",
    footerNote: "Click to Generate"
  },
   {
    path: "/word-to-jpg",
    img: CompressPdflogo,
    title: "Convert Word to JPG",
    text: "Generate Questions with AI",
    subtext: "Generate questions from pdf using AI.",
    footerNote: "Click to Generate"
  },
   {
    path: "/presentation-to-jpg",
    img: CompressPdflogo,
    title: "Convert PPT to JPG",
    text: "Generate Questions with AI",
    subtext: "Generate questions from pdf using AI.",
    footerNote: "Click to Generate"
  },
  {
    path: "/bmp-to-jpg",
    img: CompressPdflogo,
    title: "Convert BMP to JPG",
    text: "Generate Questions with AI",
    subtext: "Generate questions from pdf using AI.",
    footerNote: "Click to Generate"
  },
  {
    path: "/excel-to-jpg",
    img: CompressPdflogo,
    title: "Convert Excel Sheets to JPG",
    text: "Generate Questions with AI",
    subtext: "Generate questions from pdf using AI.",
    footerNote: "Click to Generate"
  },
  {
    path: "/png-to-jpg",
    img: CompressPdflogo,
    title: "Convert an PNG to JPG",
    text: "Generate Questions with AI",
    subtext: "Generate questions from pdf using AI.",
    footerNote: "Click to Generate"
  }
];

export default CardData;