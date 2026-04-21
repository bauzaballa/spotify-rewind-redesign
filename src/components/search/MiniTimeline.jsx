import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import styles from './MiniTimeline.module.css'

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  const { plays, minutes } = payload[0].payload
  return (
    <div className={styles.tooltip}>
      <div className={styles.tooltipHeader}>{label}</div>
      <div>{plays} reproducciones · {minutes} min</div>
    </div>
  )
}

export default function MiniTimeline({ title = 'Reproducciones por mes', byMonth }) {
  const data = byMonth.map(([month, d]) => ({
    month,
    plays:   d.plays,
    minutes: Math.round(d.msTotal / 60_000),
  }))

  return (
    <div>
      <p className={styles.title}>{title}</p>
      <div className={styles.wrap}>
        <ResponsiveContainer>
          <LineChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="2 4" stroke="var(--border)" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
            <YAxis width={40} tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'var(--border-accent)' }} />
            <Line type="monotone" dataKey="plays" stroke="var(--accent)" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
