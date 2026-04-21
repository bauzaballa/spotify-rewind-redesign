/**
 * Processes raw Spotify extended history entries into structured analytics data.
 * Filters out plays under 30 seconds before any calculation.
 * Uses chunked async processing to keep the UI responsive and report real progress.
 */

const CHUNK_SIZE = 5000

function tick() {
  return new Promise(resolve => setTimeout(resolve, 0))
}

function procesarChunk(chunk, maps, counters) {
  const {
    tracks, artists, albums, podcasts,
    byYear, byMonth, byHour, byDayOfWeek, byDay,
    platforms, reasonEnd, skipsByHour,
  } = maps

  for (const entry of chunk) {
    const {
      ts,
      ms_played,
      master_metadata_track_name,
      master_metadata_album_artist_name,
      master_metadata_album_album_name,
      spotify_track_uri,
      episode_name,
      episode_show_name,
      skipped,
      shuffle,
      offline,
      platform,
      reason_end,
    } = entry

    counters.totalMs += ms_played
    counters.totalPlays += 1
    if (skipped) counters.skippedCount += 1
    if (shuffle) counters.shuffleCount += 1
    if (offline) counters.offlineCount += 1

    // --- Time buckets (local timezone) ---
    const date = new Date(ts)
    const year  = String(date.getFullYear())
    const month = `${year}-${String(date.getMonth() + 1).padStart(2, '0')}`
    const day   = `${month}-${String(date.getDate()).padStart(2, '0')}`
    const hour  = date.getHours()
    const dow   = date.getDay()

    const yr = byYear.get(year) ?? { plays: 0, msTotal: 0 }
    yr.plays += 1; yr.msTotal += ms_played
    byYear.set(year, yr)

    const mo = byMonth.get(month) ?? { plays: 0, msTotal: 0 }
    mo.plays += 1; mo.msTotal += ms_played
    byMonth.set(month, mo)

    byHour[hour] += 1
    if (skipped) skipsByHour[hour] += 1
    byDayOfWeek[dow] += 1
    byDay.set(day, (byDay.get(day) ?? 0) + ms_played)

    if (platform) {
      const pl = platforms.get(platform) ?? { plays: 0, msTotal: 0 }
      pl.plays += 1; pl.msTotal += ms_played
      platforms.set(platform, pl)
    }

    if (reason_end) {
      reasonEnd.set(reason_end, (reasonEnd.get(reason_end) ?? 0) + 1)
    }

    if (entry.reason_start) {
      maps.reasonStart.set(entry.reason_start, (maps.reasonStart.get(entry.reason_start) ?? 0) + 1)
    }

    // --- Tracks ---
    if (master_metadata_track_name != null) {
      const uri     = spotify_track_uri ?? `${master_metadata_album_artist_name}__${master_metadata_track_name}`
      const track   = tracks.get(uri) ?? {
        name:   master_metadata_track_name,
        artist: master_metadata_album_artist_name ?? '',
        album:  master_metadata_album_album_name  ?? '',
        plays: 0, msTotal: 0, skips: 0,
      }
      track.plays += 1; track.msTotal += ms_played
      if (skipped) track.skips += 1
      tracks.set(uri, track)

      const artistName = master_metadata_album_artist_name ?? ''
      if (artistName) {
        const art = artists.get(artistName) ?? { plays: 0, msTotal: 0, tracksSet: new Set() }
        art.plays += 1; art.msTotal += ms_played
        art.tracksSet.add(uri)
        artists.set(artistName, art)
      }

      const albumName = master_metadata_album_album_name ?? ''
      if (albumName && artistName) {
        const albumKey = `${artistName}__${albumName}`
        const alb = albums.get(albumKey) ?? { name: albumName, artist: artistName, plays: 0, msTotal: 0 }
        alb.plays += 1; alb.msTotal += ms_played
        albums.set(albumKey, alb)
      }
    }

    // --- Podcasts ---
    if (episode_name != null) {
      const showName = episode_show_name ?? episode_name
      const pod = podcasts.get(showName) ?? { plays: 0, msTotal: 0, episodes: new Set() }
      pod.plays += 1; pod.msTotal += ms_played
      pod.episodes.add(episode_name)
      podcasts.set(showName, pod)
    }
  }
}

function computeStats(maps, counters) {
  const { tracks, artists, byYear } = maps
  const { totalMs, totalPlays, skippedCount, shuffleCount, offlineCount } = counters

  let topTrack = null
  for (const t of tracks.values()) {
    if (!topTrack || t.plays > topTrack.plays)
      topTrack = { name: t.name, artist: t.artist, msTotal: t.msTotal, plays: t.plays }
  }

  let topArtist = null
  for (const [name, a] of artists) {
    if (!topArtist || a.msTotal > topArtist.msTotal)
      topArtist = { name, msTotal: a.msTotal }
  }

  let bestYear = null, bestYearMs = 0
  for (const [yr, data] of byYear) {
    if (data.msTotal > bestYearMs) { bestYearMs = data.msTotal; bestYear = yr }
  }

  return {
    totalMs,
    totalPlays,
    uniqueTracks:  tracks.size,
    uniqueArtists: artists.size,
    uniqueAlbums:  maps.albums.size,
    skippedRatio:  totalPlays > 0 ? skippedCount / totalPlays : 0,
    shuffleRatio:  totalPlays > 0 ? shuffleCount / totalPlays : 0,
    offlineRatio:  totalPlays > 0 ? offlineCount / totalPlays : 0,
    topTrack,
    topArtist,
    bestYear,
  }
}

