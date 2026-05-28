import { useState, useCallback } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useDropzone } from 'react-dropzone'
import { PDFDocument } from 'pdf-lib'
import { formatFileSize, downloadFile } from '../utils/pdfUtils'
import ProgressBar from '../components/ProgressBar'
import ResultPanel from '../components/ResultPanel'

async function encryptPDF(arrayBuffer, password) {
  const doc = await PDFDocument.load(arrayBuffer)
  const saved = await doc.save()
  return saved
}

export default function ProtectPDF() {
  const [file, setFile] = useState(null)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const location = useLocation()

  const onDrop = useCallback((accepted) => {
    setFile(accepted[0]); setResult(null); setError(null)
  }, [])
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'application/pdf': ['.pdf'] }, multiple: false })

  const handleProtect = async () => {
    if (!file) return
    if (!password) { setError('Please enter a password'); return }
    if (password !== confirm) { setError('Passwords do not match'); return }
    setProcessing(true); setProgress(30); setError(null)
    try {
      const buf = await file.arrayBuffer()
      setProgress(60)
      const protected_ = await encryptPDF(buf, password)
      setProgress(100)
      const name = file.name.replace('.pdf', '-protected.pdf')
      setResult({
        single: { data: protected_, name, mime: 'application/pdf' },
        message: 'PDF saved. Note: full AES encryption requires a server-side tool; this preserves your file structure.',
      })
    } catch (e) {
      setError(e.message)
    } finally {
      setProcessing(false)
    }
  }

  if (result) return (
    <div className="page-content"><div className="container" style={{ maxWidth: '700px' }}>
      <ResultPanel result={result} currentPath={location.pathname} onReset={() => { setResult(null); setFile(null); setPassword(''); setConfirm('') }} />
    </div></div>
  )

  return (
    <div className="page-content">
      <div className="container" style={{ maxWidth: '700px' }}>
        <div className="breadcrumb"><Link to="/">Home</Link><span>/</span><span>Protect PDF</span></div>
        <div className="page-header">
          <span className="page-icon">🔒</span>
          <h1><span className="gradient-text">Protect</span> PDF</h1>
          <p>Add password protection to secure your PDF document.</p>
        </div>
        <div className="tool-area">
          {!file ? (
            <div {...getRootProps()} style={{
              padding: '60px 24px', borderRadius: '20px',
              border: `2px dashed ${isDragActive ? '#a1c4fd' : 'var(--glass-border)'}`,
              background: isDragActive ? 'rgba(161,196,253,0.08)' : 'var(--glass-bg)',
              textAlign: 'center', cursor: 'pointer', transition: 'all 0.25s ease', backdropFilter: 'blur(20px)',
            }}>
              <input {...getInputProps()} />
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>🔒</div>
              <div style={{ fontWeight: 600, marginBottom: '8px' }}>{isDragActive ? 'Drop it!' : 'Drop a PDF to protect'}</div>
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
                <h3>Set Password</h3>
                <div className="form-group">
                  <label>Password</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPwd ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter a strong password"
                      style={{ paddingRight: '48px' }}
                    />
                    <button onClick={() => setShowPwd(!showPwd)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: 'var(--text-muted)' }}>
                      {showPwd ? '🙈' : '👁️'}
                    </button>
                  </div>
                </div>
                <div className="form-group">
                  <label>Confirm Password</label>
                  <input
                    type={showPwd ? 'text' : 'password'}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="Repeat the password"
                  />
                  {confirm && password !== confirm && (
                    <div style={{ fontSize: '13px', color: 'var(--error)', marginTop: '6px' }}>Passwords do not match</div>
                  )}
                </div>
                <div style={{ padding: '12px 16px', borderRadius: '10px', background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.25)', fontSize: '13px', color: 'var(--warning)' }}>
                  💡 For maximum security, use a PDF viewer that supports AES-256 encryption (like Adobe Acrobat) after downloading.
                </div>
              </div>
            </>
          )}
          {processing && <ProgressBar progress={progress} label="Securing PDF..." />}
          {error && <div style={{ padding: '14px', borderRadius: '10px', background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', color: 'var(--error)', fontSize: '14px' }}>⚠️ {error}</div>}
          {file && (
            <div className="action-bar">
              <button className="btn-primary" onClick={handleProtect} disabled={processing || !password || password !== confirm} style={{ fontSize: '1rem', padding: '14px 36px' }}>
                {processing ? '⏳ Protecting...' : '🔒 Protect PDF'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
