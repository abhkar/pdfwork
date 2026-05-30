import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer style={{
      background: 'var(--glass-bg)',
      backdropFilter: 'blur(20px)',
      borderTop: '1px solid var(--glass-border)',
      padding: '40px 0 24px',
      marginTop: 'auto',
    }}>
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '32px',
          marginBottom: '32px',
        }}>
          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
              }}>
                🐝
              </div>
              <span style={{
                fontSize: '18px',
                fontWeight: 800,
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                PDFBee
              </span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.6 }}>
              Free, client-side PDF tools. Your files never leave your device.
            </p>
          </div>

          {/* Tools */}
          <div>
            <h4 style={{ color: 'var(--text-secondary)', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px', fontWeight: 600 }}>
              Tools
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { to: '/merge', label: 'Merge PDF' },
                { to: '/split', label: 'Split PDF' },
                { to: '/compress', label: 'Compress PDF' },
                { to: '/pdf-to-image', label: 'PDF to Image' },
              ].map(link => (
                <Link key={link.to} to={link.to} style={{ color: 'var(--text-muted)', fontSize: '14px', textDecoration: 'none', transition: 'color 0.2s' }}
                  onMouseEnter={e => e.target.style.color = 'var(--accent)'}
                  onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4 style={{ color: 'var(--text-secondary)', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px', fontWeight: 600 }}>
              More Tools
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { to: '/image-to-pdf', label: 'Image to PDF' },
                { to: '/rotate', label: 'Rotate PDF' },
                { to: '/watermark', label: 'Watermark PDF' },
                { to: '/protect', label: 'Protect PDF' },
              ].map(link => (
                <Link key={link.to} to={link.to} style={{ color: 'var(--text-muted)', fontSize: '14px', textDecoration: 'none', transition: 'color 0.2s' }}
                  onMouseEnter={e => e.target.style.color = 'var(--accent)'}
                  onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Privacy */}
          <div>
            <h4 style={{ color: 'var(--text-secondary)', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px', fontWeight: 600 }}>
              Privacy
            </h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.6 }}>
              🔒 All processing happens in your browser. We never see your files.
            </p>
          </div>
        </div>

        <div style={{
          borderTop: '1px solid var(--glass-border)',
          paddingTop: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
            © {new Date().getFullYear()} PDFBee. Free forever. No account required.
          </p>
          <div style={{ display: 'flex', gap: '16px' }}>
            {['🔒 Secure', '⚡ Fast', '🆓 Free'].map(tag => (
              <span key={tag} style={{
                fontSize: '12px',
                color: 'var(--text-muted)',
                padding: '4px 10px',
                background: 'var(--glass-bg)',
                border: '1px solid var(--glass-border)',
                borderRadius: '20px',
              }}>
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
