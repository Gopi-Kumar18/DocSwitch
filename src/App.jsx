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
import SignUp from './Pages/SignUp';
import Dashboard from './Pages/Dashboard';

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

import PdfToJpg from './IMGComponents/PdfToJpg';
import WordToJpg from './IMGComponents/WordToJpg';
import PresentationToJpg from './IMGComponents/PresentationToJpg';
import BmpToJpg from './IMGComponents/BmpToJpg';
import PngToJpg from './IMGComponents/PngToJpg';
import ExcelToJpg from './IMGComponents/ExcelToJpg.jsx';

import OtherPdfTools from './WorkingPages/OtherPdfTools';
import OtherJpgTools from './WorkingPages/OtherJpgTools';

import { ThemeProvider } from './otherComponents/ThemeContext';

import { AuthProvider } from './context/AuthContext';

import useAuth from './hooks/useAuth';

import Footer from './Footer/Footer';

import AIQuestionGenerator from './AI_Integration/AIQuestionGenerator';
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

  return (
    <div className="app-container">
      <Navbar user={user} />
      
      <main className="main-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about-us" element={<AboutUs />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
          <Route path="/faqs" element={<FAQs />} />
          <Route path="/download" element={<DownloadPage />} />
          <Route path="/contact-us" element={<ContactUs />}/>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          
          {/* Protected Dashboard Route */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          
          <Route path="/other-pdf-tools" element={<OtherPdfTools />} />
          <Route path="/other-jpg-tools" element={<OtherJpgTools />} />
          
          {/* Conversion routes */}
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

          {/* Image conversion routes */}
          <Route path="/pdf-to-jpg" element={<PdfToJpg />} />
          <Route path="/word-to-jpg" element={<WordToJpg />} />
          <Route path="/presentation-to-jpg" element={<PresentationToJpg />} />
          <Route path="/bmp-to-jpg" element={<BmpToJpg />} />
          <Route path="/png-to-jpg" element={<PngToJpg />} />
          <Route path="/excel-to-jpg" element={<ExcelToJpg />} />

          <Route path="/ai-question-generator" element={<AIQuestionGenerator />} />
        </Routes>
      </main>
      
      {/* Show footer only on home page and tools page */}
      {['/', '/other-pdf-tools'].includes(location.pathname) && <Footer />}
    </div>
  );
};

export default App;