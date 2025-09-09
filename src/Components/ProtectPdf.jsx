import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DragDropFile from '../otherComponents/DragDropFile.jsx';
import api from '../services/api';

import '../Styles/Main-1.css';

const ProtectPdf = () => {
  const [file, setFile] = useState(null);
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const maxFileSize = 10 * 1024 * 1024; 

  const allowedExtensions = ['.pdf'];
  const allowedMimeTypes = ['application/pdf'];

  const sanitizeFilename = (filename) => {
    return filename.replace(/[^a-zA-Z0-9-_.]/g, '');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !password || isLoading) return;

    setIsLoading(true);
    setErrorMessage('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('password', password);

      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/protect`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || 'Protection failed');
      }

      const result = await res.json();
      if (result.success) {
        const encodedToken = encodeURIComponent(result.token);
        navigate(`/download?token=${encodedToken}&outputFormat=pdf`);
      } else {
        throw new Error('Protection failed');
      }
    } catch (err) {
      console.error('Protection error:', err);
      setErrorMessage(
        err.message.startsWith('{')
          ? 'Invalid server response'
          : `Error: ${err.message}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="protect-pdf container mt-5">
        <h2 className="text-center mb-4">Protect PDF</h2>
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
                description="PDF file to protect"
              />

              <div className="form-group mt-3">
                <label htmlFor="password">Enter Password:</label>
                <input
                  type="password"
                  id="password"
                  className="form-control"
                  value={password}
                  maxLength={32}
                  onChange={(e) => setPassword(e.target.value.replace(/[^a-zA-Z0-9!@#_$%^&*()-=+]/g, ''))}
                  placeholder="Choose a secure password"
                  required
                />
              </div>

              <div className="mt-4 text-center">
                <button
                  type="submit"
                  className="btn btn-primary w-40 d-block mx-auto"
                  disabled={!file || !password || isLoading}
                >
                  {isLoading ? (
                    <span className="converting-shimmer">Protecting...</span>
                  ) : (
                    'Protect PDF'
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
        <h4 className="mb-4">How to protect your PDF file</h4>
        <p className="mb-4">
          Secure your PDF with a password in just a few easy steps:
        </p>

        <div className="d-flex justify-content-center">
          <ol
            className="list-group list-group-numbered text-start"
            style={{ maxWidth: '600px', width: '100%' }}
          >
            <li className="list-group-item">
              Click “Select File” or drag and drop your PDF document.
            </li>
            <li className="list-group-item">
              Enter a password to encrypt and protect your PDF.
            </li>
            <li className="list-group-item">
              Click “Protect PDF” and wait for the process to complete.
            </li>
            <li className="list-group-item">
              Download your encrypted PDF using the link provided.
            </li>
          </ol>
        </div>
      </div>
    </>
  );
};

export default ProtectPdf;
