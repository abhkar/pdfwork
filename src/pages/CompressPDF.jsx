import { useState, useCallback } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useDropzone } from 'react-dropzone'
import { compressPDF, downloadFile, formatFileSize } from '../utils/pdfUtils'
import ProgressBar from '../components/ProgressBar'
import ResultPanel from '../components/ResultPanel'
import PDFPreview from '../components/PDFPreview'

export default function CompressPDF() {
  const [file, setFile] = useState(null)
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
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    multiple: false,
  })

  const handleCompress = async () => {
    if (!file) { setError('Please select a PDF file'); return }
    setProcessing(true)
    setProgress(20)
    setError(null)
    try {
      const buf = await file.arrayBuffer()
      setProgress(50)
      const compressed = await compressPDF(buf)
      setProgress(100)
      const origSize = file.size
      const newSize = compressed.byteLength
      const saving = ((origSize - newSize) / origSize * 100).toFixed(1)
      setResult({
        message: `Compressed from ${formatFileSize(origSize)} to ${formatFileSize(newSize)} (${saving}% saved)`,
        single: { data: compressed, name: file.name.replace('.pdf', '_compressed.pdf'), mime: 'application/pdf' },
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
        <div className="breadcrumb"><Link to="/">Home</Link><span>/</span><span>Compress PDF</span></div>
        <div className="page-header">
          <span className="page-icon">🗜️</span>
          <h1><span className="gradient-text">Compress</span> PDF</h1>
          <p>Reduce your PDF file size by stripping metadata and optimizing structure.</p>
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
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>🗜️</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '8px' }}>
                {isDragActive ? 'Drop your PDF!' : 'Drop a PDF to compress'}
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
                <p style={{ fontWeight: 600, marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</p>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px' }}>{formatFileSize(file.size)}</p>
                <button className="btn-ghost" onClick={handleReset} style={{ color: 'var(--error)', fontSize: '13px', padding: '4px 0' }}>✕ Remove file</button>
              </div>
            </div>
          )}

          {file && (
            <div className="options-panel">
              <h3>Compression Info</h3>
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                {[
                  { label: 'Strips metadata', desc: 'Removes author, title, producer info' },
                  { label: 'Object streams', desc: 'Optimizes internal PDF structure' },
                  { label: 'Preserves content', desc: 'Text & images remain unchanged' },
                ].map((item) => (
                  <div key={item.label} style={{
                    flex: '1 1 160px', padding: '14px', borderRadius: '10px',
                    background: 'rgba(74,222,128,0.05)', border: '1px solid rgba(74,222,128,0.2)',
                  }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--success)', marginBottom: '4px' }}>✓ {item.label}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{item.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {processing && <ProgressBar progress={progress} label="Compressing PDF..." />}
          {error && <div style={{ padding: '14px', borderRadius: '10px', background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', color: 'var(--error)', fontSize: '14px' }}>⚠️ {error}</div>}

          <div className="action-bar">
            <button className="btn-primary" onClick={handleCompress} disabled={!file || processing} style={{ fontSize: '1rem', padding: '14px 36px' }}>
              {processing ? '⏳ Compressing...' : '🗜️ Compress PDF'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
