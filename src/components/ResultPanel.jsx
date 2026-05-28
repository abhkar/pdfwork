import { Link } from 'react-router-dom'
import { downloadFile } from '../utils/pdfUtils'

const SUGGESTIONS = {
  '/merge': [{ path: '/compress', label: '🗜️ Compress PDF', desc: 'Reduce the merged file size' }, { path: '/protect', label: '🔒 Protect PDF', desc: 'Add password protection' }],
  '/split': [{ path: '/compress', label: '🗜️ Compress PDF', desc: 'Compress each split file' }, { path: '/merge', label: '🔗 Merge PDF', desc: 'Merge them back' }],
  '/compress': [{ path: '/protect', label: '🔒 Protect PDF', desc: 'Protect the compressed file' }, { path: '/watermark', label: '💧 Add Watermark', desc: 'Brand your document' }],
  '/pdf-to-image': [{ path: '/image-to-pdf', label: '🖼️ Image to PDF', desc: 'Convert images back to PDF' }],
  '/image-to-pdf': [{ path: '/compress', label: '🗜️ Compress PDF', desc: 'Reduce PDF size' }, { path: '/protect', label: '🔒 Protect PDF', desc: 'Secure with password' }],
  '/rotate': [{ path: '/compress', label: '🗜️ Compress PDF', desc: 'Compress after rotating' }, { path: '/merge', label: '🔗 Merge PDF', desc: 'Combine with other PDFs' }],
  '/watermark': [{ path: '/protect', label: '🔒 Protect PDF', desc: 'Lock down your watermarked file' }, { path: '/compress', label: '🗜️ Compress PDF', desc: 'Reduce file size' }],
  '/protect': [{ path: '/watermark', label: '💧 Add Watermark', desc: 'Add branding before protecting' }],
}

export default function ResultPanel({ result, currentPath, onReset }) {
  const suggestions = SUGGESTIONS[currentPath] || []

  return (
    <div style={{
      background: 'var(--glass-bg)',
      border: '1px solid var(--glass-border)',
      borderRadius: '20px',
      padding: '32px',
      textAlign: 'center',
      backdropFilter: 'blur(20px)',
      animation: 'scaleIn 0.4s cubic-bezier(0.34,1.56,0.64,1)',
    }}>
      {/* Success icon */}
      <div style={{
        width: '72px',
        height: '72px',
        background: 'linear-gradient(135deg, #4ade80, #22c55e)',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 20px',
        fontSize: '32px',
        boxShadow: '0 8px 30px rgba(74,222,128,0.4)',
        animation: 'glow 2s ease-in-out infinite',
      }}>✓</div>

      <h3 style={{ fontSize: '1.4rem', marginBottom: '8px' }}>Done! Your file is ready</h3>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '28px', fontSize: '0.95rem' }}>
        {result.message || 'Processing complete'}
      </p>

      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '32px' }}>
        {result.files && result.files.map((f, i) => (
          <button key={i} className="btn-primary" onClick={() => downloadFile(f.data, f.name, f.mime)}>
            ⬇️ {f.name}
          </button>
        ))}
        {result.single && (
          <button className="btn-primary" onClick={() => downloadFile(result.single.data, result.single.name, result.single.mime)}>
            ⬇️ Download {result.single.name}
          </button>
        )}
        <button className="btn-secondary" onClick={onReset}>↩ Process Another</button>
      </div>

      {suggestions.length > 0 && (
        <div>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            What's next?
          </p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {suggestions.map((s) => (
              <Link key={s.path} to={s.path} style={{
                padding: '10px 18px',
                borderRadius: '10px',
                border: '1px solid var(--glass-border)',
                background: 'var(--glass-bg)',
                color: 'var(--text-primary)',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: 500,
                transition: 'all 0.2s ease',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '2px',
              }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--glass-border)'; e.currentTarget.style.transform = 'none' }}
              >
                <span>{s.label}</span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 400 }}>{s.desc}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
