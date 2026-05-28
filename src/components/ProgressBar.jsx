export default function ProgressBar({ progress, label }) {
  return (
    <div style={{ width: '100%' }}>
      {label && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{label}</span>
          <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--accent)' }}>{progress}%</span>
        </div>
      )}
      <div style={{
        width: '100%',
        height: '8px',
        background: 'var(--glass-border)',
        borderRadius: '4px',
        overflow: 'hidden',
      }}>
        <div style={{
          height: '100%',
          width: `${progress}%`,
          background: 'linear-gradient(90deg, #667eea, #764ba2, #f093fb)',
          backgroundSize: '200% 100%',
          borderRadius: '4px',
          transition: 'width 0.3s ease',
          animation: progress < 100 && progress > 0 ? 'shimmer 2s linear infinite' : 'none',
        }} />
      </div>
    </div>
  )
}
