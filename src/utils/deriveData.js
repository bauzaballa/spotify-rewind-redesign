import { normalizePlatform } from './formatters'
import { buildSearchIndex } from './searchIndex'

const DOW_NAMES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

const REASON_END_LABELS = {
  trackdone: 'Completada',
  fwdbtn:    'Skip manual',
  backbtn:   'Anterior',
  endplay:   'Fin lista',
  remote:    'Control remoto',
  logout:    'Logout',
  unknown:   'Desconocido',
}

const REASON_START_LABELS = {
  trackdone:  'Tema anterior terminó',
  fwdbtn:     'Skip hacia adelante',
  playbtn:    'Play / Playlist',
  clickrow:   'Clic directo',
  remote:     'Control remoto',
  appload:    'App abierta',
  backbtn:    'Volvió atrás',
  trackerror: 'Error de pista',
  unknown:    'Desconocido',
}

const GROUP_ORDER = ['mobile', 'desktop', 'web', 'smart']
const MIN_PLAYS_SKIP = 10

function hourLabel(h) {
  if (h === 0)  return '12am'
  if (h < 12)  return `${h}am`
  if (h === 12) return '12pm'
  return `${h - 12}pm`
}

function timePeriod(h) {
  if (h >= 5  && h < 12) return 'Mañana'
  if (h >= 12 && h < 18) return 'Tarde'
  if (h >= 18 && h < 23) return 'Noche'
  return 'Madrugada'
}

function platformDisplayLabel(raw) {
  const s = raw.toLowerCase()
  if (s.includes('android'))              return 'Android'
  if (s.includes('iphone') || s.includes('ipad')) return 'iOS'
  if (s.includes('ios'))                  return 'iOS'
  if (s.includes('windows'))             return 'Windows'
  if (s.includes('osx') || s.includes('macos')) return 'macOS'
  if (s.includes('linux'))               return 'Linux'
  if (s.includes('web'))                 return 'Web'
  return raw.charAt(0).toUpperCase() + raw.slice(1)
}

