import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const tooltipStyle = {
  backgroundColor: 'var(--bg-card)',
  border: '1px solid var(--border-accent)',
  borderRadius: '8px',
  color: 'var(--text-primary)',
  fontFamily: "'DM Sans', sans-serif",
  fontSize: '0.8rem',
}

const DEFAULT_COLORS = [
  '#f59e0b', '#fcd34d', '#d97706', '#b45309', '#fbbf24',
  '#92400e', '#78350f', '#a16207', '#ca8a04', '#eab308',
]

/**
 * Donut (PieChart with innerRadius) wrapper.
 * @param {Array<{name: string, value: number}>} data
 * @param {string[]} [colors]
 * @param {number}   [height]
 * @param {Function} [formatter] - tooltip value formatter
 */
export default function DonutChartComponent({
  data,
  colors = DEFAULT_COLORS,
  height = 260,
  formatter,
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius="55%"
          outerRadius="78%"
          paddingAngle={2}
          dataKey="value"
        >
          {data.map((_, i) => (
            <Cell key={i} fill={colors[i % colors.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={tooltipStyle}
          formatter={formatter ? (v, name) => [formatter(v), name] : undefined}
        />
        <Legend
          iconType="circle"
          iconSize={8}
          formatter={(value) => (
            <span style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '0.75rem',
              color: 'var(--text-secondary)',
            }}>
              {value}
            </span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
