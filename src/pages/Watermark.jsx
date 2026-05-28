import { useState, useCallback } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useDropzone } from 'react-dropzone'
import { addWatermark, downloadFile, formatFileSize } from '../utils/pdfUtils'
import ProgressBar from '../components/ProgressBar'
import ResultPanel from '../components/ResultPanel'
import PDFPreview from '../components/PDFPreview'

export default function Watermark() {
  const [file, setFile] = useState(null)
  const [text, setText] = useState('CONFIDENTIAL')
  const [fontSize, setFontSize] = useState(48)
  const [opacity, setOpacity] = useState(15)
  const [color, setColor] = useState('#667eea')
  const [position, setPosition] = useState('diagonal')
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const location = useLocation()

  const onDrop = useCallback((accepted) => {
    setFile(accepted[0] || null)
    setResult(null)
    setError(null)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'application/pdf': ['.pdf'] }, multiple: false,
  })

  const hexToRgb = (hex) => {
    const r = parseInt(hex.slice(1, 3), 16) / 255
    const g = parseInt(hex.slice(3, 5), 16) / 255
    const b = parseInt(hex.slice(5, 7), 16) / 255
    return { r, g, b }
  }

  const handleWatermark = async () => {
    if (!file) { setError('Please select a PDF file'); return }
    if (!text.trim()) { setError('Please enter watermark text'); return }
    setProcessing(true)
    setProgress(20)
    setError(null)
    try {
      const buf = await file.arrayBuffer()
      setProgress(50)
      const watermarked = await addWatermark(buf, text, {
        fontSize,
        opacity: opacity / 100,
        color: hexToRgb(color),
        position,
      })
      setProgress(100)
      setResult({
        message: `Watermark "${text}" added to all pages`,
        single: { data: watermarked, name: file.name.replace('.pdf', '_watermarked.pdf'), mime: 'application/pdf' },
      })
    } catch (e) {
      setError(e.message)
    } finally {
      setProcessing(false)
    }
  }

  const handleReset = () => { setFile(null); setResult(null); setError(null); setProgress(0) }

  if (result) return (
    <div className="page-content"><div className="container" style={{ maxWidth: '700px' }}>
      <ResultPanel result={result} currentPath={location.pathname} onReset={handleReset} />
    </div></div>
  )

  return (
    <div className="page-content">
      <div className="container" style={{ maxWidth: '700px' }}>
        <div className="breadcrumb"><Link to="/">Home</Link><span>/</span><span>Watermark PDF</span></div>
        <div className="page-header">
          <span className="page-icon">💧</span>
          <h1><span className="gradient-text">Watermark</span> PDF</h1>
          <p>Add a custom text watermark to protect and brand your PDF documents.</p>
        </div>

        <div className="tool-area">
          {!file ? (
            <div {...getRootProps()} style={{
              padding: '60px 24px', borderRadius: '20px',
              border: `2px dashed ${isDragActive ? 'var(--accent)' : 'var(--glass-border)'}`,
              background: isDragActive ? 'rgba(102,126,234,0.08)' : 'var(--glass-bg)',
              textAlign: 'center', cursor: 'pointer', transition: 'all 0.25s ease', backdropFilter: 'blur(20px)',
              boxShadow: isDragActive ? '0 0 0 4px var(--accent-glow)' : 'none',
            }}>
              <input {...getInputProps()} />
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>💧</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '8px' }}>
                {isDragActive ? 'Drop your PDF!' : 'Drop a PDF to watermark'}
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>or click to browse</div>
            </div>
          ) : (
            <div style={{
              display: 'flex', gap: '20px', alignItems: 'flex-start', flexWrap: 'wrap',
              padding: '20px', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)',
              borderRadius: '16px', backdropFilter: 'blur(20px)',
            }}>
              <PDFPreview file={file} scale={0.3} />
              <div style={{ flex: 1, minWidth: '200px' }}>
                <p style={{ fontWeight: 600, marginBottom: '4px' }}>{file.name}</p>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px' }}>{formatFileSize(file.size)}</p>
                <button className="btn-ghost" onClick={handleReset} style={{ color: 'var(--error)', fontSize: '13px', padding: '4px 0' }}>✕ Remove</button>
              </div>
            </div>
          )}

          <div className="options-panel">
            <h3>Watermark Settings</h3>

            <div className="form-group">
              <label>Watermark Text</label>
              <input type="text" value={text} onChange={(e) => setText(e.target.value)} placeholder="e.g. CONFIDENTIAL, DRAFT" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label>Font Size: {fontSize}px</label>
                <input type="range" min="20" max="120" value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))} />
              </div>
              <div className="form-group">
                <label>Opacity: {opacity}%</label>
                <input type="range" min="5" max="80" value={opacity} onChange={(e) => setOpacity(Number(e.target.value))} />
              </div>
            </div>

            <div className="form-group">
              <label>Color</label>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <input type="color" value={color} onChange={(e) => setColor(e.target.value)}
                  style={{ width: '48px', height: '40px', padding: '2px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--input-bg)', cursor: 'pointer' }} />
                {['#667eea', '#f5576c', '#43e97b', '#fccb90', '#4facfe', '#000000'].map((c) => (
                  <button key={c} onClick={() => setColor(c)} style={{
                    width: '32px', height: '32px', borderRadius: '50%', background: c,
                    border: color === c ? '3px solid white' : '2px solid transparent',
                    cursor: 'pointer', outline: color === c ? '2px solid var(--accent)' : 'none',
                    transition: 'all 0.2s ease', boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                  }} />
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Position</label>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {[
                  { id: 'diagonal', label: '↗ Diagonal' },
                  { id: 'center', label: '⊙ Center' },
                  { id: 'corner', label: '↙ Corner' },
                ].map((pos) => (
                  <button key={pos.id} onClick={() => setPosition(pos.id)} style={{
                    padding: '10px 16px', borderRadius: '10px', border: '1px solid',
                    borderColor: position === pos.id ? 'var(--accent)' : 'var(--glass-border)',
                    background: position === pos.id ? 'rgba(102,126,234,0.15)' : 'var(--glass-bg)',
                    color: position === pos.id ? 'var(--accent)' : 'var(--text-secondary)',
                    cursor: 'pointer', fontWeight: 600, fontSize: '13px', fontFamily: 'inherit',
                    transition: 'all 0.2s ease',
                  }}>
                    {pos.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Preview indicator */}
            <div style={{
              padding: '20px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px',
              border: '1px dashed var(--glass-border)', textAlign: 'center', position: 'relative', overflow: 'hidden',
            }}>
              <span style={{
                position: 'absolute',
                top: position === 'diagonal' ? '50%' : position === 'center' ? '50%' : '80%',
                left: position === 'corner' ? '20%' : '50%',
                transform: `translate(-50%, -50%) rotate(${position === 'diagonal' ? '45deg' : '0deg'})`,
                fontSize: `${Math.max(14, fontSize / 4)}px`,
                fontWeight: 700,
                color,
                opacity: opacity / 100,
                whiteSpace: 'nowrap',
                fontFamily: 'Helvetica, sans-serif',
              }}>
                {text || 'WATERMARK'}
              </span>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', position: 'relative' }}>Live Preview</span>
            </div>
          </div>

          {processing && <ProgressBar progress={progress} label="Adding watermark..." />}
          {error && <div style={{ padding: '14px', borderRadius: '10px', background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', color: 'var(--error)', fontSize: '14px' }}>⚠️ {error}</div>}

          <div className="action-bar">
            <button className="btn-primary" onClick={handleWatermark} disabled={!file || processing} style={{ fontSize: '1rem', padding: '14px 36px' }}>
              {processing ? '⏳ Adding watermark...' : '💧 Add Watermark'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
