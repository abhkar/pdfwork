import { useState, useCallback } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useDropzone } from 'react-dropzone'
import { addWatermark, formatFileSize } from '../utils/pdfUtils'
import ProgressBar from '../components/ProgressBar'
import ResultPanel from '../components/ResultPanel'

export default function Watermark() {
  const [file, setFile] = useState(null)
  const [text, setText] = useState('CONFIDENTIAL')
  const [fontSize, setFontSize] = useState(48)
  const [opacity, setOpacity] = useState(15)
  const [position, setPosition] = useState('diagonal')
  const [color, setColor] = useState('#888888')
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const location = useLocation()

  const onDrop = useCallback((accepted) => {
    setFile(accepted[0]); setResult(null); setError(null)
  }, [])
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'application/pdf': ['.pdf'] }, multiple: false })

  const hexToRgb = (hex) => {
    const r = parseInt(hex.slice(1, 3), 16) / 255
    const g = parseInt(hex.slice(3, 5), 16) / 255
    const b = parseInt(hex.slice(5, 7), 16) / 255
    return { r, g, b }
  }

  const handleWatermark = async () => {
    if (!file || !text.trim()) return
    setProcessing(true); setProgress(20); setError(null)
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
      const name = file.name.replace('.pdf', '-watermarked.pdf')
      setResult({ single: { data: watermarked, name, mime: 'application/pdf' }, message: `Watermark "${text}" added to all pages` })
    } catch (e) {
      setError(e.message)
    } finally {
      setProcessing(false)
    }
  }

  if (result) return (
    <div className="page-content"><div className="container" style={{ maxWidth: '700px' }}>
      <ResultPanel result={result} currentPath={location.pathname} onReset={() => { setResult(null); setFile(null) }} />
    </div></div>
  )

  return (
    <div className="page-content">
      <div className="container" style={{ maxWidth: '700px' }}>
        <div className="breadcrumb"><Link to="/">Home</Link><span>/</span><span>Watermark</span></div>
        <div className="page-header">
          <span className="page-icon">💧</span>
          <h1>Add <span className="gradient-text">Watermark</span></h1>
          <p>Stamp a custom text watermark across all pages of your PDF.</p>
        </div>
        <div className="tool-area">
          {!file ? (
            <div {...getRootProps()} style={{
              padding: '60px 24px', borderRadius: '20px',
              border: `2px dashed ${isDragActive ? '#fcb69f' : 'var(--glass-border)'}`,
              background: isDragActive ? 'rgba(252,182,159,0.08)' : 'var(--glass-bg)',
              textAlign: 'center', cursor: 'pointer', transition: 'all 0.25s ease', backdropFilter: 'blur(20px)',
            }}>
              <input {...getInputProps()} />
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>💧</div>
              <div style={{ fontWeight: 600, marginBottom: '8px' }}>{isDragActive ? 'Drop it!' : 'Drop a PDF to watermark'}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>or click to browse</div>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '16px 20px', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: '14px' }}>
                <span style={{ fontSize: '32px' }}>📄</span>
                <div style={{ flex: 1 }}><div style={{ fontWeight: 600 }}>{file.name}</div><div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{formatFileSize(file.size)}</div></div>
                <button className="btn-ghost" onClick={() => setFile(null)} style={{ color: 'var(--error)' }}>✕</button>
              </div>
              <div className="options-panel">
                <h3>Watermark Settings</h3>
                <div className="form-group">
                  <label>Watermark Text</label>
                  <input type="text" value={text} onChange={(e) => setText(e.target.value)} placeholder="e.g. CONFIDENTIAL, DRAFT" />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label>Font Size: {fontSize}pt</label>
                    <input type="range" min={20} max={100} value={fontSize} onChange={(e) => setFontSize(+e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>Opacity: {opacity}%</label>
                    <input type="range" min={5} max={60} value={opacity} onChange={(e) => setOpacity(+e.target.value)} />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label>Color</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <input type="color" value={color} onChange={(e) => setColor(e.target.value)} style={{ width: '48px', height: '40px', borderRadius: '8px', border: '1px solid var(--glass-border)', cursor: 'pointer', background: 'none', padding: '2px' }} />
                      <input type="text" value={color} onChange={(e) => setColor(e.target.value)} style={{ flex: 1 }} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Position</label>
                    <select value={position} onChange={(e) => setPosition(e.target.value)}>
                      <option value="diagonal">Diagonal (center)</option>
                      <option value="center">Center</option>
                      <option value="corner">Bottom-left corner</option>
                    </select>
                  </div>
                </div>
              </div>
            </>
          )}
          {processing && <ProgressBar progress={progress} label="Adding watermark..." />}
          {error && <div style={{ padding: '14px', borderRadius: '10px', background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', color: 'var(--error)', fontSize: '14px' }}>⚠️ {error}</div>}
          {file && (
            <div className="action-bar">
              <button className="btn-primary" onClick={handleWatermark} disabled={processing || !text.trim()} style={{ fontSize: '1rem', padding: '14px 36px' }}>
                {processing ? '⏳ Adding Watermark...' : '💧 Add Watermark'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
