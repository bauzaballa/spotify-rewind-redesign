const styles = {
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    padding: '0.2rem 0.55rem',
    borderRadius: '999px',
    border: '1px solid var(--border-accent)',
    background: 'rgba(221, 161, 94, 0.1)',
    color: 'var(--accent)',
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: 500,
    fontSize: '0.75rem',
    lineHeight: 1,
    whiteSpace: 'nowrap',
  },
}

/**
 * Small badge to highlight a key number or label.
 */
export default function StatBadge({ children }) {
  return <span style={styles.badge}>{children}</span>
}
