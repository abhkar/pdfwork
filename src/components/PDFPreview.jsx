import { useEffect, useRef, useState } from 'react'
import { renderPDFPreview } from '../utils/imageUtils'

export default function PDFPreview({ file, scale = 0.3 }) {
  const containerRef = useRef(null)
  const [numPages, setNumPages] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!file) return
    let cancelled = false
    const run = async () => {
      try {
        const buf = await file.arrayBuffer()
        const { canvas, numPages } = await renderPDFPreview(buf, 1, scale)
        if (cancelled) return
        setNumPages(numPages)
        const container = containerRef.current
        if (container) {
          container.innerHTML = ''
          canvas.style.borderRadius = '8px'
          canvas.style.boxShadow = 'var(--shadow)'
          canvas.style.maxWidth = '100%'
          container.appendChild(canvas)
        }
      } catch (e) {
        if (!cancelled) setError(e.message)
      }
    }
    run()
    return () => { cancelled = true }
  }, [file, scale])

  if (error) return null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
      <div ref={containerRef} style={{ minHeight: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {!numPages && (
          <div style={{
            width: '80px', height: '100px',
            background: 'var(--glass-bg)',
            borderRadius: '8px',
            animation: 'pulse 1.5s ease-in-out infinite',
          }} />
        )}
      </div>
      {numPages && (
        <span style={{
          fontSize: '12px',
          padding: '4px 10px',
          borderRadius: '20px',
          background: 'var(--accent)',
          color: 'white',
          fontWeight: 600,
        }}>
          {numPages} page{numPages !== 1 ? 's' : ''}
        </span>
      )}
    </div>
  )
}
