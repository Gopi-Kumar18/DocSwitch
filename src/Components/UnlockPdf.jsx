import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DragDropFile from '../otherComponents/DragDropFile.jsx';

import '../Styles/Main-1.css';

const UnlockPdf = () => {
  const [file, setFile] = useState(null);
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const maxFileSize = 10 * 1024 * 1024; 
  const allowedExtensions = ['.pdf'];
  const allowedMimeTypes = ['application/pdf'];

  const sanitizeFilename = (filename) =>
    filename.replace(/[^a-zA-Z0-9-_.]/g, '');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !password || isLoading) return;

    setIsLoading(true);
    setErrorMessage('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('password', password);

      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/unlock`, {
        method: 'POST',
        body: formData
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Unlock failed');
      }
      const result = await res.json();
      if (result.success) {
        navigate(
          `/download?token=${encodeURIComponent(result.token)}&outputFormat=pdf`
        );
      } else {
        throw new Error('Unlock failed');
      }
    } catch (err) {
      console.error('Unlock error:', err);
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
      <div className="unlock-pdf container mt-5">
        <h2 className="text-center mb-4">Unlock PDF</h2>
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
                description="Encrypted PDF file"
              />

              <div className="form-group mt-3">
                <label htmlFor="password">Password:</label>
                <input
                  type="password"
                  id="password"
                  className="form-control"
                  value={password}
                  maxLength={32}
                  onChange={(e) =>
                    setPassword(
                      e.target.value.replace(
                        /[^a-zA-Z0-9!@#_$%^&*()-=+]/g,
                        ''
                      )
                    )
                  }
                  placeholder="Enter PDF password"
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
                    <span className="converting-shimmer">Unlocking...</span>
                  ) : (
                    'Unlock PDF'
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
        <h4 className="mb-4">How to unlock a protected PDF</h4>
        <p className="mb-4">
          Easily remove password protection from your encrypted PDF:
        </p>
        <div className="d-flex justify-content-center">
          <ol
            className="list-group list-group-numbered text-start"
            style={{ maxWidth: '600px', width: '100%' }}
          >
            <li className="list-group-item">
              Click “Select File” or drag your encrypted PDF here.
            </li>
            <li className="list-group-item">
              Enter the password used to protect the PDF.
            </li>
            <li className="list-group-item">
              Click “Unlock PDF” and wait for the process to finish.
            </li>
            <li className="list-group-item">
              Download your unlocked PDF via the provided link.
            </li>
          </ol>
        </div>
      </div>
    </>
  );
};

export default UnlockPdf;
