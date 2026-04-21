export const MATCH_EXACT        = 10_000
export const MATCH_STARTS_WITH  = 5_000
export const MATCH_WORD_START   = 2_500
export const MATCH_CONTAINS     = 1_000
export const MATCH_SUB_STARTS   = 500
export const MATCH_SUB_CONTAINS = 200

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function wordStart(hay, needle) {
  return new RegExp(`\\b${escapeRegex(needle)}`).test(hay)
}

export function scoreMatch(queryNorm, item) {
  if (!queryNorm) return 0
  const n = item.nameNorm
  const s = item.subNorm

  let base = 0
  if (n === queryNorm)                      base = MATCH_EXACT
  else if (n.startsWith(queryNorm))         base = MATCH_STARTS_WITH
  else if (wordStart(n, queryNorm))         base = MATCH_WORD_START
  else if (n.includes(queryNorm))           base = MATCH_CONTAINS
  else if (s && s.startsWith(queryNorm))    base = MATCH_SUB_STARTS
  else if (s && s.includes(queryNorm))      base = MATCH_SUB_CONTAINS
  else return 0

  const activity  = Math.log10((item.plays ?? 0) + 1) * 50
  const typeBoost = item.type === 'artist' ? 30 : item.type === 'album' ? 15 : 0
  return base + activity + typeBoost
}
