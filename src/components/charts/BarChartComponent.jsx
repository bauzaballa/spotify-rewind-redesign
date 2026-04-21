import { useMemo } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'

const tooltipWrap = {
  backgroundColor: 'var(--bg-card)',
  border: '1px solid var(--border-accent)',
  borderRadius: '8px',
  padding: '0.4rem 0.65rem',
  fontFamily: "'DM Sans', sans-serif",
  fontSize: '0.8rem',
  display: 'flex',
  gap: '0.4rem',
  alignItems: 'center',
  whiteSpace: 'nowrap',
  boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
}

function SingleLineTooltip({ active, payload, label, formatter }) {
  if (!active || !payload?.length) return null
  const raw = payload[0].value
  const value = formatter ? formatter(raw) : raw
  return (
    <div style={tooltipWrap}>
      <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
      <span style={{ color: '#dda15e', fontWeight: 500 }}>{value}</span>
    </div>
  )
}

/**
 * Reutilizable BarChart wrapper.
 * @param {Array}    data
 * @param {string}   xKey
 * @param {string}   yKey
 * @param {string}   [color]      - CSS var or hex; defaults to --accent
 * @param {Function} [formatter]  - tooltip value formatter (value) => string
 * @param {number}   [height]     - container height in px
 * @param {boolean}  [horizontal] - horizontal bar chart
 */
export default function BarChartComponent({
  data,
  xKey,
  yKey,
  color = 'var(--accent)',
  formatter,
  height = 260,
  horizontal = false,
}) {
  // Fallback map for CSS variables used as bar colors
  const CSS_VAR_MAP = {
    '--accent':       '#f59e0b',
    '--accent-hover': '#fcd34d',
  }

  const resolvedColor = useMemo(() => {
    if (!color.startsWith('var(')) return color
    const varName = color.slice(4, -1).trim()
    if (CSS_VAR_MAP[varName]) return CSS_VAR_MAP[varName]
    // Fallback: try runtime resolution
    return getComputedStyle(document.documentElement)
      .getPropertyValue(varName)
      .trim() || '#f59e0b'
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [color])

  const tickProps = {
    fill: 'var(--text-muted)',
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 12,
  }

  if (horizontal) {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} layout="vertical" margin={{ top: 16, right: 16, left: 8, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
          <XAxis type="number" tick={tickProps} axisLine={false} tickLine={false}
            tickFormatter={formatter} />
          <YAxis type="category" dataKey={xKey} tick={tickProps} axisLine={false} tickLine={false}
            width={110} interval={0} />
          <Tooltip
            content={<SingleLineTooltip formatter={formatter} />}
            cursor={{ fill: 'rgba(245,158,11,0.08)' }}
          />
          <Bar dataKey={yKey} radius={[0, 4, 4, 0]}>
            {data.map((_, i) => (
              <Cell
                key={i}
                fill={i === 0 ? 'var(--accent-hover)' : resolvedColor}
                fillOpacity={1 - i * 0.018}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 16, right: 8, left: 0, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis dataKey={xKey} tick={tickProps} axisLine={false} tickLine={false} />
        <YAxis tick={tickProps} axisLine={false} tickLine={false}
          tickFormatter={formatter} width={48} tickCount={5} />
        <Tooltip
          content={<SingleLineTooltip formatter={formatter} />}
          cursor={{ fill: 'rgba(245,158,11,0.08)' }}
        />
        <Bar dataKey={yKey} radius={[4, 4, 0, 0]}>
          {data.map((_, i) => (
            <Cell
              key={i}
              fill={i === 0 ? 'var(--accent-hover)' : resolvedColor}
              fillOpacity={0.92}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
