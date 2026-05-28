import { useState, useCallback } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useDropzone } from 'react-dropzone'
import { rotatePDF, downloadFile, formatFileSize } from '../utils/pdfUtils'
import ProgressBar from '../components/ProgressBar'
import ResultPanel from '../components/ResultPanel'
import PDFPreview from '../components/PDFPreview'

const ANGLES = [
  { deg: 90, label: '90° Right', icon: '↻' },
  { deg: 180, label: '180°', icon: '↕' },
  { deg: 270, label: '90° Left', icon: '↺' },
]

export default function RotatePDF() {
  const [file, setFile] = useState(null)
  const [angle, setAngle] = useState(90)
  const [scope, setScope] = useState('all') // 'all' | 'specific'
  const [pageInput, setPageInput] = useState('')
  const [numPages, setNumPages] = useState(null)
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const location = useLocation()

  const onDrop = useCallback(async (accepted) => {
    const f = accepted[0]
    if (!f) return
    setFile(f)
    setResult(null)
    setError(null)
    try {
      const { renderPDFPreview } = await import('../utils/imageUtils')
      const buf = await f.arrayBuffer()
      const { numPages: n } = await renderPDFPreview(buf, 1, 0.3)
      setNumPages(n)
    } catch {}
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'application/pdf': ['.pdf'] }, multiple: false,
  })

  const parsePages = (input, total) => {
    const pages = new Set()
    input.split(',').map((s) => s.trim()).forEach((part) => {
      if (part.includes('-')) {
        const [a, b] = part.split('-').map(Number)
        for (let i = a; i <= b; i++) if (i >= 1 && i <= total) pages.add(i - 1)
      } else {
        const n = Number(part)
        if (!isNaN(n) && n >= 1 && n <= total) pages.add(n - 1)
      }
    })
    return [...pages]
  }

  const handleRotate = async () => {
    if (!file) { setError('Please select a PDF file'); return }
    setProcessing(true)
    setProgress(20)
    setError(null)
    try {
      const buf = await file.arrayBuffer()
      let pageIndices = 'all'
      if (scope === 'specific' && numPages) {
        pageIndices = parsePages(pageInput, numPages)
        if (pageIndices.length === 0) { setError('No valid pages specified'); setProcessing(false); return }
      }
      setProgress(50)
      const rotated = await rotatePDF(buf, angle, pageIndices)
      setProgress(100)
      setResult({
        message: `Rotated ${scope === 'all' ? 'all pages' : pageIndices.length + ' pages'} by ${angle}°`,
        single: { data: rotated, name: file.name.replace('.pdf', '_rotated.pdf'), mime: 'application/pdf' },
      })
    } catch (e) {
      setError(e.message)
    } finally {
      setProcessing(false)
    }
  }

  const handleReset = () => { setFile(null); setResult(null); setError(null); setProgress(0); setNumPages(null) }

  if (result) return (
    <div className="page-content"><div className="container" style={{ maxWidth: '700px' }}>
      <ResultPanel result={result} currentPath={location.pathname} onReset={handleReset} />
    </div></div>
  )

  return (
    <div className="page-content">
      <div className="container" style={{ maxWidth: '700px' }}>
        <div className="breadcrumb"><Link to="/">Home</Link><span>/</span><span>Rotate PDF</span></div>
        <div className="page-header">
          <span className="page-icon">🔄</span>
          <h1><span className="gradient-text">Rotate</span> PDF</h1>
          <p>Rotate pages 90°, 180°, or 270° — apply to all or specific pages.</p>
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
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>🔄</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '8px' }}>
                {isDragActive ? 'Drop your PDF!' : 'Drop a PDF to rotate'}
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
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px' }}>{formatFileSize(file.size)}{numPages ? ` · ${numPages} pages` : ''}</p>
                <button className="btn-ghost" onClick={handleReset} style={{ color: 'var(--error)', fontSize: '13px', padding: '4px 0' }}>✕ Remove</button>
              </div>
            </div>
          )}

          <div className="options-panel">
            <h3>Rotation</h3>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
              {ANGLES.map(({ deg, label, icon }) => (
                <button key={deg} onClick={() => setAngle(deg)} style={{
                  flex: '1 1 100px', padding: '16px 12px', borderRadius: '12px', border: '1px solid',
                  borderColor: angle === deg ? 'var(--accent)' : 'var(--glass-border)',
                  background: angle === deg ? 'rgba(102,126,234,0.15)' : 'var(--glass-bg)',
                  color: angle === deg ? 'var(--accent)' : 'var(--text-secondary)',
                  cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s ease',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
                }}>
                  <span style={{ fontSize: '24px', fontWeight: 700 }}>{icon}</span>
                  <span style={{ fontSize: '13px', fontWeight: 600 }}>{label}</span>
                </button>
              ))}
            </div>

            <h3>Apply to</h3>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
              {['all', 'specific'].map((s) => (
                <button key={s} onClick={() => setScope(s)} style={{
                  padding: '10px 20px', borderRadius: '10px', border: '1px solid',
                  borderColor: scope === s ? 'var(--accent)' : 'var(--glass-border)',
                  background: scope === s ? 'rgba(102,126,234,0.15)' : 'var(--glass-bg)',
                  color: scope === s ? 'var(--accent)' : 'var(--text-secondary)',
                  cursor: 'pointer', fontWeight: 600, fontSize: '14px', fontFamily: 'inherit',
                  transition: 'all 0.2s ease',
                }}>
                  {s === 'all' ? 'All Pages' : 'Specific Pages'}
                </button>
              ))}
            </div>

            {scope === 'specific' && (
              <div className="form-group">
                <label>Page numbers (e.g. 1, 3, 5-8)</label>
                <input type="text" value={pageInput} onChange={(e) => setPageInput(e.target.value)} placeholder="1, 3, 5-8" />
              </div>
            )}
          </div>

          {processing && <ProgressBar progress={progress} label="Rotating PDF..." />}
          {error && <div style={{ padding: '14px', borderRadius: '10px', background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', color: 'var(--error)', fontSize: '14px' }}>⚠️ {error}</div>}

          <div className="action-bar">
            <button className="btn-primary" onClick={handleRotate} disabled={!file || processing} style={{ fontSize: '1rem', padding: '14px 36px' }}>
              {processing ? '⏳ Rotating...' : '🔄 Rotate PDF'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
