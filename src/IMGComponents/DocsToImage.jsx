import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// import DocPreview from '../Reusable_Components/DocumentPreview.jsx';
import DragDropFile from '../otherComponents/DragDropFile.jsx';

/**
 * Generic document/image to image converter UI component
 * Props:
 *   title: string - display title
 *   inputLabel: string - label for file dropper
 *   inputMimeTypes: string[]
 *   inputExtensions: string[]
 *   defaultOutputFormat: string
 *   outputFormats: string[]  // e.g. ['jpg','png']
 *   endpointBase: string     // e.g. '/ccimgConvert'
 */
const DocsToImage = ({
  title,
  inputLabel,
  inputMimeTypes,
  inputExtensions,
  outputFormats,
  endpointBase,
}) => {
  const [file, setFile] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState(outputFormats[0]);
  const navigate = useNavigate();

  const maxFileSize = 10 * 1024 * 1024;
  const sanitizeFilename = fn => fn.replace(/[^a-zA-Z0-9-_.]/g, '_');

  const handleSubmit = async e => {
    e.preventDefault();
    if (!file || isLoading) return;

    setIsLoading(true);
    setErrorMessage('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('conversionType', `${inputLabel.toLowerCase()}-to-${selectedFormat}`);

      const url = `${import.meta.env.VITE_BACKEND_URL}${endpointBase}/${selectedFormat}`;

      // console.log("url : ", url);

      const res = await fetch(
        url,
        { method: 'POST', body: formData }
      );

      if (!res.ok) throw new Error(await res.text());
      const result = await res.json();
      if (result.success) {
        navigate(`/download?token=${encodeURIComponent(result.token)}&outputFormat=${result.outputFormat}`);
      } else {
        throw new Error('Conversion failed');
      }
    } catch (err) {
      console.error('Conversion error:', err);
      setErrorMessage(err.message || 'Conversion failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="docs-to-image container mt-5">
       <h2 className="text-center mb-4">{title}</h2>
       <div className="card shadow mx-auto" style={{ maxWidth: '500px' }}>
        <div className="card-body">
        <form onSubmit={handleSubmit}>
          <DragDropFile
            setFile={setFile}
            setErrorMessage={setErrorMessage}
            allowedMimeTypes={inputMimeTypes}
            allowedExtensions={inputExtensions}
            sanitizeFilename={sanitizeFilename}
            maxFileSize={maxFileSize}
            description={inputLabel}
          />

          <div className="my-3 d-flex justify-content-center">
            <select
              className="form-select w-auto"
              value={selectedFormat}
              onChange={e => setSelectedFormat(e.target.value)}
            >
              {outputFormats.map(fmt => (
                <option key={fmt} value={fmt}>{fmt.toUpperCase()}</option>
              ))}
            </select>
          </div>

          <div className="text-center">
            <button type="submit" className="btn btn-primary" disabled={!file || isLoading}>
              {isLoading ? (<span className="converting-shimmer">Converting...</span>) : ( `Convert to ${selectedFormat.toUpperCase()}`)}
            </button>
          </div>
          {errorMessage && <div className="alert alert-danger mt-3">{errorMessage}</div>}
        </form>
      </div>
    </div>
    </div>
  );
};

export default DocsToImage;