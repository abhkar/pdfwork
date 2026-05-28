import { useState, useCallback } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useDropzone } from 'react-dropzone'
import { imagesToPDF, } from '../utils/imageUtils'
import { downloadFile, formatFileSize } from '../utils/pdfUtils'
import ProgressBar from '../components/ProgressBar'
import ResultPanel from '../components/ResultPanel'

const ACCEPT = { 'image/jpeg': ['.jpg', '.jpeg'], 'image/png': ['.png'], 'image/webp': ['.webp'] }

export default function ImageToPDF() {
  const [files, setFiles] = useState([])
  const [pageSize, setPageSize] = useState('A4')
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const location = useLocation()

  const onDrop = useCallback((accepted) => {
    setFiles((prev) => [...prev, ...accepted])
    setResult(null)
    setError(null)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: ACCEPT, multiple: true,
  })

  const removeFile = (i) => setFiles((prev) => prev.filter((_, idx) => idx !== i))
  const moveFile = (i, dir) => {
    setFiles((prev) => {
      const arr = [...prev]
      const j = i + dir
      if (j < 0 || j >= arr.length) return arr
      ;[arr[i], arr[j]] = [arr[j], arr[i]]
      return arr
    })
  }

  const handleConvert = async () => {
    if (files.length === 0) { setError('Please add at least one image'); return }
    setProcessing(true)
    setProgress(20)
    setError(null)
    try {
      const pdf = await imagesToPDF(files, pageSize)
      setProgress(100)
      setResult({
        message: `Converted ${files.length} image${files.length !== 1 ? 's' : ''} to PDF`,
        single: { data: pdf, name: 'images.pdf', mime: 'application/pdf' },
      })
    } catch (e) {
      setError(e.message)
    } finally {
      setProcessing(false)
    }
  }

  const handleReset = () => { setFiles([]); setResult(null); setError(null); setProgress(0) }

  if (result) return (
    <div className="page-content"><div className="container" style={{ maxWidth: '700px' }}>
      <ResultPanel result={result} currentPath={location.pathname} onReset={handleReset} />
    </div></div>
  )

  return (
    <div className="page-content">
      <div className="container" style={{ maxWidth: '700px' }}>
        <div className="breadcrumb"><Link to="/">Home</Link><span>/</span><span>Image to PDF</span></div>
        <div className="page-header">
          <span className="page-icon">📸</span>
          <h1><span className="gradient-text">Image to PDF</span></h1>
          <p>Convert JPG, PNG, or WebP images into a single PDF document.</p>
        </div>

        <div className="tool-area">
          <div {...getRootProps()} style={{
            padding: '40px 24px', borderRadius: '20px',
            border: `2px dashed ${isDragActive ? 'var(--accent)' : 'var(--glass-border)'}`,
            background: isDragActive ? 'rgba(102,126,234,0.08)' : 'var(--glass-bg)',
            textAlign: 'center', cursor: 'pointer', transition: 'all 0.25s ease', backdropFilter: 'blur(20px)',
            boxShadow: isDragActive ? '0 0 0 4px var(--accent-glow)' : 'none',
          }}>
            <input {...getInputProps()} />
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>🖼️</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '8px' }}>
              {isDragActive ? 'Drop your images!' : 'Drop images here'}
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>JPG, PNG, WebP — multiple files supported</div>
          </div>

          {files.length > 0 && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{files.length} image{files.length !== 1 ? 's' : ''}</span>
                <button className="btn-ghost" onClick={() => setFiles([])} style={{ color: 'var(--error)', fontSize: '13px' }}>Clear all</button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {files.map((f, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px',
                    background: 'var(--glass-bg)', border: '1px solid var(--glass-border)',
                    borderRadius: '12px', animation: 'slideUp 0.2s ease',
                  }}>
                    <img
                      src={URL.createObjectURL(f)}
                      alt={f.name}
                      style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '6px', flexShrink: 0 }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 500, fontSize: '14px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{formatFileSize(f.size)}</div>
                    </div>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button className="btn-ghost" onClick={() => moveFile(i, -1)} disabled={i === 0} style={{ padding: '4px 8px' }}>↑</button>
                      <button className="btn-ghost" onClick={() => moveFile(i, 1)} disabled={i === files.length - 1} style={{ padding: '4px 8px' }}>↓</button>
                      <button className="btn-ghost" onClick={() => removeFile(i)} style={{ padding: '4px 8px', color: 'var(--error)' }}>✕</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="options-panel">
            <h3>Page Size</h3>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {['A4', 'Letter', 'fit'].map((size) => (
                <button key={size} onClick={() => setPageSize(size)} style={{
                  padding: '10px 20px', borderRadius: '10px', border: '1px solid',
                  borderColor: pageSize === size ? 'var(--accent)' : 'var(--glass-border)',
                  background: pageSize === size ? 'rgba(102,126,234,0.15)' : 'var(--glass-bg)',
                  color: pageSize === size ? 'var(--accent)' : 'var(--text-secondary)',
                  cursor: 'pointer', fontWeight: 600, fontSize: '14px', fontFamily: 'inherit',
                  transition: 'all 0.2s ease',
                }}>
                  {size === 'fit' ? '📐 Fit Image' : size}
                </button>
              ))}
            </div>
          </div>

          {processing && <ProgressBar progress={progress} label="Creating PDF..." />}
          {error && <div style={{ padding: '14px', borderRadius: '10px', background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', color: 'var(--error)', fontSize: '14px' }}>⚠️ {error}</div>}

          <div className="action-bar">
            <button className="btn-primary" onClick={handleConvert} disabled={files.length === 0 || processing} style={{ fontSize: '1rem', padding: '14px 36px' }}>
              {processing ? '⏳ Creating...' : '📄 Create PDF'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
