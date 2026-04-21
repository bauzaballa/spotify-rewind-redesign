import { useEffect, useState } from 'react'
// eslint-disable-next-line no-unused-vars
import { AnimatePresence, motion } from 'framer-motion'
import { useSearch } from '../../context/SearchContext'
import { normalizeStr } from '../../utils/normalize'
import SearchResultItem from './SearchResultItem'
import styles from './SearchResults.module.css'

const MIN_QUERY = 2

export default function SearchResults() {
  const { query, results, openEntity, clearQuery } = useSearch()
  const [focused, setFocused] = useState(0)
  const q = normalizeStr(query)
  const visible = q.length >= MIN_QUERY

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setFocused(0) }, [query])

  useEffect(() => {
    if (!visible) return
    function onKey(e) {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setFocused(i => Math.min(results.length - 1, i + 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setFocused(i => Math.max(0, i - 1))
      } else if (e.key === 'Enter') {
        if (results[focused]) {
          e.preventDefault()
          openEntity({ type: results[focused].type, id: results[focused].id })
        }
      } else if (e.key === 'Escape') {
        e.preventDefault()
        clearQuery()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [visible, results, focused, openEntity, clearQuery])

  return (
    <AnimatePresence>
      {visible && (
        <motion.aside
          key="search-results"
          className={styles.panel}
          initial={{ x: -8, opacity: 0 }}
          animate={{ x: 0,  opacity: 1 }}
          exit={{ x: -8,    opacity: 0 }}
          transition={{ duration: 0.16, ease: 'easeOut' }}
          id="search-results"
          role="listbox"
          aria-label="Resultados de búsqueda"
        >
          <div className={styles.header}>
            {results.length > 0
              ? `${results.length} ${results.length === 1 ? 'resultado' : 'resultados'}`
              : 'Sin resultados'}
          </div>
          {results.length > 0 ? (
            <div className={styles.list}>
              {results.map((item, i) => (
                <SearchResultItem
                  key={`${item.type}:${item.id}`}
                  item={item}
                  queryNorm={q}
                  focused={i === focused}
                  onMouseEnter={() => setFocused(i)}
                  onClick={() => openEntity({ type: item.type, id: item.id })}
                />
              ))}
            </div>
          ) : (
            <div className={styles.empty}>Sin coincidencias</div>
          )}
        </motion.aside>
      )}
    </AnimatePresence>
  )
}
