import { useState, useCallback } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useDropzone } from 'react-dropzone'
import { protectPDF, downloadFile, formatFileSize } from '../utils/pdfUtils'
import ProgressBar from '../components/ProgressBar'
import ResultPanel from '../components/ResultPanel'
import PDFPreview from '../components/PDFPreview'

export default function ProtectPDF() {
  const [file, setFile] = useState(null)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
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

  const handleProtect = async () => {
    if (!file) { setError('Please select a PDF file'); return }
    if (!password) { setError('Please enter a password'); return }
    if (password !== confirmPassword) { setError('Passwords do not match'); return }
    if (password.length < 4) { setError('Password must be at least 4 characters'); return }
    setProcessing(true)
    setProgress(20)
    setError(null)
    try {
      const buf = await file.arrayBuffer()
      setProgress(50)
      const protected_ = await protectPDF(buf, password)
      setProgress(100)
      setResult({
        message: `PDF protected (Note: browser-based PDF encryption has limitations. For full AES encryption, use a desktop PDF tool.)`,
        single: { data: protected_, name: file.name.replace('.pdf', '_protected.pdf'), mime: 'application/pdf' },
      })
    } catch (e) {
      setError(e.message)
    } finally {
      setProcessing(false)
    }
  }

  const handleReset = () => { setFile(null); setPassword(''); setConfirmPassword(''); setResult(null); setError(null); setProgress(0) }

  const strength = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : 3
  const strengthLabel = ['', 'Weak', 'Good', 'Strong']
  const strengthColor = ['', 'var(--error)', 'var(--warning)', 'var(--success)']

  if (result) return (
    <div className="page-content"><div className="container" style={{ maxWidth: '700px' }}>
      <ResultPanel result={result} currentPath={location.pathname} onReset={handleReset} />
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
              border: `2px dashed ${isDragActive ? 'var(--accent)' : 'var(--glass-border)'}`,
              background: isDragActive ? 'rgba(102,126,234,0.08)' : 'var(--glass-bg)',
              textAlign: 'center', cursor: 'pointer', transition: 'all 0.25s ease', backdropFilter: 'blur(20px)',
              boxShadow: isDragActive ? '0 0 0 4px var(--accent-glow)' : 'none',
            }}>
              <input {...getInputProps()} />
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>🔒</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '8px' }}>
                {isDragActive ? 'Drop your PDF!' : 'Drop a PDF to protect'}
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
            <h3>Set Password</h3>

            <div className="form-group">
              <label>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter a strong password"
                  style={{ paddingRight: '48px' }}
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px',
                    color: 'var(--text-muted)',
                  }}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
              {password && (
                <div style={{ marginTop: '8px' }}>
                  <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
                    {[1, 2, 3].map((l) => (
                      <div key={l} style={{
                        flex: 1, height: '4px', borderRadius: '2px',
                        background: l <= strength ? strengthColor[strength] : 'var(--glass-border)',
                        transition: 'background 0.3s ease',
                      }} />
                    ))}
                  </div>
                  <span style={{ fontSize: '12px', color: strengthColor[strength], fontWeight: 600 }}>
                    {strengthLabel[strength]} password
                  </span>
                </div>
              )}
            </div>

            <div className="form-group">
              <label>Confirm Password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your password"
              />
              {confirmPassword && (
                <p style={{ fontSize: '12px', marginTop: '6px', color: confirmPassword === password ? 'var(--success)' : 'var(--error)' }}>
                  {confirmPassword === password ? '✓ Passwords match' : '✕ Passwords do not match'}
                </p>
              )}
            </div>

            <div style={{
              padding: '14px', borderRadius: '10px', background: 'rgba(251,191,36,0.05)',
              border: '1px solid rgba(251,191,36,0.2)', fontSize: '13px', color: 'var(--text-secondary)',
            }}>
              ⚠️ <strong>Note:</strong> Browser-based PDF encryption has limitations. For full AES-256 encryption, consider using Adobe Acrobat or a desktop tool. This tool provides basic access restriction.
            </div>
          </div>

          {processing && <ProgressBar progress={progress} label="Protecting PDF..." />}
          {error && <div style={{ padding: '14px', borderRadius: '10px', background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', color: 'var(--error)', fontSize: '14px' }}>⚠️ {error}</div>}

          <div className="action-bar">
            <button
              className="btn-primary"
              onClick={handleProtect}
              disabled={!file || processing || !password || password !== confirmPassword}
              style={{ fontSize: '1rem', padding: '14px 36px' }}
            >
              {processing ? '⏳ Protecting...' : '🔒 Protect PDF'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
