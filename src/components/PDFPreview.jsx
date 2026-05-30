import { useEffect, useRef, useState } from 'react'
import { renderPDFPreview } from '../utils/imageUtils'

export default function PDFPreview({ file, scale = 0.3 }) {
  const containerRef = useRef(null)
  const [numPages, setNumPages] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!file) return
    let cancelled = false
    setLoading(true)
    setNumPages(null)

    const run = async () => {
      try {
        const buf = await file.arrayBuffer()
        const { canvas, numPages } = await renderPDFPreview(buf, 1, scale)
        if (cancelled) return
        setNumPages(numPages)
        setLoading(false)
        const container = containerRef.current
        if (container) {
          container.innerHTML = ''
          canvas.style.borderRadius = '8px'
          canvas.style.boxShadow = 'var(--shadow)'
          canvas.style.maxWidth = '100%'
          container.appendChild(canvas)
        }
      } catch {
        // Preview failed silently — fallback to PDF icon below
        if (!cancelled) setLoading(false)
      }
    }
    run()
    return () => { cancelled = true }
  }, [file, scale])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
      {/* Fallback icon shown until canvas is injected or if rendering fails */}
      <div ref={containerRef} style={{ minHeight: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {loading && (
          <div style={{
            width: '60px', height: '80px',
            background: 'var(--glass-bg)',
            border: '1px solid var(--glass-border)',
            borderRadius: '8px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '28px',
            animation: 'pulse 1.5s ease-in-out infinite',
          }}>
            📄
          </div>
        )}
        {!loading && !numPages && (
          <div style={{
            width: '60px', height: '80px',
            background: 'var(--glass-bg)',
            border: '1px solid var(--glass-border)',
            borderRadius: '8px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '28px',
          }}>
            📄
          </div>
        )}
      </div>
      {numPages && (
        <span style={{
          fontSize: '12px', padding: '4px 10px', borderRadius: '20px',
          background: 'var(--accent)', color: 'white', fontWeight: 600,
        }}>
          {numPages} page{numPages !== 1 ? 's' : ''}
        </span>
      )}
    </div>
  )
}