export function deriveViewData(processed) {
  // ── Overview ────────────────────────────────────────────────
  const yearData = Array.from(processed.byYear.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([year, d]) => ({ year, plays: d.plays }))

  const monthData = Array.from(processed.byMonth.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-24)
    .map(([month, d]) => ({
      month: month.slice(2),
      minutos: Math.round(d.msTotal / 60_000),
    }))

  // ── TopTracks ────────────────────────────────────────────────
  const allTracks = Array.from(processed.tracks.entries()).map(([uri, t]) => ({ uri, ...t }))

  // ── TopArtists ───────────────────────────────────────────────
  const allArtists = Array.from(processed.artists.entries()).map(([name, a]) => ({
    name,
    plays:        a.plays,
    msTotal:      a.msTotal,
    uniqueTracks: a.tracksSet.size,
  }))

  const topArtistsChart = [...allArtists]
    .sort((a, b) => b.msTotal - a.msTotal)
    .slice(0, 15)
    .map(a => ({
      name:  a.name.length > 16 ? a.name.slice(0, 16) + '…' : a.name,
      horas: (a.msTotal / 3_600_000).toFixed(1) + 'h',
      value: Math.round(a.msTotal / 3_600_000 * 10) / 10,
    }))

  // ── TopAlbums ────────────────────────────────────────────────
  const albumTrackCounts = {}
  for (const t of processed.tracks.values()) {
    const key = `${t.artist}__${t.album}`
    albumTrackCounts[key] = (albumTrackCounts[key] ?? 0) + 1
  }

  const allAlbums = Array.from(processed.albums.entries()).map(([key, a]) => ({
    key,
    name:       a.name,
    artist:     a.artist,
    plays:      a.plays,
    msTotal:    a.msTotal,
    trackCount: albumTrackCounts[key] ?? 0,
  }))

  // ── Platforms ────────────────────────────────────────────────
  const groupMap = new Map(GROUP_ORDER.map(g => [g, { plays: 0, msTotal: 0, subtypes: new Map() }]))
  for (const [raw, data] of processed.platforms) {
    const groupId = normalizePlatform(raw)
    const g = groupMap.get(groupId)
    if (!g) continue
    g.plays   += data.plays
    g.msTotal += data.msTotal
    const subLabel = platformDisplayLabel(raw)
    const sub = g.subtypes.get(subLabel) ?? { plays: 0, msTotal: 0 }
    sub.plays   += data.plays
    sub.msTotal += data.msTotal
    g.subtypes.set(subLabel, sub)
  }
  const platformTotal = Array.from(groupMap.values()).reduce((acc, g) => acc + g.plays, 0)
  const platformGroups = GROUP_ORDER
    .map(id => ({
      id,
      plays:       groupMap.get(id).plays,
      msTotal:     groupMap.get(id).msTotal,
      pct:         platformTotal > 0 ? groupMap.get(id).plays / platformTotal : 0,
      subtypeList: Array.from(groupMap.get(id).subtypes.keys()),
    }))
    .filter(g => g.plays > 0)

  // ── TimeAnalysis ─────────────────────────────────────────────
  const hourData = processed.byHour.map((plays, h) => ({ hora: hourLabel(h), plays }))
  const dowData  = processed.byDayOfWeek.map((plays, i) => ({ día: DOW_NAMES[i].slice(0, 3), plays }))

  let peakHourMax = 0, peakHourIdx = 0
  processed.byHour.forEach((v, i) => { if (v > peakHourMax) { peakHourMax = v; peakHourIdx = i } })
  const peakHour = { plays: peakHourMax, label: hourLabel(peakHourIdx), period: timePeriod(peakHourIdx) }

  let peakDowMax = 0, peakDowIdx = 0
  processed.byDayOfWeek.forEach((v, i) => { if (v > peakDowMax) { peakDowMax = v; peakDowIdx = i } })
  const peakDow = { plays: peakDowMax, name: DOW_NAMES[peakDowIdx] }

  const availableYears = Array.from(processed.byYear.keys()).sort()

  // ── Mood ─────────────────────────────────────────────────────
  const skipRateByHour = processed.moodStats.skipRateByHour.map((rate, h) => ({
    hora: `${h}h`,
    skip: Math.round(rate * 100),
  }))

  // ── Habits ───────────────────────────────────────────────────
  const reEndEntries = Array.from(processed.reasonEnd.entries())
    .map(([r, count]) => ({ name: REASON_END_LABELS[r] ?? r, value: count }))
    .sort((a, b) => b.value - a.value)
  const reEndTotal = reEndEntries.reduce((s, e) => s + e.value, 0)
  const reasonEndData = reEndEntries.map(e => ({ ...e, pct: reEndTotal > 0 ? e.value / reEndTotal : 0 }))

  const reStartEntries = Array.from((processed.reasonStart ?? new Map()).entries())
    .map(([r, count]) => ({ name: REASON_START_LABELS[r] ?? r, value: count }))
    .sort((a, b) => b.value - a.value)
  const reStartTotal = reStartEntries.reduce((s, e) => s + e.value, 0)
  const reasonStartData = reStartEntries.map(e => ({ ...e, pct: reStartTotal > 0 ? e.value / reStartTotal : 0 }))

  const artistSkipMap = new Map()
  for (const t of processed.tracks.values()) {
    const entry = artistSkipMap.get(t.artist) ?? { plays: 0, skips: 0 }
    entry.plays += t.plays
    entry.skips += t.skips
    artistSkipMap.set(t.artist, entry)
  }
  const mostSkipped = Array.from(artistSkipMap.entries())
    .filter(([, d]) => d.plays >= MIN_PLAYS_SKIP)
    .map(([name, d]) => ({ name, totalPlays: d.plays, skipRate: d.skips / d.plays }))
    .sort((a, b) => b.skipRate - a.skipRate)
    .slice(0, 5)

  // ── Podcasts ─────────────────────────────────────────────────
  const allShows = Array.from(processed.podcasts.entries()).map(([name, p]) => ({
    name,
    plays:        p.plays,
    msTotal:      p.msTotal,
    episodeCount: p.episodes.size,
  }))

  const topShowsChart = [...allShows]
    .sort((a, b) => b.msTotal - a.msTotal)
    .slice(0, 10)
    .map(s => ({
      name:  s.name.length > 20 ? s.name.slice(0, 20) + '…' : s.name,
      value: Math.round(s.msTotal / 3_600_000 * 10) / 10,
    }))

  // ── Search index ─────────────────────────────────────────────
  const searchIndex = buildSearchIndex(processed)

  return {
    yearData,
    monthData,
    allTracks,
    allArtists,
    topArtistsChart,
    allAlbums,
    platformGroups,
    hourData,
    dowData,
    peakHour,
    peakDow,
    availableYears,
    skipRateByHour,
    reasonEndData,
    reasonStartData,
    mostSkipped,
    allShows,
    topShowsChart,
    searchIndex,
  }
}
