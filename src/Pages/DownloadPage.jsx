
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

const DownloadPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const outputFormat = searchParams.get('outputFormat') || 'file';
  const navigate = useNavigate();

  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const downloadUrl = `${backendUrl}/download?token=${encodeURIComponent(token)}&outputFormat=${outputFormat}`;

  const [copied, setCopied] = useState(false);

  const handleDownload = () => {
    window.location.href = downloadUrl;
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(downloadUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  return (
    <div className="download-page container mt-5">
      <h2 className="text-center mb-4">Your file is ready!</h2>

      <div className="card shadow mx-auto mb-4" style={{ maxWidth: '600px' }}>
        <div className="card-body">
          <p className="text-center mb-3">
            Click “Download” to get your {outputFormat.toUpperCase()} file, or share this secure link:
          </p>

          <div className="d-flex mb-3">
            <input
              type="text"
              className="form-control"
              readOnly
              value={downloadUrl}
            />
            <button
              className={`btn btn-outline-primary ms-2`}
              onClick={handleCopyLink}
            >
              {copied ? 'Copied!' : 'Copy link'}
            </button>
          </div>

          <div className="text-center">
            <button onClick={handleDownload} className="btn btn-success me-3">
              Download {outputFormat.toUpperCase()}
            </button>
            <button onClick={handleBackToHome} className="btn btn-secondary">
              Back to Homepage
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DownloadPage;

