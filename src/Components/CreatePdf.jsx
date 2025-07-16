import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DragDropFile from '../otherComponents/DragDropFile.jsx';

import '../Styles/Main-1.css';

const CreatePdf = () => {
  const [file, setFile] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const maxFileSize = 5 * 1024 * 1024;

  const allowedExtensions = [
    '.doc', '.docx',
    '.ppt', '.pptx',
    '.xls', '.xlsx',
    '.rtf',
    '.txt', '.html',
    '.jpg', '.jpeg', '.png', '.bmp', '.gif', '.tiff'
  ];

  const allowedMimeTypes = [
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/rtf',
    'text/plain',
    'text/html',
    'image/jpeg',
    'image/png',
    'image/bmp',
    'image/gif',
    'image/tiff'
  ];

  const sanitizeFilename = (filename) => {
    return filename.replace(/[^a-zA-Z0-9-_.]/g, '_');
  };

  const handleConversion = async (e) => {
    e.preventDefault();
    if (!file || isLoading) return;

    setIsLoading(true);
    setErrorMessage('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/adobeCreatePDF`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Conversion failed');
      }

      const result = await response.json();
      if (result.success) {
        const encodedToken = encodeURIComponent(result.token);
        navigate(`/download?token=${encodedToken}&outputFormat=pdf`);
      } else {
        throw new Error('Conversion failed');
      }
    } catch (err) {
      console.error('Conversion error:', err);
      setErrorMessage(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="create-pdf container mt-5">
      <h2 className="text-center mb-4">Convert to PDF</h2>
      <div className="card shadow mx-auto" style={{ maxWidth: '500px' }}>
        <div className="card-body">
          <form onSubmit={handleConversion}>
            <DragDropFile
              setFile={setFile}
              setErrorMessage={setErrorMessage}
              allowedMimeTypes={allowedMimeTypes}
              allowedExtensions={allowedExtensions}
              sanitizeFilename={sanitizeFilename}
              maxFileSize={maxFileSize}
              description="Supported: DOCX, PPTX, XLSX, RTF, TXT, HTML, Images"
            />

            <div className="mt-3 text-center">
              <button
                type="submit"
                className="btn btn-primary w-40 d-block mx-auto"
                disabled={!file || isLoading}
              >
                {isLoading ? (
                  <span className="converting-shimmer">Converting...</span>
                ) : (
                  'Convert to PDF'
                )}
              </button>
            </div>
          </form>

          {errorMessage && (
            <div className="alert alert-danger mt-3 mb-0">
              {errorMessage}
            </div>
          )}
        </div>
      </div>

      {/* Q&A Section */}
      <div className="container mt-5 mb-5 text-center">
        <h4 className="mb-4">How to convert documents with Create PDF</h4>
        <p className="mb-4">Follow these easy steps to turn any supported file into a PDF:</p>

        <div className="d-flex justify-content-center">
          <ol className="list-group list-group-numbered text-start" style={{ maxWidth: '600px', width: '100%' }}>
            <li className="list-group-item">
              Click the <strong>Select or Drop File</strong> area to choose your document.
            </li>
            <li className="list-group-item">
              The tool accepts DOC/DOCX, PPT/PPTX, XLS/XLSX, RTF, TXT, HTML, and images.
            </li>
            <li className="list-group-item">
              Our service will automatically convert it to a PDF file.
            </li>
            <li className="list-group-item">
              After conversion, you will be prompted to download your PDF.
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default CreatePdf;