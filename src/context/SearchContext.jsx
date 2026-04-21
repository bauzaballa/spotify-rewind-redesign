/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useData } from './DataContext'
import { normalizeStr } from '../utils/normalize'
import { scoreMatch } from '../utils/scoreMatch'

const SearchContext = createContext(null)

const MAX_RESULTS = 15
const MIN_QUERY   = 2

export function SearchProvider({ children }) {
  const { viewData, raw } = useData()
  const [query, setQuery] = useState('')
  const [activeEntity, setActiveEntity] = useState(null)
  const cacheRef = useRef(new Map())

  useEffect(() => {
    cacheRef.current.clear()
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setActiveEntity(null)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setQuery('')
  }, [raw])

  const results = useMemo(() => {
    const index = viewData?.searchIndex
    if (!index) return []
    const q = normalizeStr(query)
    if (q.length < MIN_QUERY) return []

    const scored = []
    for (const item of index) {
      const s = scoreMatch(q, item)
      if (s > 0) scored.push({ item, score: s })
    }
    scored.sort((a, b) => b.score - a.score)
    return scored.slice(0, MAX_RESULTS).map(x => x.item)
  }, [viewData, query])

  const openEntity  = useCallback((entity) => setActiveEntity(entity), [])
  const closeEntity = useCallback(()       => setActiveEntity(null),   [])
  const clearQuery  = useCallback(()       => setQuery(''),            [])

  const value = useMemo(() => ({
    query, setQuery, clearQuery,
    results,
    activeEntity, openEntity, closeEntity,
    cacheRef,
  }), [query, clearQuery, results, activeEntity, openEntity, closeEntity])

  return <SearchContext.Provider value={value}>{children}</SearchContext.Provider>
}

export function useSearch() {
  const ctx = useContext(SearchContext)
  if (!ctx) throw new Error('useSearch must be used inside SearchProvider')
  return ctx
}
