import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DragDropFile from '../otherComponents/DragDropFile.jsx';

import '../Styles/Main-1.css';

const SplitPDF = () => {
  const [file, setFile] = useState(null);
  const [pageCount, setPageCount] = useState(2);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [parts, setParts] = useState([]);
  const navigate = useNavigate();

  const maxFileSize = 20 * 1024 * 1024; 
  const allowedMimeTypes = ['application/pdf'];
  const allowedExtensions = ['.pdf'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || isLoading) return;
    setIsLoading(true);
    setErrorMessage('');
    setParts([]);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('pageCount', pageCount);

      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/split-pdf`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Split failed');
      }

      const result = await res.json();
      if (result.success && Array.isArray(result.parts)) {
        setParts(result.parts);
      } else {
        throw new Error('Unexpected server response');
      }
    } catch (err) {
      console.error('Split error:', err);
      setErrorMessage(err.message || 'Error splitting PDF');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = (token, fileName) => {
    navigate(`/download?token=${encodeURIComponent(token)}&fileName=${encodeURIComponent(fileName)}`);
  };

  return (
    <div className="split-pdf container mt-5">
      <h2 className="text-center mb-4">Split PDF by Pages</h2>
      <div className="card shadow mx-auto" style={{ maxWidth: '500px' }}>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <DragDropFile
              setFile={setFile}
              setErrorMessage={setErrorMessage}
              allowedMimeTypes={allowedMimeTypes}
              allowedExtensions={allowedExtensions}
              sanitizeFilename={(n) => n.replace(/[^a-zA-Z0-9-_.]/g, '')}
              maxFileSize={maxFileSize}
              description="PDF file"
            />

            <div className="mt-3">
              <label htmlFor="pageCount" className="form-label">
                Pages per split
              </label>
              <input
                type="number"
                id="pageCount"
                className="form-control"
                min="1"
                value={pageCount}
                onChange={(e) => setPageCount(Number(e.target.value))}
                disabled={isLoading}
              />
            </div>

            <div className="mt-3 text-center">
              <button
                type="submit"
                className="btn btn-primary w-40 d-block mx-auto"
                disabled={!file || isLoading}>
                {isLoading ? (<span className="converting-shimmer">Splitting...</span>) : ("Split PDF")}
              </button>
            </div>
          </form>

          {errorMessage && (
            <div className="alert alert-danger mt-3 mb-0">{errorMessage}</div>
          )}
        </div>
      </div>

      {parts.length > 0 && (
        <div className="download-results container mt-4 text-center">
          <h4 className="mb-3">Download your split documents</h4>
          <div className="d-flex flex-wrap justify-content-center gap-2">
            {parts.map(({ token, fileName }, i) => (
              <button
                key={i}
                className="btn btn-outline-primary"
                onClick={() => handleDownload(token, fileName)}
              >
                {fileName}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SplitPDF;
