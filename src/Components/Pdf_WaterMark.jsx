
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DragDropFile from '../otherComponents/DragDropFile.jsx';
import '../Styles/Main-1.css';

const PdfWatermark = () => {
  const navigate = useNavigate();

  // files & basic state
  const [pdfFile, setPdfFile] = useState(null);
  const [watermarkImage, setWatermarkImage] = useState(null);
  const [watermarkText, setWatermarkText] = useState('');

  // iLovePDF options
  const [mode, setMode] = useState('text'); // 'text' | 'image'
  const [pages, setPages] = useState('all'); // 'all' or custom page ranges
  const [opacity, setOpacity] = useState(60); // 0..100
  const [layer, setLayer] = useState('above'); // 'above'|'below'
  const [verticalPosition, setVerticalPosition] = useState('middle'); // top|middle|bottom
  const [horizontalPosition, setHorizontalPosition] = useState('center'); // left|center|right
  const [mosaic, setMosaic] = useState(false);
  const [rotation, setRotation] = useState(0); // degrees
  const [fontSize, setFontSize] = useState(18);
  const [fontColor, setFontColor] = useState('#000000');

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const maxPdfSize = 40 * 1024 * 1024; // 40MB (adjust)
  const maxImageSize = 5 * 1024 * 1024; // 5MB

  const allowedPdfMime = ['application/pdf'];
  const allowedPdfExt = ['.pdf'];

  const sanitizeFilename = (filename) => filename.replace(/[^a-zA-Z0-9-_.]/g, '_').slice(0, 150);

  const handleImageSelect = (file) => {
    setWatermarkImage(file || null);
    if (file) setMode('image');
  };

  const handlePdfSelect = (file) => {
    setPdfFile(file || null);
  };

  const validate = () => {
    if (!pdfFile) {
      setErrorMessage('Please upload a PDF to watermark.');
      return false;
    }
    if (pdfFile.size > maxPdfSize) {
      setErrorMessage('PDF too large.');
      return false;
    }
    if (watermarkImage) {
      if (!/^image\//.test(watermarkImage.type)) {
        setErrorMessage('Watermark must be an image file.');
        return false;
      }
      if (watermarkImage.size > maxImageSize) {
        setErrorMessage('Watermark image too large (max 5MB).');
        return false;
      }
    }
    if (mode === 'text' && (!watermarkText || !String(watermarkText).trim())) {
      setErrorMessage('Please enter watermark text or select image mode.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    if (!validate()) return;

    setIsLoading(true);

    try {
      const fd = new FormData();
      fd.append('file', pdfFile);
      // mode: text|image
      fd.append('mode', mode);

      if (mode === 'text') {
        fd.append('watermarkText', watermarkText);
      } else if (mode === 'image' && watermarkImage) {
        fd.append('watermarkImage', watermarkImage);
      }

      // other options
      fd.append('pages', pages || 'all');
      fd.append('opacity', String(Math.max(0, Math.min(100, Number(opacity)))));
      fd.append('layer', layer);
      fd.append('verticalPosition', verticalPosition);
      fd.append('horizontalPosition', horizontalPosition);
      fd.append('mosaic', mosaic ? 'true' : 'false');
      fd.append('rotation', String(rotation));
      fd.append('fontSize', String(fontSize));
      fd.append('fontColor', fontColor);

      // if neither text nor image provided, ask backend to use server fallback
      if (!watermarkText && !watermarkImage) {
        fd.append('useServerWatermark', 'true');
      }

      const endpoint = `${import.meta.env.VITE_BACKEND_URL}/watermark`;
      const res = await fetch(endpoint, {
        method: 'POST',
        body: fd
      });

      if (!res.ok) {
        // try to read JSON error first
        let body;
        try { body = await res.json(); } catch (_) { body = await res.text(); }
        throw new Error(body?.error || body?.details || body || 'Server error');
      }

      // expects JSON { success: true, token }
      const json = await res.json();
      if (json.success && json.token) {
        const token = encodeURIComponent(json.token);
        navigate(`/download?token=${token}&outputFormat=pdf`);
      } else {
        throw new Error(json.error || 'Watermarking failed');
      }
    } catch (err) {
      console.error('Watermark error:', err);
      setErrorMessage(String(err.message || err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="pdf-to-pptx container mt-5">
      <h2 className="text-center mb-4">Advanced PDF Watermark</h2>

      <div className="card shadow mx-auto" style={{ maxWidth: 960 }}>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="row gx-4">
              <div className="col-lg-5">
                <label className="form-label">PDF to watermark</label>
                <DragDropFile
                  setFile={handlePdfSelect}
                  setErrorMessage={setErrorMessage}
                  allowedMimeTypes={allowedPdfMime}
                  allowedExtensions={allowedPdfExt}
                  sanitizeFilename={sanitizeFilename}
                  maxFileSize={maxPdfSize}
                  description="PDF"
                />
                {pdfFile && <div className="mt-2"><small className="text-muted">Selected: {pdfFile.name}</small></div>}

                <hr />

                <label className="form-label mt-3">Mode</label>
                <div className="d-flex gap-2 mb-3">
                  <div>
                    <input id="modeText" type="radio" name="mode" checked={mode === 'text'} onChange={() => setMode('text')} />
                    <label htmlFor="modeText" style={{ marginLeft: 6 }}>Text</label>
                  </div>
                  <div>
                    <input id="modeImage" type="radio" name="mode" checked={mode === 'image'} onChange={() => setMode('image')} />
                    <label htmlFor="modeImage" style={{ marginLeft: 6 }}>Image</label>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">Pages</label>
                  <input
                    type="text"
                    className="form-control"
                    value={pages}
                    onChange={(e) => setPages(e.target.value)}
                    placeholder="all | 1-3 | 2,4,6 | 3-end"
                  />
                  <div className="form-text">Use iLovePDF page range syntax (e.g. "all", "1-3", "3-end", "1,4").</div>
                </div>

                <div className="mb-3">
                  <label className="form-label">Opacity: {opacity}%</label>
                  <input type="range" min="0" max="100" value={opacity} onChange={(e) => setOpacity(Number(e.target.value))} />
                </div>

                <div className="mb-3">
                  <label className="form-label">Layer</label>
                  <select className="form-select" value={layer} onChange={(e) => setLayer(e.target.value)}>
                    <option value="above">Above (on top of content)</option>
                    <option value="below">Below (under content)</option>
                  </select>
                </div>

              </div>

              <div className="col-lg-7">
                <label className="form-label">Watermark options</label>

                {mode === 'text' && (
                  <>
                    <div className="mb-3">
                      <small className="d-block text-muted">Watermark Text</small>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Confidential — Company Name"
                        value={watermarkText}
                        onChange={(e) => setWatermarkText(e.target.value)}
                        maxLength={300}
                      />
                      <div className="form-text">This text will be drawn on pages (preferred for simple text overlays).</div>
                    </div>

                    <div className="row gx-2">
                      <div className="col-6 mb-3">
                        <label className="form-label">Font size (px)</label>
                        <input type="number" className="form-control" value={fontSize} onChange={(e) => setFontSize(Number(e.target.value || 18))} min={8} max={200} />
                      </div>
                      <div className="col-6 mb-3">
                        <label className="form-label">Font color</label>
                        <input type="color" className="form-control form-control-color" value={fontColor} onChange={(e) => setFontColor(e.target.value)} />
                      </div>
                    </div>
                  </>
                )}

                {mode === 'image' && (
                  <>
                    <div className="mb-3">
                      <small className="d-block text-muted">Upload watermark image (PNG/JPG, transparent PNG recommended)</small>
                      <input
                        type="file"
                        accept="image/*"
                        className="form-control"
                        onChange={(e) => handleImageSelect(e.target.files?.[0] || null)}
                      />
                      <div className="form-text">If image is provided it will be used (overrides text).</div>

                      {watermarkImage && (
                        <div className="mt-2">
                          <img
                            src={URL.createObjectURL(watermarkImage)}
                            alt="watermark-preview"
                            style={{ maxWidth: '220px', maxHeight: '120px', border: '1px solid #eaeaea', borderRadius: 6 }}
                          />
                          <div><small className="text-muted">Image: {watermarkImage.name}</small></div>
                        </div>
                      )}
                    </div>
                  </>
                )}

                <div className="row gx-2">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Vertical Position</label>
                    <select className="form-select" value={verticalPosition} onChange={(e) => setVerticalPosition(e.target.value)}>
                      <option value="top">Top</option>
                      <option value="middle">Middle</option>
                      <option value="bottom">Bottom</option>
                    </select>
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label">Horizontal Position</label>
                    <select className="form-select" value={horizontalPosition} onChange={(e) => setHorizontalPosition(e.target.value)}>
                      <option value="left">Left</option>
                      <option value="center">Center</option>
                      <option value="right">Right</option>
                    </select>
                  </div>
                </div>

                <div className="d-flex align-items-center gap-3 mb-3">
                  <div>
                    <input id="mosaic" type="checkbox" checked={mosaic} onChange={(e) => setMosaic(e.target.checked)} />
                    <label htmlFor="mosaic" style={{ marginLeft: 6 }}>Mosaic (tile watermark)</label>
                  </div>

                  <div>
                    <label className="form-label mb-0">Rotation: {rotation}°</label>
                    <input type="range" min="-180" max="180" value={rotation} onChange={(e) => setRotation(Number(e.target.value))} />
                  </div>
                </div>

                <div className="mt-4">
                  <div className="d-grid gap-2">
                    <button type="submit" className="btn btn-primary" disabled={!pdfFile || isLoading}>
                      {isLoading ? 'Processing...' : 'Apply Watermark & Download'}
                    </button>
                  </div>

                  <div className="mt-3">
                    <small className="text-muted">If both text and image are empty, the server's fallback watermark will be used (if available).</small>
                  </div>
                </div>

                {errorMessage && (
                  <div className="alert alert-danger mt-3">{errorMessage}</div>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>

      <div className="container mt-4 mb-5 text-center">
        <small className="text-muted">Tip: For best results use a semi-transparent PNG for image watermarks. Page ranges follow iLovePDF syntax: "all", "1-3", "3-end", "1,4,6".</small>
      </div>
    </div>
  );
};

export default PdfWatermark;

