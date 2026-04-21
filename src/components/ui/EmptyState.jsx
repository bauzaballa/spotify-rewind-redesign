/**
 * Generic empty state for sections with no data.
 * @param {React.ReactNode} icon   - Lucide icon element
 * @param {string}          title
 * @param {string}          [sub]
 */
export default function EmptyState({ icon, title, sub }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.6rem',
      padding: '3.5rem 2rem',
      color: 'var(--text-muted)',
      textAlign: 'center',
    }}>
      {icon && (
        <div style={{ opacity: 0.5 }}>{icon}</div>
      )}
      <p style={{
        fontFamily: "'DM Sans', sans-serif",
        fontWeight: 500,
        fontSize: '0.9rem',
        color: 'var(--text-secondary)',
      }}>
        {title}
      </p>
      {sub && (
        <p style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: '0.8rem',
          color: 'var(--text-muted)',
        }}>
          {sub}
        </p>
      )}
    </div>
  )
}
