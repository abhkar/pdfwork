import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'

function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
}

function FileIcon({ type }) {
  if (type && type.startsWith('image/')) return <span style={{ fontSize: '24px' }}>🖼️</span>
  return <span style={{ fontSize: '24px' }}>📄</span>
}

export default function DropZone({
  onFiles,
  accept,
  multiple = false,
  label = 'Drop your PDF here',
  sublabel = 'or click to browse',
  files = [],
  onRemove,
}) {
  const [dragActive, setDragActive] = useState(false)

  const onDrop = useCallback((accepted) => {
    if (accepted.length > 0) {
      onFiles(accepted)
    }
  }, [onFiles])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    multiple,
    onDragEnter: () => setDragActive(true),
    onDragLeave: () => setDragActive(false),
  })

  const active = isDragActive || dragActive

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div
        {...getRootProps()}
        style={{
          border: `2px dashed ${active ? 'var(--accent)' : 'var(--glass-border)'}`,
          borderRadius: '16px',
          padding: '48px 24px',
          textAlign: 'center',
          cursor: 'pointer',
          background: active ? 'rgba(102,126,234,0.08)' : 'var(--glass-bg)',
          backdropFilter: 'blur(20px)',
          transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
          boxShadow: active ? '0 0 30px rgba(102,126,234,0.3), inset 0 0 30px rgba(102,126,234,0.05)' : 'none',
          transform: active ? 'scale(1.01)' : 'scale(1)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Shimmer effect on drag */}
        {active && (
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(90deg, transparent, rgba(102,126,234,0.1), transparent)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s infinite',
          }} />
        )}

        <input {...getInputProps()} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{
            fontSize: '56px',
            marginBottom: '16px',
            animation: active ? 'float 1s ease-in-out infinite' : 'none',
            display: 'block',
          }}>
            {active ? '📥' : '📂'}
          </div>
          <p style={{
            fontSize: '18px',
            fontWeight: 600,
            color: active ? 'var(--accent)' : 'var(--text-primary)',
            marginBottom: '8px',
            transition: 'color 0.3s ease',
          }}>
            {active ? 'Drop it here!' : label}
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '16px' }}>
            {sublabel}
          </p>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 16px',
            background: active ? 'rgba(102,126,234,0.2)' : 'var(--glass-bg)',
            border: '1px solid var(--glass-border)',
            borderRadius: '8px',
            fontSize: '13px',
            color: 'var(--text-secondary)',
          }}>
            <span>📎</span>
            <span>
              {Object.values(accept || {}).flat().join(', ') || 'Any file'}
            </span>
          </div>
        </div>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          animation: 'slideUp 0.3s ease',
        }}>
          {files.map((file, i) => (
            <div
              key={`${file.name}-${i}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                background: 'var(--glass-bg)',
                border: '1px solid var(--glass-border)',
                borderRadius: '12px',
                backdropFilter: 'blur(10px)',
                animation: 'slideUp 0.3s ease',
                animationDelay: `${i * 0.05}s`,
              }}
            >
              <FileIcon type={file.type} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{
                  fontSize: '14px',
                  fontWeight: 500,
                  color: 'var(--text-primary)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  {file.name}
                </p>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  {formatSize(file.size)}
                </p>
              </div>
              {onRemove && (
                <button
                  onClick={(e) => { e.stopPropagation(); onRemove(i) }}
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '6px',
                    border: 'none',
                    background: 'rgba(248,113,113,0.1)',
                    color: 'var(--error)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '16px',
                    flexShrink: 0,
                    transition: 'background 0.2s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(248,113,113,0.2)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(248,113,113,0.1)'}
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
