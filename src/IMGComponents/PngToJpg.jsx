import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DragDropFile from '../otherComponents/DragDropFile';

import '../Styles/Main-1.css';

const PngToJpg = () => {
  const [file, setFile] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const maxFileSize = 5 * 1024 * 1024; 
  
  const allowedExtensions = ['.png'];
  const allowedMimeTypes = [
    'image/png',
  ];

  const sanitizeFilename = (filename) => {
    return filename.replace(/[^a-zA-Z0-9-_.]/g, '');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || isLoading) return;

    setIsLoading(true);
    setErrorMessage('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('outputFormat', 'jpg');
      formData.append('conversionType', 'png-to-jpg');

      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/ccimgConvert`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const err = await res.text();
        throw new Error(err || 'Conversion failed');
      }

      const result = await res.json();
      
      if (result.success) {
        const encodedToken = encodeURIComponent(result.token);
        navigate(`/download?token=${encodedToken}&outputFormat=jpg`);
      } else {
        throw new Error('Conversion failed');
      }
    } catch (e) {
      console.error('Conversion error:', e);
      setErrorMessage(e.message.startsWith('{') ? 'Invalid server response' : `Error: ${e.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
    <div className="png-to-jpg container mt-5">
      <h2 className="text-center mb-4">PNG to JPG</h2>
      <div className="card shadow mx-auto" style={{ maxWidth: '500px' }}>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
          <DragDropFile 
              setFile={setFile}
              setErrorMessage={setErrorMessage}
              allowedMimeTypes={allowedMimeTypes}
              allowedExtensions={allowedExtensions}
              sanitizeFilename={sanitizeFilename}
              maxFileSize={maxFileSize}
              description='Only PNG files.'
            />
          
          <p className="mt-3 text-center">or</p>
            <button 
              type="submit" 
              className="btn btn-primary w-40 d-block mx-auto" 
              disabled={!file || isLoading}
            >
              {isLoading ? (
                <span className="converting-shimmer">Converting...</span>
              ) : (
                "Convert to JPG"
              )}
            </button>
          </form>

          {errorMessage && (
            <div className="alert alert-danger mt-3 mb-0">
              {errorMessage}
            </div>
          )}
        </div>
      </div>
    </div>

    {/* Q&A Section */}
  <div className="container mt-5 mb-5 text-center">
  <h4 className="mb-4">
    How to convert images with the DocSwitch PNG to JPG converter tool
  </h4>
  <p className="mb-4">
    Follow these simple steps to convert your PNG images to JPG format:
  </p>

  <div className="d-flex justify-content-center">
    <ol className="list-group list-group-numbered text-start" style={{ maxWidth: "600px", width: "100%" }}>
      <li className="list-group-item">
        Click the <strong>"Select or Choose File"</strong> button or drag and drop a PNG file.
      </li>
      <li className="list-group-item">
        Choose any PNG image you want to convert to JPG format.
      </li>
      <li className="list-group-item">
        Our tool will automatically convert the PNG image into a high-quality JPG file.
      </li>
      <li className="list-group-item">
        If multiple images are uploaded, they will be provided in a downloadable ZIP folder.
      </li>
      <li className="list-group-item">
        After conversion, download the JPG file(s) or share them as needed.
      </li>
    </ol>
  </div>
</div>
    </>
  );
};

export default PngToJpg;