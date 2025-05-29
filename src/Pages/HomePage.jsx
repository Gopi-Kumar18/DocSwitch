

import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css'; 
import '../Styles/HomePage.css'; 
import CardItem from '../otherComponents/CardItem'; 

import PdfToWordlogo from '../assets/Pdf-Word.png';
import PdfToPresentationlogo from '../assets/Pdf-Pres.png';
import PdfToExcellogo from '../assets/Pdf-Excel.png';
import WordToPdflogo from '../assets/Word-Pdf.png';
import PresentationToPdflogo from '../assets/Pres-Pdf.png';
import ExcelToCSVlogo from '../assets/Excel-CSV.png';
import MergeDoclogo from '../assets/Merged-Pdf.png';
import CompressPdflogo from '../assets/Pdf-compress.png';

const conversionTypes = ["DOCX", "PDF", "PPTX", "JPG", "PNG"];

const cardData = [
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
  }
];

const HomePage = () => {
  const [currentConversion, setCurrentConversion] = useState(conversionTypes[0]);
  const [fade, setFade] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(true);
      setTimeout(() => {
        setCurrentConversion(prev => {
          const index = conversionTypes.indexOf(prev);
          return conversionTypes[(index + 1) % conversionTypes.length];
        });
        setFade(false);
      }, 500);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="home-page container">
      <header className="text-center mt-5">
        <div className="display-6">From PDFs to Everything – Instantly</div>
        <p className="lead">
          Transform your documents to {" "}
          <span className={`conversion-text ${fade ? 'fade-out' : 'fade-in'}`}>{currentConversion}</span>{" "}
          effortlessly. All tools are FREE and user-friendly!
        </p>
      </header>

      <div className="row justify-content-center mt-4">
        {cardData.slice(0, 6).map((card, index) => (
          <CardItem key={index} {...card} />
        ))}
      </div>

      <br /><br />
      <h3 className="text-center">Our other frequently used PDF conversions</h3>
      <br />

      <div className="row justify-content-center">
        {cardData.slice(6, 8).map((card, index) => (
          <CardItem key={index} {...card} />
        ))}
      </div>

      <br /><br />
      <h3 className="text-center">Anything To PDF</h3>
      <br />

      <div className="row justify-content-center">
        {cardData.slice(8, 9).map((card, index) => (
          <CardItem key={index} {...card} />
        ))}
      </div>

    </div>
  );
};

export default HomePage;



