import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import useAppStore from '../store/useAppStore'

const navLinks = [
  { to: '/merge', label: 'Merge' },
  { to: '/split', label: 'Split' },
  { to: '/compress', label: 'Compress' },
  { to: '/pdf-to-image', label: 'PDF→Image' },
  { to: '/image-to-pdf', label: 'Image→PDF' },
  { to: '/rotate', label: 'Rotate' },
  { to: '/watermark', label: 'Watermark' },
  { to: '/protect', label: 'Protect' },
]

function SunIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5"/>
      <line x1="12" y1="1" x2="12" y2="3"/>
      <line x1="12" y1="21" x2="12" y2="23"/>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
      <line x1="1" y1="12" x2="3" y2="12"/>
      <line x1="21" y1="12" x2="23" y2="12"/>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  )
}

export default function Header() {
  const { theme, toggleTheme } = useAppStore()
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      background: 'var(--glass-bg)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--glass-border)',
      transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '64px',
      }}>
        {/* Logo */}
        <Link to="/" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          textDecoration: 'none',
          flexShrink: 0,
        }}>
          <div style={{
            width: '36px',
            height: '36px',
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px',
            boxShadow: '0 4px 15px rgba(102,126,234,0.4)',
          }}>
            📄
          </div>
          <span style={{
            fontSize: '20px',
            fontWeight: 800,
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            letterSpacing: '-0.5px',
          }}>
            PDFCraft
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
        }} className="desktop-nav">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 500,
                color: location.pathname === link.to ? 'var(--accent)' : 'var(--text-secondary)',
                background: location.pathname === link.to ? 'var(--glass-bg)' : 'transparent',
                transition: 'all 0.2s ease',
                textDecoration: 'none',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={(e) => {
                if (location.pathname !== link.to) {
                  e.target.style.color = 'var(--text-primary)'
                  e.target.style.background = 'var(--glass-bg)'
                }
              }}
              onMouseLeave={(e) => {
                if (location.pathname !== link.to) {
                  e.target.style.color = 'var(--text-secondary)'
                  e.target.style.background = 'transparent'
                }
              }}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              border: '1px solid var(--glass-border)',
              background: 'var(--glass-bg)',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
              backdropFilter: 'blur(10px)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--accent)'
              e.currentTarget.style.borderColor = 'var(--accent)'
              e.currentTarget.style.boxShadow = '0 0 15px var(--accent-glow)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--text-secondary)'
              e.currentTarget.style.borderColor = 'var(--glass-border)'
              e.currentTarget.style.boxShadow = 'none'
            }}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            <span style={{
              animation: 'scaleIn 0.2s ease',
              display: 'flex',
            }}>
              {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
            </span>
          </button>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="hamburger-btn"
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              border: '1px solid var(--glass-border)',
              background: 'var(--glass-bg)',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'none',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '5px',
              padding: '8px',
            }}
          >
            <span style={{ width: '18px', height: '2px', background: 'currentColor', borderRadius: '2px', transition: 'all 0.3s', transform: menuOpen ? 'rotate(45deg) translateY(7px)' : 'none' }} />
            <span style={{ width: '18px', height: '2px', background: 'currentColor', borderRadius: '2px', opacity: menuOpen ? 0 : 1, transition: 'all 0.3s' }} />
            <span style={{ width: '18px', height: '2px', background: 'currentColor', borderRadius: '2px', transition: 'all 0.3s', transform: menuOpen ? 'rotate(-45deg) translateY(-7px)' : 'none' }} />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div style={{
          borderTop: '1px solid var(--glass-border)',
          padding: '16px',
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '8px',
          animation: 'slideDown 0.2s ease',
        }} className="mobile-menu">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMenuOpen(false)}
              style={{
                padding: '10px 14px',
                borderRadius: '10px',
                fontSize: '14px',
                fontWeight: 500,
                color: location.pathname === link.to ? 'var(--accent)' : 'var(--text-secondary)',
                background: location.pathname === link.to ? 'rgba(102,126,234,0.1)' : 'var(--glass-bg)',
                border: '1px solid var(--glass-border)',
                textDecoration: 'none',
                textAlign: 'center',
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}

      <style>{`
        @media (max-width: 900px) {
          .desktop-nav { display: none !important; }
          .hamburger-btn { display: flex !important; }
        }
        @media (min-width: 901px) {
          .mobile-menu { display: none !important; }
        }
      `}</style>
    </header>
  )
}
