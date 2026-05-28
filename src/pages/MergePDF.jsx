import { useState, useCallback } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useDropzone } from 'react-dropzone'
import { mergePDFs, downloadFile, formatFileSize } from '../utils/pdfUtils'
import ProgressBar from '../components/ProgressBar'
import ResultPanel from '../components/ResultPanel'

function FileList({ files, onRemove, onMove }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {files.map((f, i) => (
        <div key={i} style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '14px 16px',
          background: 'var(--glass-bg)',
          border: '1px solid var(--glass-border)',
          borderRadius: '12px',
          animation: 'slideUp 0.3s ease',
        }}>
          <span style={{ fontSize: '24px' }}>📄</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 500, fontSize: '14px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{formatFileSize(f.size)}</div>
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button className="btn-ghost" onClick={() => onMove(i, -1)} disabled={i === 0} style={{ padding: '4px 8px', fontSize: '16px' }}>↑</button>
            <button className="btn-ghost" onClick={() => onMove(i, 1)} disabled={i === files.length - 1} style={{ padding: '4px 8px', fontSize: '16px' }}>↓</button>
            <button className="btn-ghost" onClick={() => onRemove(i)} style={{ padding: '4px 8px', fontSize: '16px', color: 'var(--error)' }}>✕</button>
          </div>
        </div>
      ))}
    </div>
  )
}

export default function MergePDF() {
  const [files, setFiles] = useState([])
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
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    multiple: true,
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

  const handleMerge = async () => {
    if (files.length < 2) { setError('Please add at least 2 PDF files'); return }
    setProcessing(true)
    setProgress(0)
    setError(null)
    try {
      setProgress(30)
      const buffers = await Promise.all(files.map((f) => f.arrayBuffer()))
      setProgress(60)
      const merged = await mergePDFs(buffers)
      setProgress(100)
      setResult({ single: { data: merged, name: 'merged.pdf', mime: 'application/pdf' }, message: `Merged ${files.length} PDFs successfully` })
    } catch (e) {
      setError(e.message)
    } finally {
      setProcessing(false)
    }
  }

  if (result) return (
    <div className="page-content">
      <div className="container" style={{ maxWidth: '700px' }}>
        <ResultPanel result={result} currentPath={location.pathname} onReset={() => { setResult(null); setFiles([]) }} />
      </div>
    </div>
  )

  return (
    <div className="page-content">
      <div className="container" style={{ maxWidth: '700px' }}>
        <div className="breadcrumb"><Link to="/">Home</Link><span>/</span><span>Merge PDF</span></div>
        <div className="page-header">
          <span className="page-icon">🔗</span>
          <h1><span className="gradient-text">Merge</span> PDF</h1>
          <p>Combine multiple PDF files into a single document. Drag to reorder pages.</p>
        </div>

        <div className="tool-area">
          {/* Dropzone */}
          <div {...getRootProps()} style={{
            padding: '40px 24px',
            borderRadius: '20px',
            border: `2px dashed ${isDragActive ? 'var(--accent)' : 'var(--glass-border)'}`,
            background: isDragActive ? 'rgba(102,126,234,0.08)' : 'var(--glass-bg)',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.25s ease',
            backdropFilter: 'blur(20px)',
            boxShadow: isDragActive ? '0 0 0 4px var(--accent-glow)' : 'none',
          }}>
            <input {...getInputProps()} />
            <div style={{ fontSize: '48px', marginBottom: '12px', animation: isDragActive ? 'float 1s ease-in-out infinite' : 'none' }}>📄</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '8px' }}>
              {isDragActive ? 'Drop PDFs here!' : 'Drop PDF files here'}
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>or click to browse — multiple files supported</div>
          </div>

          {files.length > 0 && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{files.length} file{files.length !== 1 ? 's' : ''} selected</span>
                <button className="btn-ghost" onClick={() => setFiles([])} style={{ color: 'var(--error)', fontSize: '13px' }}>Clear all</button>
              </div>
              <FileList files={files} onRemove={removeFile} onMove={moveFile} />
            </div>
          )}

          {processing && <ProgressBar progress={progress} label="Merging PDFs..." />}
          {error && <div style={{ padding: '14px', borderRadius: '10px', background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', color: 'var(--error)', fontSize: '14px' }}>⚠️ {error}</div>}

          <div className="action-bar">
            <button className="btn-primary" onClick={handleMerge} disabled={processing || files.length < 2} style={{ fontSize: '1rem', padding: '14px 36px' }}>
              {processing ? '⏳ Merging...' : '🔗 Merge PDFs'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
