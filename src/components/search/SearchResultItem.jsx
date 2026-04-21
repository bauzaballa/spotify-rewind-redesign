import { Disc3, Mic2, Music2 } from 'lucide-react'
import { normalizeStr } from '../../utils/normalize'
import styles from './SearchResultItem.module.css'

const ICONS = {
  artist: Mic2,
  track:  Music2,
  album:  Disc3,
}

function highlight(name, queryNorm) {
  if (!queryNorm) return name
  const hay = normalizeStr(name)
  const idx = hay.indexOf(queryNorm)
  if (idx < 0) return name
  return (
    <>
      {name.slice(0, idx)}
      <mark>{name.slice(idx, idx + queryNorm.length)}</mark>
      {name.slice(idx + queryNorm.length)}
    </>
  )
}

export default function SearchResultItem({ item, queryNorm, focused, onClick, onMouseEnter }) {
  const Icon = ICONS[item.type] ?? Music2
  return (
    <button
      type="button"
      role="option"
      aria-selected={focused}
      className={`${styles.row} ${focused ? styles.focused : ''}`}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
    >
      <span className={styles.iconCell}>
        <Icon size={16} aria-hidden="true" />
      </span>
      <span className={styles.text}>
        <span className={styles.name}>{highlight(item.name, queryNorm)}</span>
        {item.sub && <span className={styles.sub}>{item.sub}</span>}
      </span>
      <span className={styles.count}>{item.plays} pl</span>
    </button>
  )
}
