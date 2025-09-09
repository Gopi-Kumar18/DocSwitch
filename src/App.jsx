import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';

import Navbar from './Header/Navbar';
import FAQs from './Pages/FAQs';
import AboutUs from './Pages/AboutUs';
import HomePage from './Pages/HomePage';
import ContactUs from './Pages/ContactUs.jsx';
import DownloadPage from './Pages/DownloadPage';
import PrivacyPolicy from './Pages/PrivacyPolicy';
import TermsAndConditions from './Pages/TermsAndConditions';
import Login from './Pages/Login';
import SignUp from './Pages/Signup';
import Dashboard from './Pages/Dashboard';
import ForgetPass from './Pages/ForgetPass';
import ResetPass from './Pages/ResetPass';

import PdfToDocx from './Components/PdfToDocx';
import DocxToPdf from './Components/DocxToPdf';
import PdfToPptx from './Components/PdfToPptx';
import PptxToPdf from './Components/PptxToPdf';
import PdfToExcel from './Components/PdfToExcel';
import ExcelToCSV from './Components/ExcelToCSV';
import PdfCompress from './Components/PdfCompress';
import CreatePdf from './Components/CreatePdf.jsx';
import SplitPDF from './Components/SplitPDF.jsx';
import OcrPdfConverter from './Components/OcrPdfConverter.jsx';
import MergeDocumentsToPdf from './Components/MergeDocsToPdf';
import ProtectPdf from './Components/ProtectPdf.jsx';
import UnlockPdf from './Components/UnlockPdf.jsx';
import SignPdf from './Components/Sign_Pdf.jsx';
import PdfWatermark from './Components/Pdf_WaterMark.jsx';

import { PDFToImage, WordToImage, ExcelToImage, PowerpointToImage, BMPToImage, PNGToJPG, JPGToPNG } from './IMGComponents/IMG_Conversions.jsx';
import { MP4Converter, MP3Converter, MKVConverter, GIFConverter } from './MultiMediaComponents/MM_Conversions.jsx';


import AIQuestionGenerator from './AI_Integration/AIQuestionGenerator';

import OtherPdfTools from './WorkingPages/OtherPdfTools';
import OtherIMGTools from './WorkingPages/OtherIMGTools';
import MultimediaTools from './WorkingPages/MultimediaTools.jsx';

import { ThemeProvider } from './otherComponents/ThemeContext';
import FileUpload from './otherComponents/FileUpload.jsx';

import { AuthProvider } from './context/AuthContext';
import useAuth from './hooks/useAuth';

import Footer from './Footer/Footer';

import './Styles/App.css';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  return user ? children : <Navigate to="/login" replace />;
};

const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

const AppContent = () => {
  const location = useLocation();
  const { user } = useAuth();

  { /* Hide navigation bar on specific routes */ }
   const hideNavRoutes = ['/login', '/signup', '/forgot-password'];
  const shouldHideNav = hideNavRoutes.includes(location.pathname) || location.pathname.startsWith('/reset-password/');

  return (
    <div className="app-container">

       {!shouldHideNav && <Navbar user={user} />}

      
      <main className="main-content">
        {/* Pages routing */}
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about-us" element={<AboutUs />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
          <Route path="/faqs" element={<FAQs />} />
          <Route path="/download" element={<DownloadPage />} />
          <Route path="/contact-us" element={<ContactUs />}/>
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgetPass />} />
          <Route path="/reset-password/:token" element={<ResetPass />} />
          <Route path="/dashboard" element={ <ProtectedRoute><Dashboard /></ProtectedRoute>} />
          
           {/* Working - Pages routes */}
          <Route path="/other-pdf-tools" element={<OtherPdfTools />} />
          <Route path="/other-img-tools" element={<OtherIMGTools />} />
          <Route path="/multimedia-tools" element={<MultimediaTools />} />


          
          {/* Document Conversion routes */}
          <Route path="/pdf-to-word" element={<PdfToDocx />} />
          <Route path="/pdf-to-presentation" element={<PdfToPptx />} />
          <Route path="/word-to-pdf" element={<DocxToPdf />} />
          <Route path="/presentation-to-pdf" element={<PptxToPdf />} />
          <Route path="/pdf-to-excel" element={<PdfToExcel />}/>
          <Route path="/excel-to-csv" element={<ExcelToCSV />}/>
          <Route path="/compress-pdf" element={<PdfCompress />} />
          <Route path="/create-pdf" element={<CreatePdf />} />
          <Route path="/split-pdf" element={<SplitPDF />} />
          <Route path="/ocr-pdf" element={<OcrPdfConverter />} />
          <Route path="/merge-docs" element={<MergeDocumentsToPdf />} />
          <Route path="/protect-pdf" element={<ProtectPdf />} />
          <Route path="/unlock-pdf" element={<UnlockPdf />} />
          <Route path="/sign-pdf" element={<SignPdf />} />
          <Route path="/watermark-pdf" element={<PdfWatermark />} />

          {/* Image conversion routes */}
          <Route path="/png-to-jpg" element={<PNGToJPG />} />
          <Route path="/jpg-to-png" element={<JPGToPNG />} />
          <Route path="/pdf-to-image" element={<PDFToImage />} />
          <Route path="/word-to-image" element={<WordToImage />} />
          <Route path="/presentation-to-image" element={<PowerpointToImage />} />
          <Route path="/excel-to-image" element={<ExcelToImage />} />
          <Route path="/bmp-to-image" element={<BMPToImage />} />
          
          {/* AI Integration routing */}
          <Route path="/ai-question-generator" element={<AIQuestionGenerator />} />

           {/* Multimedia conversion routes */}
          <Route path="/mp4-converter" element={<MP4Converter />} />
          <Route path="/mp3-converter" element={<MP3Converter />} />
          <Route path="/mkv-converter" element={<MKVConverter />} />
          <Route path="/gif-converter" element={<GIFConverter />} />


          {/* Other components */}
          <Route path="/file-upload" element={<FileUpload />} />

          {/* Redirects routes */}
          <Route path="/home" element={<Navigate to="/" replace />} />
          <Route path="/pdf-to-jpg" element={<Navigate to="/pdf-to-image" replace />} />
          <Route path="/pdf-to-png" element={<Navigate to="/pdf-to-image" replace />} />
          
          <Route path="/word-to-jpg" element={<Navigate to="/word-to-image" replace />} />
          <Route path="/word-to-png" element={<Navigate to="/word-to-image" replace />} />
          
          <Route path="/excel-to-jpg" element={<Navigate to="/excel-to-image" replace />} />
          <Route path="/excel-to-png" element={<Navigate to="/excel-to-image" replace />} />
          
          <Route path="/powerpoint-to-jpg" element={<Navigate to="/powerpoint-to-image" replace />} />
          <Route path="/powerpoint-to-png" element={<Navigate to="/powerpoint-to-image" replace />} />
          
          <Route path="/bmp-to-jpg" element={<Navigate to="/bmp-to-image" replace />} />
          <Route path="/bmp-to-png" element={<Navigate to="/bmp-to-image" replace />} />

        </Routes>
      </main>
      
      {/* Show footer only on home page and tools page */}
      {['/', '/other-pdf-tools'].includes(location.pathname) && <Footer />}
    </div>
  );
};

export default App;