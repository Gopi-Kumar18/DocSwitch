
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DragDropFile from '../otherComponents/DragDropFile.jsx';
import DocPreview from '../Reusable_Components/DocumentPreview.jsx';
import SignUI from '../Reusable_Components/SignUI.jsx';
import '../Styles/SignUI.css';

const SignPdf = () => {
  const navigate = useNavigate();

  const [pdfFile, setPdfFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [mode, setMode] = useState('text');
  const [signatureBlob, setSignatureBlob] = useState(null);
  const [coords, setCoords] = useState([0.1, 0.8, 0.18, 0]);
  const previewRef = useRef(null);

  const [marker, setMarker] = useState({ x: 0, y: 0, visible: false });

  const [placementEnabled, setPlacementEnabled] = useState(false);

  const waitForFont = (font, size = 72, timeout = 1500) => {

    if (!document.fonts || !font) return Promise.resolve();
    return Promise.race([
      document.fonts.load(`${size}px "${font}"`),
      new Promise(resolve => setTimeout(resolve, timeout))
    ]);
  };

  const textToBlob = (text, font = 'Pacifico', color = '#000') => {
    return new Promise(async (resolve) => {
      const canvas = document.createElement('canvas');
      canvas.width = 900;
      canvas.height = 240;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'rgba(0,0,0,0)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const fontSize = 72;
      await waitForFont(font, fontSize);
      ctx.font = `${fontSize}px "${font}", sans-serif`;
      ctx.fillStyle = color;
      const textToDraw = (text || '').slice(0, 60);
      ctx.fillText(textToDraw, 10, Math.round(fontSize * 0.9));
      canvas.toBlob(blob => resolve(blob), 'image/png');
    });
  };

  const handleApply = async (payload) => {
    if (!payload) return;
    if (payload.type === 'text') {
      const blob = await textToBlob(payload.text || '', payload.font || 'Pacifico', payload.color || '#000');
      setSignatureBlob(blob);
    } else if (payload.type === 'image' && payload.dataUrl) {
      const res = await fetch(payload.dataUrl);
      const blob = await res.blob();
      setSignatureBlob(blob);
    } else if (payload.type === 'image' && payload.file) {
      setSignatureBlob(payload.file);
    }
  };

  const handleOverlayClick = (e) => {
    if (!placementEnabled) return;
    if (!previewRef.current) return;
    const rect = previewRef.current.getBoundingClientRect();

    const clampedX = Math.max(rect.left, Math.min(e.clientX, rect.right));
    const clampedY = Math.max(rect.top, Math.min(e.clientY, rect.bottom));

    const xPct = (clampedX - rect.left) / rect.width;
    const yPct = (clampedY - rect.top) / rect.height;
    const wPct = 0.18;
    const hPct = 0;

    setCoords([xPct, yPct, wPct, hPct]);
    setMarker({ x: Math.round(xPct * rect.width), y: Math.round(yPct * rect.height), visible: true });

    setPlacementEnabled(false);
  };

  const handleSubmit = async () => {
    if (!pdfFile) return alert('Please upload a PDF.');
    if (!signatureBlob) return alert('Please create or upload a signature and press Apply.');

    try {
      const fd = new FormData();
      fd.append('file', pdfFile);
      fd.append('sealImage', signatureBlob, 'signature.png');
      fd.append('coords', coords.join(','));
      fd.append('pageNumber', '1');

      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/sealPdf`, { method: 'POST', body: fd });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || 'Server returned error');
      }
      const result = await res.json();
      if (result.success) {
        navigate(`/download?token=${encodeURIComponent(result.token)}&outputFormat=pdf`);
      } else {
        alert('Pdf Sign failed: ' + (result.error || 'unknown'));
      }
    } catch (err) {
      console.error(err);
      alert('Error in Signing Pdf: ' + (err.message || err));
    }
  };

  const handleSetFile = (f) => {
    setPdfFile(f);
    setPreviewUrl(URL.createObjectURL(f));
    setMarker(m => ({ ...m, visible: false }));
  };

  useEffect(() => {
    return () => { if (previewUrl) URL.revokeObjectURL(previewUrl); };
  }, [previewUrl]);

  return (
    <div className="sign-pdf container mt-5">
      <h2 className="text-center mb-4">Upload PDF to Sign</h2>
      <div className="card shadow mx-auto" style={{ maxWidth: previewUrl ? '1200px' : '500px', width: '100%' }}>
      <div className="card-body">
      {!previewUrl ? (
        <div className="upload-wrapper text-center mt-5">
          <h2></h2>
          <DragDropFile
            setFile={handleSetFile}
            setErrorMessage={() => {}}
            allowedMimeTypes={['application/pdf']}
            allowedExtensions={['.pdf']}
            sanitizeFilename={(fn) => fn}
            maxFileSize={20 * 1024 * 1024}
            description="PDF"
          />
          <div className="mt-3"><small className="text-white-custom">After upload you can preview and click where to place your signature.</small></div>
        </div>
      ) : (
        <div className="preview-and-sign" style={{ display: 'flex', gap: 12, height: '100vh' }}>
          <div style={{ position: 'relative', flex: 1, padding: 16, overflow: 'auto', borderRight: '1px solid #eee' }}>
            <div ref={previewRef}>
              <DocPreview previewUrl={previewUrl} fileName={pdfFile?.name} />
            </div>

            <div
              onClick={handleOverlayClick}
              style={{
                position: 'absolute',left: 16,top: 16,right: 16,bottom: 16,cursor: placementEnabled ? 'crosshair' : 'default',pointerEvents: placementEnabled ? 'auto' : 'none',
              }}
            />

            {marker.visible && (
              <div style={{
                position: 'absolute',left: 16 + marker.x - 8,top: 16 + marker.y - 8,width: 16,height: 16,borderRadius: 8,background: 'rgba(220,53,69,0.95)',border: '2px solid white',pointerEvents: 'none',boxShadow: '0 0 6px rgba(0,0,0,0.25)'
              }} />
            )}

            <div style={{ marginTop: 8 }}>
              <small className="text-muted">Click "Place" to enable placement, then click on the document to set the signature position.</small>
            </div>
          </div>

          <div className="sign-ui-container" style={{ width: 360, padding: 16 }}>
            <div className="d-flex gap-2 mb-3">
              <button className={`btn ${mode === 'text' ? 'btn-primary' : 'btn-outline-secondary'}`} onClick={() => setMode('text')}>Text</button>
              <button className={`btn ${mode === 'canvas' ? 'btn-primary' : 'btn-outline-secondary'}`} onClick={() => setMode('canvas')}>Draw</button>
              <button className={`btn ${mode === 'image' ? 'btn-primary' : 'btn-outline-secondary'}`} onClick={() => setMode('image')}>Upload</button>
            </div>

            <SignUI mode={mode} onApply={handleApply} />

            <div style={{ marginTop: 16 }}>
              <div style={{ marginBottom: 8 }}>
                <strong>Placement coords:</strong>
                <div style={{ fontSize: 13, color: '#555' }}>
                  x: {coords[0].toFixed(3)}, y: {coords[1].toFixed(3)}, w: {coords[2].toFixed(3)}
                </div>
              </div>

              <div className="mb-2 d-flex gap-2">
                <button className="btn btn-outline-primary" onClick={() => setPlacementEnabled(true)}>Place</button>
                <button className="btn btn-outline-secondary" onClick={() => { setPlacementEnabled(false); setMarker(m => ({ ...m, visible: false })); }}>Cancel</button>
              </div>

              <button className="btn btn-success w-100" disabled={!signatureBlob || !pdfFile} onClick={handleSubmit}>
                Seal PDF (download)
              </button>

              {!signatureBlob && <div className="mt-2 text-warning"><small>Apply a signature above to enable sealing.</small></div>}
            </div>
          </div>
        </div>
      )}
    </div>
    </div>
    </div>
  );
};

export default SignPdf;
