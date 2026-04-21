import { useMemo, useState, useEffect, useRef } from 'react'
import { msToReadable } from '../../utils/formatters'

const DOW_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                     'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const DOW_COL_W = 34 // 28px label + GAP + margin
const GAP = 3
const MAX_WEEKS = 53

function cellColor(ms) {
  if (!ms) return 'var(--bg-card)'
  const min = ms / 60_000
  if (min < 30)  return 'rgba(245,158,11,0.18)'
  if (min < 90)  return 'rgba(245,158,11,0.42)'
  if (min < 180) return 'rgba(245,158,11,0.68)'
  return 'var(--accent)'
}

function isoDate(y, m, d) {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

function jan1Dow(year) {
  return new Date(year, 0, 1).getDay()
}

function daysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate()
}

export default function ActivityHeatmap({ byDay = new Map(), availableYears = [], selectedYear, onYearChange }) {
  const containerRef = useRef(null)
  const [containerWidth, setContainerWidth] = useState(0)

  useEffect(() => {
    if (!containerRef.current) return
    const ro = new ResizeObserver(entries => {
      setContainerWidth(entries[0].contentRect.width)
    })
    ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [])

  // Derive cell size from available width
  const CELL = containerWidth > 0
    ? Math.max(8, Math.min(18, Math.floor((containerWidth - DOW_COL_W - (MAX_WEEKS - 1) * GAP) / MAX_WEEKS)))
    : 13
  const STEP = CELL + GAP
  const MONTH_ROW_H = CELL + 10

  const [tooltip, setTooltip] = useState(null)

  const { columns, monthLabels } = useMemo(() => {
    if (!selectedYear) return { columns: [], monthLabels: [] }

    const year = Number(selectedYear)
    const startDow = jan1Dow(year)

    const cols = []
    const mLabels = []

    let col = []
    for (let p = 0; p < startDow; p++) col.push({ date: null, ms: 0 })

    let prevMonth = -1

    for (let m = 0; m < 12; m++) {
      const days = daysInMonth(year, m)
      for (let d = 1; d <= days; d++) {
        const dateStr = isoDate(year, m, d)
        const ms = byDay.get(dateStr) ?? 0

        if (m !== prevMonth) {
          mLabels.push({ col: cols.length + (col.length > 0 ? 1 : 0), label: MONTH_NAMES[m] })
          prevMonth = m
        }

        col.push({ date: dateStr, ms })

        if (col.length === 7) {
          cols.push(col)
          col = []
        }
      }
    }
    while (col.length < 7) col.push({ date: null, ms: 0 })
    if (col.some(c => c.date)) cols.push(col)

    return { columns: cols, monthLabels: mLabels }
  }, [selectedYear, byDay])

  const gridWidth = columns.length * STEP
  const gridHeight = 7 * STEP

  const s = {
    root: { userSelect: 'none' },
    outerGrid: { paddingBottom: '0.5rem', display: 'flex', justifyContent: 'center' },
    wrapper: { display: 'flex', flexDirection: 'row', gap: 0 },
    dowCol: {
      display: 'flex',
      flexDirection: 'column',
      gap: `${GAP}px`,
      marginRight: `${GAP + 2}px`,
      paddingTop: `${MONTH_ROW_H}px`,
      flexShrink: 0,
    },
    dowLabel: {
      width: '28px',
      height: `${CELL}px`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      fontFamily: "'DM Sans', sans-serif",
      fontSize: '11px',
      color: 'var(--text-secondary)',
      paddingRight: '4px',
    },
    gridArea: { width: `${gridWidth}px` },
    monthRow: {
      position: 'relative',
      height: `${MONTH_ROW_H}px`,
    },
    monthLabel: {
      position: 'absolute',
      fontFamily: "'DM Sans', sans-serif",
      fontSize: '11px',
      color: 'var(--text-secondary)',
      top: '3px',
    },
    tooltip: {
      position: 'fixed',
      pointerEvents: 'none',
      background: 'var(--bg-card)',
      border: '1px solid var(--border-accent)',
      borderRadius: '8px',
      padding: '0.4rem 0.65rem',
      fontFamily: "'DM Sans', sans-serif",
      fontSize: '0.75rem',
      color: 'var(--text-primary)',
      zIndex: 200,
      whiteSpace: 'nowrap',
      boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
    },
  }

  return (
    <div style={s.root} ref={containerRef}>
      <div style={s.outerGrid}>
        <div style={s.wrapper}>
          <div style={s.dowCol}>
            {DOW_LABELS.map((d, i) => (
              <div key={d} style={{ ...s.dowLabel, visibility: i % 2 === 0 ? 'visible' : 'hidden' }}>
                {d}
              </div>
            ))}
          </div>

          <div style={s.gridArea}>
            <div style={s.monthRow}>
              {monthLabels.map(({ col, label }) => (
                <span
                  key={label + col}
                  style={{ ...s.monthLabel, left: `${col * STEP}px` }}
                >
                  {label}
                </span>
              ))}
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${columns.length}, ${CELL}px)`,
                gridTemplateRows: `repeat(7, ${CELL}px)`,
                gridAutoFlow: 'column',
                gap: `${GAP}px`,
                width: `${gridWidth}px`,
                height: `${gridHeight}px`,
              }}
            >
              {columns.flatMap((col, ci) =>
                col.map((cell, ri) => (
                  <div
                    key={`${ci}-${ri}`}
                    style={{
                      width: CELL,
                      height: CELL,
                      borderRadius: 3,
                      background: cell.date ? cellColor(cell.ms) : 'transparent',
                      transition: 'opacity 120ms ease',
                    }}
                    onMouseEnter={e => {
                      if (!cell.date) return
                      const rect = e.currentTarget.getBoundingClientRect()
                      const rawX = rect.left + CELL / 2
                      const x = Math.min(rawX, window.innerWidth - 140)
                      setTooltip({ x, y: rect.top - 8, date: cell.date, ms: cell.ms })
                    }}
                    onMouseLeave={() => setTooltip(null)}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {tooltip && (
        <div
          style={{
            ...s.tooltip,
            left: tooltip.x,
            top: tooltip.y,
            transform: 'translate(-50%, -100%)',
          }}
        >
          <span style={{ color: 'var(--text-secondary)' }}>{tooltip.date}</span>
          {' — '}
          {tooltip.ms > 0 ? msToReadable(tooltip.ms) : 'Sin actividad'}
        </div>
      )}

      <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginTop: '0.75rem' }}>
        <span style={{ fontFamily: "'DM Sans'", fontSize: '11px', color: 'var(--text-secondary)' }}>Menos</span>
        {[null, 'rgba(245,158,11,0.18)', 'rgba(245,158,11,0.42)', 'rgba(245,158,11,0.68)', 'var(--accent)'].map((c, i) => (
          <div key={i} style={{ width: CELL, height: CELL, borderRadius: 3, background: c ?? 'var(--bg-card)', border: '1px solid var(--border)' }} />
        ))}
        <span style={{ fontFamily: "'DM Sans'", fontSize: '11px', color: 'var(--text-secondary)' }}>Más</span>
      </div>
    </div>
  )
}
