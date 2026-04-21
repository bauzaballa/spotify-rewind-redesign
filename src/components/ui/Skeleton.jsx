/**
 * Skeleton shimmer placeholder.
 * @param {string|number} width
 * @param {string|number} height
 * @param {string}        [borderRadius]
 * @param {string}        [className]
 */
export function Skeleton({ width = '100%', height = '1rem', borderRadius = '6px', style }) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius,
        background: 'linear-gradient(90deg, var(--bg-card) 25%, var(--bg-card-hover) 50%, var(--bg-card) 75%)',
        backgroundSize: '200% 100%',
        animation: 'skeletonShimmer 1.4s ease infinite',
        ...style,
      }}
    />
  )
}

/**
 * Skeleton card matching the stat card layout in Overview.
 */
export function SkeletonStatCard() {
  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: '12px',
      padding: '1rem',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '0.5rem',
    }}>
      <Skeleton width="60%" height="0.7rem" />
      <Skeleton width="40%" height="2rem" borderRadius="4px" />
      <Skeleton width="70%" height="0.7rem" />
    </div>
  )
}

/**
 * Skeleton card matching a chart card layout.
 */
export function SkeletonChartCard({ height = 220 }) {
  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: '12px',
      padding: '1.25rem',
    }}>
      <Skeleton width="35%" height="0.7rem" style={{ marginBottom: '1rem' }} />
      <Skeleton width="100%" height={height} borderRadius="8px" />
    </div>
  )
}
