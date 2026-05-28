import { useState, useCallback } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useDropzone } from 'react-dropzone'
import JSZip from 'jszip'
import { pdfToImages } from '../utils/imageUtils'
import { downloadFile, formatFileSize } from '../utils/pdfUtils'
import ProgressBar from '../components/ProgressBar'
import ResultPanel from '../components/ResultPanel'
import PDFPreview from '../components/PDFPreview'

export default function PDFToImage() {
  const [file, setFile] = useState(null)
  const [format, setFormat] = useState('png')
  const [quality, setQuality] = useState(92)
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

  const handleConvert = async () => {
    if (!file) { setError('Please select a PDF file'); return }
    setProcessing(true)
    setProgress(5)
    setError(null)
    try {
      const buf = await file.arrayBuffer()
      const images = await pdfToImages(buf, format, quality / 100, (p) => setProgress(p))
      
      if (images.length === 1) {
        const ext = format === 'jpeg' ? 'jpg' : 'png'
        setResult({
          message: 'Converted 1 page to image',
          single: { data: images[0].blob, name: `page_1.${ext}`, mime: images[0].blob.type },
        })
      } else {
        const zip = new JSZip()
        const ext = format === 'jpeg' ? 'jpg' : 'png'
        images.forEach(({ blob, page }) => zip.file(`page_${page}.${ext}`, blob))
        const zipBlob = await zip.generateAsync({ type: 'blob' })
        setProgress(100)
        setResult({
          message: `Converted ${images.length} pages to ${format.toUpperCase()} images`,
          single: { data: zipBlob, name: 'pdf_images.zip', mime: 'application/zip' },
        })
      }
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
        <div className="breadcrumb"><Link to="/">Home</Link><span>/</span><span>PDF to Image</span></div>
        <div className="page-header">
          <span className="page-icon">🖼️</span>
          <h1><span className="gradient-text">PDF to Image</span></h1>
          <p>Convert each PDF page into a high-quality PNG or JPEG image.</p>
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
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>📄</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '8px' }}>
                {isDragActive ? 'Drop your PDF!' : 'Drop a PDF to convert'}
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
                <button className="btn-ghost" onClick={handleReset} style={{ color: 'var(--error)', fontSize: '13px', padding: '4px 0' }}>✕ Remove</button>
              </div>
            </div>
          )}

          {file && (
            <div className="options-panel">
              <h3>Image Options</h3>
              <div className="form-group">
                <label>Output Format</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {['png', 'jpeg'].map((f) => (
                    <button key={f} onClick={() => setFormat(f)} style={{
                      padding: '10px 24px', borderRadius: '10px', border: '1px solid',
                      borderColor: format === f ? 'var(--accent)' : 'var(--glass-border)',
                      background: format === f ? 'rgba(102,126,234,0.15)' : 'var(--glass-bg)',
                      color: format === f ? 'var(--accent)' : 'var(--text-secondary)',
                      cursor: 'pointer', fontWeight: 600, fontSize: '14px', fontFamily: 'inherit',
                      transition: 'all 0.2s ease', textTransform: 'uppercase',
                    }}>
                      {f}
                    </button>
                  ))}
                </div>
              </div>
              {format === 'jpeg' && (
                <div className="form-group">
                  <label>JPEG Quality: {quality}%</label>
                  <input type="range" min="50" max="100" value={quality} onChange={(e) => setQuality(Number(e.target.value))} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    <span>Smaller file</span><span>Best quality</span>
                  </div>
                </div>
              )}
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                Renders at 2x scale for crisp images. Multiple pages will be packaged as a ZIP.
              </p>
            </div>
          )}

          {processing && <ProgressBar progress={progress} label="Converting pages to images..." />}
          {error && <div style={{ padding: '14px', borderRadius: '10px', background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', color: 'var(--error)', fontSize: '14px' }}>⚠️ {error}</div>}

          <div className="action-bar">
            <button className="btn-primary" onClick={handleConvert} disabled={!file || processing} style={{ fontSize: '1rem', padding: '14px 36px' }}>
              {processing ? '⏳ Converting...' : '🖼️ Convert to Images'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
