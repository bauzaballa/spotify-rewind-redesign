import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
// eslint-disable-next-line no-unused-vars
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, Search, X } from 'lucide-react'
import { useSearch } from '../../context/SearchContext'
import { normalizeStr } from '../../utils/normalize'
import SearchResultItem from './SearchResultItem'
import styles from './MobileSearchOverlay.module.css'

const DEBOUNCE_MS = 120
const MIN_QUERY   = 2

export default function MobileSearchOverlay() {
  const {
    mobileSearchOpen, closeMobileSearch,
    query, setQuery, clearQuery,
    results, openEntity,
  } = useSearch()
  const [local, setLocal] = useState(query)
  const [focused, setFocused] = useState(0)
  const inputRef = useRef(null)
  const timerRef = useRef(null)

  useEffect(() => { setLocal(query) }, [query])
  useEffect(() => { setFocused(0) }, [query])

  useEffect(() => {
    if (!mobileSearchOpen) return
    const id = setTimeout(() => inputRef.current?.focus(), 80)
    return () => clearTimeout(id)
  }, [mobileSearchOpen])

  useEffect(() => {
    if (!mobileSearchOpen) return
    function onKey(e) {
      if (e.key === 'Escape') {
        e.preventDefault()
        closeMobileSearch()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [mobileSearchOpen, closeMobileSearch])

  function onChange(e) {
    const v = e.target.value
    setLocal(v)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setQuery(v), DEBOUNCE_MS)
  }

  function onClearLocal() {
    if (timerRef.current) clearTimeout(timerRef.current)
    setLocal('')
    clearQuery()
    inputRef.current?.focus()
  }

  const qNorm = normalizeStr(local)
  const showList = qNorm.length >= MIN_QUERY

  return createPortal(
    <AnimatePresence>
      {mobileSearchOpen && (
        <motion.div
          key="mobile-search"
          className={styles.overlay}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          role="dialog"
          aria-modal="true"
          aria-label="Búsqueda"
        >
          <div className={styles.bar}>
            <button
              type="button"
              className={styles.back}
              onClick={closeMobileSearch}
              aria-label="Cerrar búsqueda"
            >
              <ArrowLeft size={20} />
            </button>
            <div className={styles.inputWrap}>
              <Search size={16} className={styles.inputIcon} aria-hidden="true" />
              <input
                ref={inputRef}
                className={styles.input}
                type="text"
                value={local}
                onChange={onChange}
                placeholder="Buscar..."
                aria-label="Buscar"
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
              />
              {local.length > 0 && (
                <button
                  type="button"
                  className={styles.clear}
                  onClick={onClearLocal}
                  aria-label="Limpiar búsqueda"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          <div className={styles.body}>
            {showList && (
              <>
                <div className={styles.header}>
                  {results.length > 0
                    ? `${results.length} ${results.length === 1 ? 'resultado' : 'resultados'}`
                    : 'Sin resultados'}
                </div>
                {results.length > 0 && (
                  <div className={styles.list} role="listbox" aria-label="Resultados de búsqueda">
                    {results.map((item, i) => (
                      <SearchResultItem
                        key={`${item.type}:${item.id}`}
                        item={item}
                        queryNorm={qNorm}
                        focused={i === focused}
                        onMouseEnter={() => setFocused(i)}
                        onClick={() => openEntity({ type: item.type, id: item.id })}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  )
}
