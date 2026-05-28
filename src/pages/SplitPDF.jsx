import { useState, useCallback } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useDropzone } from 'react-dropzone'
import JSZip from 'jszip'
import { splitPDF, downloadFile, formatFileSize } from '../utils/pdfUtils'
import { renderPDFPreview } from '../utils/imageUtils'
import ProgressBar from '../components/ProgressBar'
import ResultPanel from '../components/ResultPanel'
import PDFPreview from '../components/PDFPreview'

export default function SplitPDF() {
  const [file, setFile] = useState(null)
  const [numPages, setNumPages] = useState(null)
  const [splitMode, setSplitMode] = useState('all') // 'all' | 'range'
  const [rangeInput, setRangeInput] = useState('')
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
      const buf = await f.arrayBuffer()
      const { numPages: n } = await renderPDFPreview(buf, 1, 0.5)
      setNumPages(n)
    } catch (e) {
      setError('Could not read PDF: ' + e.message)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    multiple: false,
  })

  const parseRanges = (input, total) => {
    const ranges = []
    const parts = input.split(',').map((s) => s.trim()).filter(Boolean)
    for (const part of parts) {
      if (part.includes('-')) {
        const [a, b] = part.split('-').map(Number)
        if (!isNaN(a) && !isNaN(b) && a >= 1 && b <= total && a <= b) {
          const range = []
          for (let i = a; i <= b; i++) range.push(i)
          ranges.push(range)
        }
      } else {
        const n = Number(part)
        if (!isNaN(n) && n >= 1 && n <= total) ranges.push([n])
      }
    }
    return ranges
  }

  const handleSplit = async () => {
    if (!file) { setError('Please select a PDF file'); return }
    setProcessing(true)
    setProgress(10)
    setError(null)
    try {
      const buf = await file.arrayBuffer()
      setProgress(30)
      let pageRanges
      if (splitMode === 'all') {
        pageRanges = Array.from({ length: numPages }, (_, i) => [i + 1])
      } else {
        pageRanges = parseRanges(rangeInput, numPages)
        if (pageRanges.length === 0) { setError('Invalid page ranges. Example: 1-3, 5, 7-9'); setProcessing(false); return }
      }
      const pdfs = await splitPDF(buf, pageRanges)
      setProgress(80)

      if (pdfs.length === 1) {
        setResult({
          message: 'Split complete!',
          single: { data: pdfs[0], name: 'split_page.pdf', mime: 'application/pdf' },
        })
      } else {
        const zip = new JSZip()
        pdfs.forEach((pdf, i) => {
          const label = splitMode === 'all' ? `page_${i + 1}` : `part_${i + 1}`
          zip.file(`${label}.pdf`, pdf)
        })
        const zipBlob = await zip.generateAsync({ type: 'blob' })
        setProgress(100)
        setResult({
          message: `Split into ${pdfs.length} ${splitMode === 'all' ? 'pages' : 'parts'}`,
          single: { data: zipBlob, name: 'split_pages.zip', mime: 'application/zip' },
        })
      }
    } catch (e) {
      setError(e.message)
    } finally {
      setProcessing(false)
    }
  }

  const handleReset = () => { setFile(null); setNumPages(null); setResult(null); setError(null); setProgress(0) }

  if (result) return (
    <div className="page-content"><div className="container" style={{ maxWidth: '700px' }}>
      <ResultPanel result={result} currentPath={location.pathname} onReset={handleReset} />
    </div></div>
  )

  return (
    <div className="page-content">
      <div className="container" style={{ maxWidth: '700px' }}>
        <div className="breadcrumb"><Link to="/">Home</Link><span>/</span><span>Split PDF</span></div>
        <div className="page-header">
          <span className="page-icon">✂️</span>
          <h1><span className="gradient-text">Split</span> PDF</h1>
          <p>Extract individual pages or custom page ranges from your PDF.</p>
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
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>✂️</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '8px' }}>
                {isDragActive ? 'Drop your PDF!' : 'Drop a PDF to split'}
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>or click to browse — single PDF file</div>
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
              <h3>Split Options</h3>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
                {['all', 'range'].map((mode) => (
                  <button key={mode} onClick={() => setSplitMode(mode)} style={{
                    padding: '10px 20px', borderRadius: '10px', border: '1px solid',
                    borderColor: splitMode === mode ? 'var(--accent)' : 'var(--glass-border)',
                    background: splitMode === mode ? 'rgba(102,126,234,0.15)' : 'var(--glass-bg)',
                    color: splitMode === mode ? 'var(--accent)' : 'var(--text-secondary)',
                    cursor: 'pointer', fontWeight: 600, fontSize: '14px', fontFamily: 'inherit',
                    transition: 'all 0.2s ease',
                  }}>
                    {mode === 'all' ? '📑 Split All Pages' : '🔢 Custom Range'}
                  </button>
                ))}
              </div>

              {splitMode === 'range' && (
                <div className="form-group">
                  <label>Page ranges (e.g. 1-3, 5, 7-9)</label>
                  <input
                    type="text"
                    value={rangeInput}
                    onChange={(e) => setRangeInput(e.target.value)}
                    placeholder="1-3, 5, 7-9"
                  />
                  {numPages && <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px' }}>PDF has {numPages} pages</p>}
                </div>
              )}

              {splitMode === 'all' && numPages && (
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                  Will create <strong>{numPages} separate PDF files</strong> (one per page), packaged as a ZIP.
                </p>
              )}
            </div>
          )}

          {processing && <ProgressBar progress={progress} label="Splitting PDF..." />}
          {error && <div style={{ padding: '14px', borderRadius: '10px', background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', color: 'var(--error)', fontSize: '14px' }}>⚠️ {error}</div>}

          <div className="action-bar">
            <button className="btn-primary" onClick={handleSplit} disabled={!file || processing} style={{ fontSize: '1rem', padding: '14px 36px' }}>
              {processing ? '⏳ Splitting...' : '✂️ Split PDF'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