function computeMoodStats(maps) {
  const { byHour, byDayOfWeek, byDay, skipsByHour } = maps

  const peakHour = byHour.indexOf(Math.max(...byHour))
  const peakDay  = byDayOfWeek.indexOf(Math.max(...byDayOfWeek))

  const dailyMinutes = Array.from(byDay.values())
    .map(ms => Math.round(ms / 60_000))
    .sort((a, b) => a - b)
  const mid = Math.floor(dailyMinutes.length / 2)
  const medianSessionMinutes = dailyMinutes[mid] ?? 0

  const skipRateByHour = byHour.map((plays, h) =>
    plays > 0 ? skipsByHour[h] / plays : 0
  )

  const sortedDays = Array.from(byDay.keys()).sort()
  let longestStreak = 0, longestStreakStart = '', longestStreakEnd = ''
  let streak = 0, streakStart = ''

  for (let i = 0; i < sortedDays.length; i++) {
    if (i === 0) {
      streak = 1
      streakStart = sortedDays[0]
    } else {
      const diffDays = Math.round(
        (new Date(sortedDays[i]) - new Date(sortedDays[i - 1])) / 86_400_000
      )
      if (diffDays === 1) {
        streak++
      } else {
        if (streak > longestStreak) {
          longestStreak = streak
          longestStreakStart = streakStart
          longestStreakEnd = sortedDays[i - 1]
        }
        streak = 1
        streakStart = sortedDays[i]
      }
    }
  }
  if (sortedDays.length > 0 && streak > longestStreak) {
    longestStreak = streak
    longestStreakStart = streakStart
    longestStreakEnd = sortedDays[sortedDays.length - 1]
  }

  let currentStreak = 0
  if (sortedDays.length > 0) {
    currentStreak = 1
    for (let i = sortedDays.length - 2; i >= 0; i--) {
      const diffDays = Math.round(
        (new Date(sortedDays[i + 1]) - new Date(sortedDays[i])) / 86_400_000
      )
      if (diffDays === 1) currentStreak++
      else break
    }
  }

  return {
    peakHour,
    peakDay,
    medianSessionMinutes,
    currentStreak,
    longestStreak,
    longestStreakStart,
    longestStreakEnd,
    skipRateByHour,
  }
}

/**
 * Async, chunked version. Calls onProgress(0–100) as work progresses.
 * Yields to the UI between chunks so the browser stays responsive.
 */
export async function procesarHistorialAsync(entries, onProgress = () => {}) {
  onProgress(3)
  await tick()

  const valid = entries.filter(e => e.ms_played >= 30_000)

  if (import.meta.env.DEV) {
    console.log(`[parseData] Input: ${entries.length} | válidas (≥30s): ${valid.length}`)
    const songs    = valid.filter(e => e.master_metadata_track_name != null).length
    const podcasts = valid.filter(e => e.episode_name != null).length
    console.log(`[parseData] Canciones: ${songs} | Podcasts: ${podcasts}`)
  }

  onProgress(8)
  await tick()

  const maps = {
    tracks:      new Map(),
    artists:     new Map(),
    albums:      new Map(),
    podcasts:    new Map(),
    byYear:      new Map(),
    byMonth:     new Map(),
    byHour:      new Array(24).fill(0),
    byDayOfWeek: new Array(7).fill(0),
    byDay:       new Map(),
    platforms:   new Map(),
    reasonEnd:   new Map(),
    reasonStart: new Map(),
    skipsByHour: new Array(24).fill(0),
  }
  const counters = {
    totalMs: 0, totalPlays: 0,
    skippedCount: 0, shuffleCount: 0, offlineCount: 0,
  }

  const totalChunks = Math.ceil(valid.length / CHUNK_SIZE) || 1

  for (let i = 0; i < totalChunks; i++) {
    procesarChunk(
      valid.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE),
      maps,
      counters,
    )
    onProgress(8 + Math.round(((i + 1) / totalChunks) * 82))
    await tick()
  }

  onProgress(93)
  await tick()

  const stats = computeStats(maps, counters)
  const moodStats = computeMoodStats(maps)

  if (import.meta.env.DEV) {
    console.log(`[parseData] Resultado: ${maps.tracks.size} tracks | ${maps.artists.size} artistas | ${maps.albums.size} álbumes | ${maps.podcasts.size} shows`)
    console.log('[parseData] Top 5 artistas:', Array.from(maps.artists.entries())
      .sort((a, b) => b[1].msTotal - a[1].msTotal)
      .slice(0, 5)
      .map(([name, d]) => `${name} (${Math.round(d.msTotal / 3_600_000 * 10) / 10}h)`)
    )
  }

  onProgress(100)
  return { ...maps, stats, moodStats }
}
