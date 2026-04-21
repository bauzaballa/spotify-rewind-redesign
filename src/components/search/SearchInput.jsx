import { useEffect, useRef, useState } from 'react'
import { Search, X } from 'lucide-react'
import { useSearch } from '../../context/SearchContext'
import styles from './SearchInput.module.css'

const DEBOUNCE_MS = 120

export default function SearchInput() {
  const { query, setQuery, clearQuery } = useSearch()
  const [local, setLocal] = useState(query)
  const inputRef = useRef(null)
  const timerRef = useRef(null)

  useEffect(() => {
    setLocal(query)
  }, [query])

  useEffect(() => {
    function onKey(e) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
        inputRef.current?.select()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  function onChange(e) {
    const v = e.target.value
    setLocal(v)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setQuery(v), DEBOUNCE_MS)
  }

  function onClear() {
    if (timerRef.current) clearTimeout(timerRef.current)
    setLocal('')
    clearQuery()
    inputRef.current?.focus()
  }

  return (
    <div
      className={styles.wrap}
      role="combobox"
      aria-expanded={query.length >= 2}
      aria-controls="search-results"
      aria-haspopup="listbox"
    >
      <Search size={16} className={styles.icon} aria-hidden="true" />
      <input
        ref={inputRef}
        className={styles.input}
        type="text"
        value={local}
        onChange={onChange}
        placeholder="Buscar..."
        aria-label="Buscar"
      />
      {local.length > 0 && (
        <button type="button" className={styles.clear} onClick={onClear} aria-label="Limpiar búsqueda">
          <X size={14} />
        </button>
      )}
    </div>
  )
}
