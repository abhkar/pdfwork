import { Link } from 'react-router-dom'
import { useState } from 'react'

export default function ToolCard({ icon, title, description, to, gradient, delay = 0 }) {
  const [hovered, setHovered] = useState(false)

  return (
    <Link
      to={to}
      style={{
        display: 'block',
        textDecoration: 'none',
        animation: `slideUp 0.5s ease both`,
        animationDelay: `${delay}s`,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{
        background: hovered ? 'var(--glass-bg-hover)' : 'var(--glass-bg)',
        backdropFilter: 'blur(20px)',
        border: `1px solid ${hovered ? 'transparent' : 'var(--glass-border)'}`,
        backgroundImage: hovered
          ? `${gradient ? `linear-gradient(${gradient})` : 'none'}`
          : 'none',
        borderRadius: '20px',
        padding: '28px 24px',
        transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
        transform: hovered ? 'translateY(-6px)' : 'translateY(0)',
        boxShadow: hovered
          ? `0 20px 40px rgba(0,0,0,0.3), 0 0 30px ${getGlowColor(gradient)}`
          : '0 4px 20px rgba(0,0,0,0.1)',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Gradient border on hover */}
        {hovered && (
          <div style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '20px',
            padding: '1px',
            background: gradient || 'linear-gradient(135deg, #667eea, #764ba2)',
            WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            WebkitMaskComposite: 'xor',
            maskComposite: 'exclude',
          }} />
        )}

        {/* Icon container */}
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '14px',
          background: gradient || 'linear-gradient(135deg, #667eea, #764ba2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '26px',
          marginBottom: '16px',
          boxShadow: hovered ? `0 8px 20px ${getGlowColor(gradient)}` : 'none',
          transition: 'box-shadow 0.3s ease',
          animation: hovered ? 'float 2s ease-in-out infinite' : 'none',
        }}>
          {icon}
        </div>

        <h3 style={{
          fontSize: '17px',
          fontWeight: 700,
          color: hovered ? 'white' : 'var(--text-primary)',
          marginBottom: '8px',
          transition: 'color 0.3s ease',
        }}>
          {title}
        </h3>
        <p style={{
          fontSize: '14px',
          color: hovered ? 'rgba(255,255,255,0.8)' : 'var(--text-secondary)',
          lineHeight: 1.5,
          transition: 'color 0.3s ease',
        }}>
          {description}
        </p>

        {/* Arrow */}
        <div style={{
          marginTop: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          fontSize: '13px',
          fontWeight: 600,
          color: hovered ? 'rgba(255,255,255,0.9)' : 'var(--accent)',
          transition: 'all 0.3s ease',
          transform: hovered ? 'translateX(4px)' : 'translateX(0)',
        }}>
          Get started →
        </div>
      </div>
    </Link>
  )
}

function getGlowColor(gradient) {
  if (!gradient) return 'rgba(102,126,234,0.3)'
  if (gradient.includes('f093fb')) return 'rgba(240,147,251,0.3)'
  if (gradient.includes('4facfe')) return 'rgba(79,172,254,0.3)'
  if (gradient.includes('43e97b')) return 'rgba(67,233,123,0.3)'
  if (gradient.includes('fa709a')) return 'rgba(250,112,154,0.3)'
  if (gradient.includes('a18cd1')) return 'rgba(161,140,209,0.3)'
  if (gradient.includes('fccb90')) return 'rgba(252,203,144,0.3)'
  return 'rgba(102,126,234,0.3)'
}
