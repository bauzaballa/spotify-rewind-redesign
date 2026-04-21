import { format } from 'date-fns'

/**
 * Converts milliseconds to total hours (rounded to 1 decimal).
 */
export function msToHours(ms) {
  return Math.round((ms / 3_600_000) * 10) / 10
}

/**
 * Converts milliseconds to a human-readable string: "Xh Ym" or "Xm Ys".
 */
export function msToReadable(ms) {
  const totalSeconds = Math.floor(ms / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  if (hours > 0) return `${hours}h ${minutes}m`
  if (minutes > 0) return `${minutes}m ${seconds}s`
  return `${seconds}s`
}

/**
 * Formats a number with thousand separators.
 */
export function formatNumber(n) {
  return n.toLocaleString('es-AR')
}

/**
 * Formats a ratio (0–1) as a percentage string: "42.3%".
 */
export function formatPercent(ratio, decimals = 1) {
  return `${(ratio * 100).toFixed(decimals)}%`
}

/**
 * Formats an ISO date string or Date object using a date-fns pattern.
 * Default pattern: "d MMM yyyy"
 */
export function formatDate(dateInput, pattern = 'd MMM yyyy') {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput
  return format(date, pattern)
}

/**
 * Normalizes a raw Spotify platform string into one of 4 categories.
 * @returns {'mobile'|'desktop'|'web'|'smart'}
 */
export function normalizePlatform(raw) {
  const s = raw.toLowerCase()
  if (s.includes('android') || s.includes('ios') || s.includes('iphone') || s.includes('ipad')) return 'mobile'
  if (s.includes('windows') || s.includes('osx') || s.includes('macos') || s.includes('linux')) return 'desktop'
  if (s.includes('web') || s.includes('browser')) return 'web'
  return 'smart'
}
