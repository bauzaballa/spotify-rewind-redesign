import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

const tooltipStyle = {
  backgroundColor: 'var(--bg-card)',
  border: '1px solid var(--border-accent)',
  borderRadius: '8px',
  color: 'var(--text-primary)',
  fontFamily: "'DM Sans', sans-serif",
  fontSize: '0.8rem',
}

const labelStyle = {
  color: 'var(--text-secondary)',
  fontFamily: "'DM Sans', sans-serif",
  fontSize: '0.75rem',
}

const tickProps = {
  fill: 'var(--text-muted)',
  fontFamily: "'DM Sans', sans-serif",
  fontSize: 12,
}

/**
 * Reutilizable AreaChart wrapper.
 * @param {Array}    data
 * @param {string}   xKey
 * @param {string}   yKey
 * @param {string}   [color]     - stroke color
 * @param {Function} [formatter] - tooltip value formatter
 * @param {number}   [height]
 */
export default function LineChartComponent({
  data,
  xKey,
  yKey,
  color = 'var(--accent)',
  formatter,
  height = 260,
}) {
  const gradientId = `areaGrad-${yKey}`

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 16, right: 8, left: 0, bottom: 4 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.25} />
            <stop offset="95%" stopColor={color} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis dataKey={xKey} tick={tickProps} axisLine={false} tickLine={false} />
        <YAxis tick={tickProps} axisLine={false} tickLine={false}
          tickFormatter={formatter} width={48} tickCount={5} />
        <Tooltip
          contentStyle={tooltipStyle}
          labelStyle={labelStyle}
          cursor={{ stroke: 'var(--border-accent)', strokeWidth: 1 }}
          formatter={formatter ? (v) => [formatter(v), yKey] : undefined}
        />
        <Area
          type="monotone"
          dataKey={yKey}
          stroke={color}
          strokeWidth={2}
          fill={`url(#${gradientId})`}
          dot={false}
          activeDot={{ r: 4, fill: color, stroke: 'var(--bg-card)', strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
