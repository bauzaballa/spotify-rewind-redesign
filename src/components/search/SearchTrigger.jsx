import { Search } from 'lucide-react'
import styles from './SearchInput.module.css'

export default function SearchTrigger({ onClick }) {
  return (
    <button
      type="button"
      className={`${styles.wrap} ${styles.trigger}`}
      onClick={onClick}
      aria-label="Abrir búsqueda"
    >
      <Search size={16} className={styles.icon} aria-hidden="true" />
      <span className={styles.triggerText}>Buscar...</span>
    </button>
  )
}
