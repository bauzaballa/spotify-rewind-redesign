import { normalizeStr } from './normalize'

export function buildSearchIndex(processed) {
  const items = []

  for (const [name, a] of processed.artists) {
    items.push({
      type:     'artist',
      id:       name,
      name,
      sub:      null,
      nameNorm: normalizeStr(name),
      subNorm:  '',
      plays:    a.plays,
      msTotal:  a.msTotal,
    })
  }

  for (const [uri, t] of processed.tracks) {
    const sub = t.artist && t.album
      ? `${t.artist} · ${t.album}`
      : (t.artist || t.album || null)
    items.push({
      type:     'track',
      id:       uri,
      name:     t.name,
      sub,
      nameNorm: normalizeStr(t.name),
      subNorm:  normalizeStr(sub ?? ''),
      plays:    t.plays,
      msTotal:  t.msTotal,
    })
  }

  for (const [key, alb] of processed.albums) {
    items.push({
      type:     'album',
      id:       key,
      name:     alb.name,
      sub:      alb.artist || null,
      nameNorm: normalizeStr(alb.name),
      subNorm:  normalizeStr(alb.artist ?? ''),
      plays:    alb.plays,
      msTotal:  alb.msTotal,
    })
  }

  return items
}
