
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DragDropFile from '../otherComponents/DragDropFile.jsx';

import '../Styles/Main-1.css';

const PresenationToJpg = () => {
  const [file, setFile] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const maxFileSize = 5 * 1024 * 1024; 

  const allowedExtensions = ['.pptx', '.ppt']; 
  const allowedMimeTypes = [
    'application/vnd.ms-powerpoint', 
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',  
    'application/zip' 
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
      formData.append('conversionType', 'presentation-to-jpg');

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
    <div className="presentation-to-jpg container mt-5">
      <h2 className="text-center mb-4">Presentation to JPG</h2>
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
              description='Presentaion Files (PPTX, PPT)'
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
                "Convert to JPG"
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
    </div>

    {/* Q&A Section */}
<div className="container mt-5 mb-5 text-center">
  <h4 className="mb-4">
    How to convert PowerPoint slides with the DocSwitch PPT to JPG converter tool
  </h4>
  <p className="mb-4">
    Follow these simple steps to convert PowerPoint presentations to JPG images:
  </p>

  <div className="d-flex justify-content-center">
    <ol className="list-group list-group-numbered text-start" style={{ maxWidth: "600px", width: "100%" }}>
      <li className="list-group-item">
        Click the <strong>"Choose File"</strong> button or drag and drop a PowerPoint (.ppt or .pptx) file.
      </li>
      <li className="list-group-item">
        Select the presentation file you wish to convert.
      </li>
      <li className="list-group-item">
        Each slide will be transformed into a separate JPG image automatically.
      </li>
      <li className="list-group-item">
        Download all converted images or share them as a zip archive.
      </li>
    </ol>
  </div>
</div>

    </>
  );
};

export default PresenationToJpg;