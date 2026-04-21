import { format } from 'date-fns'

export const DOW_FULL = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

export function formatMs(ms) {
  if (ms <= 0) return '0 min'
  const h = Math.floor(ms / 3_600_000)
  const m = Math.floor((ms % 3_600_000) / 60_000)
  if (h > 0) return `${h}h ${m}m`
  return `${m} min`
}

export function formatPct(x) {
  return `${(x * 100).toFixed(1)}%`
}

export function formatDate(d) {
  return d ? format(d, 'yyyy-MM-dd') : '—'
}
