function bumpBucket(map, key, ms) {
  const cur = map.get(key) ?? { plays: 0, msTotal: 0 }
  cur.plays += 1
  cur.msTotal += ms
  map.set(key, cur)
}

function bumpTrack(map, uri, e) {
  const cur = map.get(uri) ?? {
    uri,
    name: e.master_metadata_track_name,
    plays: 0,
    msTotal: 0,
  }
  cur.plays += 1
  cur.msTotal += e.ms_played
  map.set(uri, cur)
}

function argmax(arr) {
  let best = 0, idx = 0
  for (let i = 0; i < arr.length; i++) if (arr[i] > best) { best = arr[i]; idx = i }
  return arr[idx] === 0 ? null : idx
}

function argmaxMs(map) {
  let best = 0, key = null
  for (const [k, v] of map) if (v.msTotal > best) { best = v.msTotal; key = k }
  return key
}

function sortedEntries(map) {
  return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b))
}

function rankedByMs(map, limit) {
  return Array.from(map.entries())
    .map(([name, v]) => ({ name, plays: v.plays, msTotal: v.msTotal }))
    .sort((a, b) => b.msTotal - a.msTotal)
    .slice(0, limit)
}

function rankedTracks(map, limit) {
  return Array.from(map.values())
    .sort((a, b) => b.plays - a.plays)
    .slice(0, limit)
}

function matchesEntity(e, type, id) {
  if (type === 'track') {
    if (e.master_metadata_track_name == null) return false
    const uri = e.spotify_track_uri
      ?? `${e.master_metadata_album_artist_name}__${e.master_metadata_track_name}`
    return uri === id
  }
  if (type === 'artist') {
    return e.master_metadata_album_artist_name === id
  }
  if (type === 'album') {
    const key = `${e.master_metadata_album_artist_name}__${e.master_metadata_album_album_name}`
    return key === id
  }
  return false
}

export function deriveEntityDetail(raw, type, id, processed) {
  const byMonth  = new Map()
  const byYear   = new Map()
  const byHour   = new Array(24).fill(0)
  const byDow    = new Array(7).fill(0)
  const heatmap  = Array.from({ length: 7 }, () => new Array(24).fill(0))
  const platforms= new Map()
  const tracksByPlays = new Map()
  const albumsByMs    = new Map()

  let firstTs = null, lastTs = null
  let totalMs = 0, totalPlays = 0, skipCount = 0, shuffleCount = 0, offlineCount = 0

  for (const e of raw) {
    if (e.ms_played < 30_000) continue
    if (!matchesEntity(e, type, id)) continue

    totalMs    += e.ms_played
    totalPlays += 1
    if (e.skipped) skipCount    += 1
    if (e.shuffle) shuffleCount += 1
    if (e.offline) offlineCount += 1

    const d = new Date(e.ts)
    if (!firstTs || d < firstTs) firstTs = d
    if (!lastTs  || d > lastTs)  lastTs  = d

    const y   = String(d.getFullYear())
    const m   = `${y}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const h   = d.getHours()
    const dow = d.getDay()

    bumpBucket(byYear,  y, e.ms_played)
    bumpBucket(byMonth, m, e.ms_played)
    byHour[h]        += 1
    byDow[dow]       += 1
    heatmap[dow][h]  += 1

    if (e.platform) bumpBucket(platforms, e.platform, e.ms_played)

    if (type === 'artist') {
      const uri = e.spotify_track_uri ?? `__${e.master_metadata_track_name}`
      bumpTrack(tracksByPlays, uri, e)
      const alb = e.master_metadata_album_album_name
      if (alb) bumpBucket(albumsByMs, alb, e.ms_played)
    }
    if (type === 'album') {
      const uri = e.spotify_track_uri ?? `__${e.master_metadata_track_name}`
      bumpTrack(tracksByPlays, uri, e)
    }
  }

  const globalMs = processed.stats.totalMs
  return {
    type, id,
    totalPlays, totalMs,
    skipCount, shuffleCount, offlineCount,
    skipRate:    totalPlays ? skipCount    / totalPlays : 0,
    shuffleRate: totalPlays ? shuffleCount / totalPlays : 0,
    offlineRate: totalPlays ? offlineCount / totalPlays : 0,
    avgPlayMs:   totalPlays ? totalMs / totalPlays : 0,
    pctOfTotal:  globalMs   ? totalMs / globalMs   : 0,
    firstTs, lastTs,
    byMonth:  sortedEntries(byMonth),
    byYear:   sortedEntries(byYear),
    byHour, byDow, heatmap,
    peakHour: argmax(byHour),
    peakDow:  argmax(byDow),
    topYear:  argmaxMs(byYear),
    topMonth: argmaxMs(byMonth),
    platforms: rankedByMs(platforms, 8),
    topTracks: (type === 'artist' || type === 'album')
      ? rankedTracks(tracksByPlays, type === 'album' ? 9999 : 10)
      : [],
    topAlbums: type === 'artist' ? rankedByMs(albumsByMs, 5) : [],
  }
}
