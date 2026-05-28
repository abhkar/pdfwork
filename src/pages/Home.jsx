import { Link } from 'react-router-dom'

const tools = [
  { path: '/merge', icon: '🔗', label: 'Merge PDF', desc: 'Combine multiple PDFs into one document', gradient: 'linear-gradient(135deg,#667eea,#764ba2)', glow: 'rgba(102,126,234,0.3)' },
  { path: '/split', icon: '✂️', label: 'Split PDF', desc: 'Extract pages or split into separate files', gradient: 'linear-gradient(135deg,#f093fb,#f5576c)', glow: 'rgba(240,147,251,0.3)' },
  { path: '/compress', icon: '🗜️', label: 'Compress PDF', desc: 'Reduce file size without losing quality', gradient: 'linear-gradient(135deg,#4facfe,#00f2fe)', glow: 'rgba(79,172,254,0.3)' },
  { path: '/pdf-to-image', icon: '🖼️', label: 'PDF to Image', desc: 'Convert PDF pages to PNG or JPG images', gradient: 'linear-gradient(135deg,#43e97b,#38f9d7)', glow: 'rgba(67,233,123,0.3)' },
  { path: '/image-to-pdf', icon: '📸', label: 'Image to PDF', desc: 'Convert JPG, PNG, WebP to PDF', gradient: 'linear-gradient(135deg,#fa709a,#fee140)', glow: 'rgba(250,112,154,0.3)' },
  { path: '/rotate', icon: '🔄', label: 'Rotate PDF', desc: 'Rotate pages 90°, 180°, or 270°', gradient: 'linear-gradient(135deg,#a18cd1,#fbc2eb)', glow: 'rgba(161,140,209,0.3)' },
  { path: '/watermark', icon: '💧', label: 'Add Watermark', desc: 'Stamp text watermark on your PDF', gradient: 'linear-gradient(135deg,#ffecd2,#fcb69f)', glow: 'rgba(252,182,159,0.3)' },
  { path: '/protect', icon: '🔒', label: 'Protect PDF', desc: 'Add password encryption to your PDF', gradient: 'linear-gradient(135deg,#a1c4fd,#c2e9fb)', glow: 'rgba(161,196,253,0.3)' },
]

const features = [
  { icon: '🔒', title: '100% Private', desc: 'Files never leave your browser. All processing is done locally on your device.' },
  { icon: '⚡', title: 'Lightning Fast', desc: 'No uploads, no waiting. Process PDFs instantly right in your browser.' },
  { icon: '🆓', title: 'Always Free', desc: 'No subscriptions, no watermarks, no limits. PDFCraft is free forever.' },
]

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section style={{ padding: '80px 0 60px', position: 'relative', overflow: 'hidden' }}>
        {/* Gradient orbs */}
        <div style={{ position: 'absolute', top: '-100px', left: '-100px', width: '500px', height: '500px', background: 'radial-gradient(circle,rgba(102,126,234,0.15) 0%,transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '-50px', right: '-100px', width: '400px', height: '400px', background: 'radial-gradient(circle,rgba(118,75,162,0.12) 0%,transparent 70%)', pointerEvents: 'none' }} />

        <div className="container" style={{ textAlign: 'center', position: 'relative' }}>
          {/* Floating PDF icons */}
          <div style={{ position: 'relative', marginBottom: '32px', height: '80px' }}>
            {['📄','📋','📑','📃'].map((e, i) => (
              <span key={i} style={{
                position: 'absolute',
                fontSize: '32px',
                animation: `${i % 2 === 0 ? 'float' : 'floatAlt'} ${3 + i * 0.5}s ease-in-out infinite`,
                animationDelay: `${i * 0.4}s`,
                left: `${20 + i * 18}%`,
                top: '0',
                opacity: 0.7,
                filter: 'drop-shadow(0 4px 8px rgba(102,126,234,0.4))',
              }}>{e}</span>
            ))}
          </div>

          <h1 style={{ fontSize: 'clamp(2.2rem,5vw,3.8rem)', fontWeight: 900, lineHeight: 1.1, marginBottom: '20px' }}>
            Your PDF,{' '}
            <span className="gradient-text">Perfectly Crafted</span>
          </h1>
          <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', maxWidth: '520px', margin: '0 auto 36px', lineHeight: 1.7 }}>
            Powerful PDF tools that work entirely in your browser. No sign-up, no uploads, completely free.
          </p>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/merge" className="btn-primary" style={{ textDecoration: 'none', fontSize: '1rem', padding: '14px 32px' }}>
              🚀 Get Started Free
            </Link>
            <a href="#tools" className="btn-secondary" style={{ textDecoration: 'none', fontSize: '1rem', padding: '14px 32px' }}>
              View All Tools
            </a>
          </div>
        </div>
      </section>

      {/* Features bar */}
      <div style={{ background: 'var(--glass-bg)', borderTop: '1px solid var(--glass-border)', borderBottom: '1px solid var(--glass-border)' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '0', padding: '24px' }}>
          {features.map((f, i) => (
            <div key={i} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              padding: '12px 20px',
              borderRight: i < features.length - 1 ? '1px solid var(--glass-border)' : 'none',
            }}>
              <span style={{ fontSize: '28px' }}>{f.icon}</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{f.title}</div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{f.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tools Grid */}
      <section id="tools" style={{ padding: '80px 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 style={{ fontSize: '2rem', marginBottom: '12px' }}>All PDF Tools</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Everything you need to work with PDFs, all in one place</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: '20px' }}>
            {tools.map((tool, i) => (
              <Link key={tool.path} to={tool.path} style={{ textDecoration: 'none' }}>
                <div style={{
                  padding: '28px',
                  borderRadius: '20px',
                  border: '1px solid var(--glass-border)',
                  background: 'var(--glass-bg)',
                  backdropFilter: 'blur(20px)',
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
                  animation: `slideUp 0.5s ease both`,
                  animationDelay: `${i * 0.07}s`,
                  height: '100%',
                }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-6px)'
                    e.currentTarget.style.boxShadow = `0 20px 40px ${tool.glow}`
                    e.currentTarget.style.borderColor = 'transparent'
                    e.currentTarget.style.background = 'var(--glass-bg-hover)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = 'none'
                    e.currentTarget.style.borderColor = 'var(--glass-border)'
                    e.currentTarget.style.background = 'var(--glass-bg)'
                  }}
                >
                  <div style={{
                    width: '56px', height: '56px',
                    borderRadius: '16px',
                    background: tool.gradient,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '26px',
                    marginBottom: '16px',
                    boxShadow: `0 8px 20px ${tool.glow}`,
                  }}>{tool.icon}</div>
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '8px', color: 'var(--text-primary)' }}>{tool.label}</h3>
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{tool.desc}</p>
                  <div style={{ marginTop: '16px', fontSize: '13px', color: 'var(--accent)', fontWeight: 600 }}>
                    Use tool →
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section style={{ padding: '80px 0', background: 'var(--bg-secondary)' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <div style={{
            display: 'inline-block',
            padding: '48px 64px',
            borderRadius: '24px',
            background: 'linear-gradient(135deg,rgba(102,126,234,0.15),rgba(118,75,162,0.15))',
            border: '1px solid rgba(102,126,234,0.2)',
            backdropFilter: 'blur(20px)',
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🚀</div>
            <h2 style={{ fontSize: '1.8rem', marginBottom: '12px' }}>Ready to get started?</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
              Pick a tool above — no account required, 100% free.
            </p>
            <Link to="/merge" className="btn-primary" style={{ textDecoration: 'none', fontSize: '1rem' }}>
              Merge your first PDF →
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
