
import React, { useState, useRef, useEffect } from 'react';
import '../Styles/SignUI.css';

const FONT_OPTIONS = [
  'Pacifico', 'Dancing Script', 'Great Vibes',
  'Indie Flower', 'Satisfy', 'Kaushan Script'
];

const COLOR_OPTIONS = ['#000000', '#c0392b', '#27ae60', '#2980b9', '#8e44ad'];

const SignUI = ({ mode = 'text', onApply }) => {
  const [text, setText] = useState('');
  const [selectedFont, setSelectedFont] = useState(FONT_OPTIONS[0]);
  const [hoverFont, setHoverFont] = useState(null);
  const [color, setColor] = useState(COLOR_OPTIONS[0]);
  const [brushSize, setBrushSize] = useState(3);
  const canvasRef = useRef(null);
  const [imgFile, setImgFile] = useState(null);

  useEffect(() => {
    if (mode === 'canvas' && canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  }, [mode]);

  useEffect(() => {
    if (mode !== 'canvas') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = brushSize;
    ctx.strokeStyle = color;

    let drawing = false;
    const getPos = e => {
      const rect = canvas.getBoundingClientRect();
      const clientX = e.clientX ?? (e.touches && e.touches[0]?.clientX);
      const clientY = e.clientY ?? (e.touches && e.touches[0]?.clientY);
      return { x: clientX - rect.left, y: clientY - rect.top };
    };

    const pointerDown = e => { e.preventDefault(); drawing = true; const p = getPos(e); ctx.beginPath(); ctx.moveTo(p.x, p.y); };
    const pointerMove = e => { if (!drawing) return; const p = getPos(e); ctx.lineTo(p.x, p.y); ctx.stroke(); };
    const pointerUp = () => { drawing = false; };

    canvas.addEventListener('pointerdown', pointerDown);
    window.addEventListener('pointermove', pointerMove);
    window.addEventListener('pointerup', pointerUp);

    ctx.lineWidth = brushSize;
    ctx.strokeStyle = color;

    return () => {
      canvas.removeEventListener('pointerdown', pointerDown);
      window.removeEventListener('pointermove', pointerMove);
      window.removeEventListener('pointerup', pointerUp);
    };
  }, [mode, brushSize, color]);

  const handleApply = () => {
    if (mode === 'text') {
      onApply({ type: 'text', text, font: selectedFont, color });
    } else if (mode === 'canvas') {
      const dataUrl = canvasRef.current.toDataURL('image/png');
      onApply({ type: 'image', dataUrl });
    } else {
      if (!imgFile) { alert('Please choose an image to upload.'); return; }
      onApply({ type: 'image', file: imgFile, url: URL.createObjectURL(imgFile) });
    }
  };

  const handleClearCanvas = () => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    ctx.clearRect(0, 0, c.width, c.height);
  };

  const displayFont = hoverFont || selectedFont;

  return (
    <div className="sign-ui">
      {mode === 'text' && (
        <div className="sign-pane scrollable">
          <textarea
            className="sign-textarea"
            placeholder="Type your signature"
            value={text}
            onChange={e => setText(e.target.value)}
            rows={4}
            style={{ fontFamily: `"${displayFont}", sans-serif`, fontSize: 20 }}
          />
          <div className="font-options" role="list">
            {FONT_OPTIONS.map(f => (
              <div
                key={f}
                role="listitem"
                className={`font-sample${selectedFont === f ? ' selected' : ''}`}
                style={{ fontFamily: f, cursor: 'pointer' }}
                onMouseEnter={() => setHoverFont(f)}
                onMouseLeave={() => setHoverFont(null)}
                onClick={() => setSelectedFont(f)}
                title={`Use ${f}`}
              >
                Signature
              </div>
            ))}
          </div>

          <div className="color-options" style={{ marginTop: 8 }}>
            {COLOR_OPTIONS.map(c => (
              <button
                key={c}
                className={`color-dot${color === c ? ' active' : ''}`}
                style={{ backgroundColor: c }}
                onClick={() => setColor(c)}
                aria-label={`color ${c}`}
              />
            ))}
          </div>
        </div>
      )}

      {mode === 'canvas' && (
        <div className="sign-pane">
          <canvas ref={canvasRef} width={400} height={180} className="sign-canvas" style={{ border: '1px solid #ddd', borderRadius: 6 }} />
          <div style={{ display: 'flex', gap: 8, marginTop: 8, alignItems: 'center' }}>
            <div>
              <label style={{ marginRight: 6 }}>Brush</label>
              <input type="range" min="1" max="10" value={brushSize} onChange={e => setBrushSize(Number(e.target.value))} />
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {COLOR_OPTIONS.map(c => (
                <button key={c} className={`color-dot${color === c ? ' active' : ''}`} style={{ backgroundColor: c }} onClick={() => setColor(c)} />
              ))}
            </div>
            <button className="btn btn-sm btn-secondary" onClick={handleClearCanvas}>Clear</button>
          </div>
        </div>
      )}

      {mode === 'image' && (
        <div className="sign-pane scrollable">
          <input type="file" accept="image/*" onChange={e => setImgFile(e.target.files[0])} />
          {imgFile && <div style={{ marginTop: 10 }}><img src={URL.createObjectURL(imgFile)} alt="preview" style={{ maxWidth: '100%', maxHeight: 120 }} /></div>}
        </div>
      )}

      <div style={{ marginTop: 12 }}>
        <button className="btn btn-primary apply-btn" onClick={handleApply}>Apply</button>
      </div>
    </div>
  );
};

export default SignUI;
