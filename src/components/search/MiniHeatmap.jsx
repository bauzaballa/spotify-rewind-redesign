import styles from './MiniHeatmap.module.css'

const DOW_LABELS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const HOUR_LABELS = Array.from({ length: 24 }, (_, i) => (i % 6 === 0 ? `${i}h` : ''))

function interpolateColor(t) {
  const pct = Math.round(t * 100)
  return `color-mix(in srgb, var(--bg-card) ${100 - pct}%, var(--accent-hover) ${pct}%)`
}

export default function MiniHeatmap({ title = 'Actividad por hora y día', heatmap }) {
  let max = 0
  for (const row of heatmap) for (const v of row) if (v > max) max = v

  return (
    <div>
      <p className={styles.title}>{title}</p>
      <div className={styles.grid}>
        {heatmap.map((row, dow) => (
          <div key={`row-${dow}`} className={styles.row}>
            <div className={styles.rowLabel}>{DOW_LABELS[dow]}</div>
            {row.map((v, h) => (
              <div
                key={`c-${dow}-${h}`}
                className={styles.cell}
                style={{ background: max === 0 ? 'var(--bg-card)' : interpolateColor(v / max) }}
                data-label={`${DOW_LABELS[dow]} ${h}h · ${v} plays`}
              />
            ))}
          </div>
        ))}
        <div className={styles.hourRow}>
          <div />
          {HOUR_LABELS.map((label, h) => (
            <div key={`h-${h}`} className={styles.hourLabel}>{label}</div>
          ))}
        </div>
      </div>
    </div>
  )
}
