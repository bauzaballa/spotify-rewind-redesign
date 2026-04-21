#!/usr/bin/env node
/**
 * Generate an anonymized synthetic sample zip from a real Spotify extended
 * streaming history zip.
 *
 * Reads: ./my_spotify_data.zip (or the path passed as argv[2])
 * Writes: ./public/sample_data.zip
 *
 * What it keeps:
 *  - Public music metadata: track, artist, album names (optional uri).
 *  - Enough volume per entity to exercise every feature in the app.
 *
 * What it strips:
 *  - conn_country, ip_addr_decrypted, ip_addr, username, user_agent_decrypted.
 *  - Real platform strings (replaced with a small rotating set of anonymous values).
 *  - Real ts values (replaced with synthetic timestamps spread across 3 years).
 *
 * Output size per entity:
 *   top 200 tracks, top 200 artists, top 200 albums (union) — each gets a
 *   number of fake plays equal to min(real_plays_count, 50) with random
 *   timestamps and a plausible ms_played distribution.
 */

import { readFile, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { dirname } from 'node:path'
import JSZip from 'jszip'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const INPUT_ZIP  = process.argv[2] ? resolve(process.argv[2]) : resolve(ROOT, 'my_spotify_data.zip')
const OUTPUT_ZIP = resolve(ROOT, 'public', 'sample_data.zip')

const TOP_N = 200
const MAX_PLAYS_PER_TRACK = 50
const ANON_PLATFORMS = ['Android OS', 'iOS', 'Windows', 'macOS', 'WebPlayer']
const ANON_REASONS_END   = ['trackdone', 'trackdone', 'trackdone', 'fwdbtn', 'endplay', 'logout']
const ANON_REASONS_START = ['trackdone', 'trackdone', 'fwdbtn', 'clickrow', 'playbtn', 'appload']

const START_DATE = new Date('2023-01-01T00:00:00Z').getTime()
const END_DATE   = new Date('2026-04-01T00:00:00Z').getTime()

/** Deterministic pseudo-random so the sample is reproducible. */
function mulberry32(seed) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6D2B79F5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const rand = mulberry32(1337)

function pick(arr) {
  return arr[Math.floor(rand() * arr.length)]
}

function randomTs() {
  const t = START_DATE + Math.floor(rand() * (END_DATE - START_DATE))
  return new Date(t).toISOString()
}

function randomMsPlayed(avgMs) {
  // Plausible distribution around avgMs, mostly "completed" plays + occasional short/skip.
  const r = rand()
  if (r < 0.10) return 30_000 + Math.floor(rand() * 60_000)           // brief but valid
  if (r < 0.15) return 60_000 + Math.floor(rand() * 60_000)           // mid
  const jitter = 0.85 + rand() * 0.3                                  // 0.85–1.15x
  return Math.max(30_000, Math.round(avgMs * jitter))
}

async function loadEntries(zipPath) {
  if (!existsSync(zipPath)) {
    throw new Error(`Source zip not found at ${zipPath}`)
  }
  console.log(`[sample] reading ${zipPath}`)
  const buf = await readFile(zipPath)
  const zip = await JSZip.loadAsync(buf)

  const entries = []
  const files = Object.values(zip.files).filter(f => !f.dir && /\.json$/i.test(f.name))
  for (const f of files) {
    try {
      const txt = await f.async('string')
      const arr = JSON.parse(txt)
      if (Array.isArray(arr)) entries.push(...arr)
    } catch (err) {
      console.warn(`[sample] skipping ${f.name}: ${err.message}`)
    }
  }
  console.log(`[sample] loaded ${entries.length} raw entries`)
  return entries
}

function rankEntities(entries) {
  const tracks  = new Map()
  const artists = new Map()
  const albums  = new Map()

  for (const e of entries) {
    if (e.ms_played < 30_000) continue
    const tName  = e.master_metadata_track_name
    const aName  = e.master_metadata_album_artist_name
    const albName= e.master_metadata_album_album_name
    if (!tName) continue

    const trackKey = `${aName ?? ''}__${tName}`
    const cur = tracks.get(trackKey) ?? {
      trackName: tName,
      artistName: aName ?? '',
      albumName: albName ?? '',
      uri: e.spotify_track_uri ?? null,
      plays: 0,
      msTotal: 0,
    }
    cur.plays += 1
    cur.msTotal += e.ms_played
    if (!cur.uri && e.spotify_track_uri) cur.uri = e.spotify_track_uri
    tracks.set(trackKey, cur)

    if (aName) {
      const ar = artists.get(aName) ?? { name: aName, plays: 0, msTotal: 0 }
      ar.plays += 1
      ar.msTotal += e.ms_played
      artists.set(aName, ar)
    }

    if (aName && albName) {
      const k = `${aName}__${albName}`
      const al = albums.get(k) ?? { name: albName, artist: aName, plays: 0, msTotal: 0 }
      al.plays += 1
      al.msTotal += e.ms_played
      albums.set(k, al)
    }
  }

  const topTracks  = [...tracks.values()].sort((a, b) => b.plays - a.plays).slice(0, TOP_N)
  const topArtists = [...artists.values()].sort((a, b) => b.plays - a.plays).slice(0, TOP_N)
  const topAlbums  = [...albums.values()].sort((a, b) => b.plays - a.plays).slice(0, TOP_N)

  return { topTracks, topArtists, topAlbums, allTracks: tracks }
}

function pickFillerTrack(allTracksMap, artistName, usedKeys) {
  for (const [k, t] of allTracksMap) {
    if (usedKeys.has(k)) continue
    if (t.artistName === artistName) { usedKeys.add(k); return t }
  }
  return null
}

function pickFillerAlbumTrack(allTracksMap, artistName, albumName, usedKeys) {
  for (const [k, t] of allTracksMap) {
    if (usedKeys.has(k)) continue
    if (t.artistName === artistName && t.albumName === albumName) {
      usedKeys.add(k); return t
    }
  }
  return null
}

function synthEntry(track, rng) {
  void rng
  const avgMs = Math.max(30_000, Math.round(track.msTotal / Math.max(1, track.plays)))
  const ms    = randomMsPlayed(avgMs)
  return {
    ts: randomTs(),
    platform: pick(ANON_PLATFORMS),
    ms_played: ms,
    master_metadata_track_name:        track.trackName,
    master_metadata_album_artist_name: track.artistName || null,
    master_metadata_album_album_name:  track.albumName  || null,
    spotify_track_uri: track.uri || null,
    episode_name:      null,
    episode_show_name: null,
    spotify_episode_uri: null,
    reason_start: pick(ANON_REASONS_START),
    reason_end:   pick(ANON_REASONS_END),
    shuffle:  rand() < 0.35,
    skipped:  rand() < 0.12,
    offline:  rand() < 0.05,
    incognito_mode: false,
  }
}

function buildSyntheticEntries(ranked) {
  const { topTracks, topArtists, topAlbums, allTracks } = ranked
  const result = []
  const usedArtistFill = new Set()
  const usedAlbumFill  = new Set()

  // Tracks: up to MAX_PLAYS_PER_TRACK synthetic plays each, preserving relative order.
  for (const t of topTracks) {
    const plays = Math.min(MAX_PLAYS_PER_TRACK, Math.max(3, t.plays))
    for (let i = 0; i < plays; i++) {
      result.push(synthEntry(t))
    }
  }

  // For each top artist not already covered by a top track, fabricate ~20 plays from one of their tracks.
  const topTrackArtists = new Set(topTracks.map(t => t.artistName))
  for (const a of topArtists) {
    if (topTrackArtists.has(a.name)) continue
    const filler = pickFillerTrack(allTracks, a.name, usedArtistFill)
    if (!filler) continue
    const n = Math.min(MAX_PLAYS_PER_TRACK, Math.max(3, Math.round(a.plays * 0.25)))
    for (let i = 0; i < n; i++) result.push(synthEntry(filler))
  }

  // For each top album not already covered, add a track from that album.
  const topAlbumKeys = new Set(topTracks.map(t => `${t.artistName}__${t.albumName}`))
  for (const al of topAlbums) {
    const key = `${al.artist}__${al.name}`
    if (topAlbumKeys.has(key)) continue
    const filler = pickFillerAlbumTrack(allTracks, al.artist, al.name, usedAlbumFill)
    if (!filler) continue
    const n = Math.min(MAX_PLAYS_PER_TRACK, Math.max(3, Math.round(al.plays * 0.25)))
    for (let i = 0; i < n; i++) result.push(synthEntry(filler))
  }

  // Sort chronologically for realism.
  result.sort((a, b) => a.ts.localeCompare(b.ts))
  return result
}

async function writeZip(entries, outPath) {
  const zip = new JSZip()
  const folder = zip.folder('Spotify Extended Streaming History')

  // Chunk across years so the folder looks like a real export.
  const byYear = new Map()
  for (const e of entries) {
    const y = e.ts.slice(0, 4)
    const arr = byYear.get(y) ?? []
    arr.push(e)
    byYear.set(y, arr)
  }

  let part = 0
  for (const [year, arr] of [...byYear.entries()].sort()) {
    folder.file(
      `Streaming_History_Audio_${year}_${part++}.json`,
      JSON.stringify(arr, null, 2),
    )
  }

  const buf = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE', compressionOptions: { level: 6 } })
  await writeFile(outPath, buf)
  console.log(`[sample] wrote ${outPath} (${(buf.length / 1024 / 1024).toFixed(2)} MB, ${entries.length} entries)`)
}

async function main() {
  const entries = await loadEntries(INPUT_ZIP)
  const ranked = rankEntities(entries)
  console.log(`[sample] top tracks: ${ranked.topTracks.length} · top artists: ${ranked.topArtists.length} · top albums: ${ranked.topAlbums.length}`)

  const synth = buildSyntheticEntries(ranked)
  console.log(`[sample] synthesized ${synth.length} entries`)

  await writeZip(synth, OUTPUT_ZIP)
  console.log('[sample] done.')
}

main().catch(err => {
  console.error('[sample] failed:', err)
  process.exit(1)
})
