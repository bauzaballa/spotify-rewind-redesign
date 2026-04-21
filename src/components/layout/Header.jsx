import { useState, useRef } from 'react'
import { Menu, Trash2 } from 'lucide-react'
import { useData } from '../../context/DataContext'
import styles from './Header.module.css'

export default function Header({ sectionName, onMenuOpen }) {
  const { fileName, setFileName } = useData()
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')
  const inputRef = useRef(null)

  const startEdit = () => {
    setDraft(fileName ?? '')
    setEditing(true)
    setTimeout(() => inputRef.current?.select(), 0)
  }

  const commit = () => {
    const trimmed = draft.trim()
    if (trimmed) setFileName(trimmed)
    setEditing(false)
  }

  const onKeyDown = (e) => {
    if (e.key === 'Enter') commit()
    if (e.key === 'Escape') setEditing(false)
  }

  const hidden = !fileName && !editing

  return (
    <header className={[styles.header, hidden ? styles.headerHidden : ''].filter(Boolean).join(' ')}>
      <div className={styles.left}>
        <button
          className={styles.menuBtn}
          onClick={onMenuOpen}
          type="button"
          aria-label="Abrir menú"
        >
          <Menu size={20} />
        </button>
        <span className={styles.sectionName}>{sectionName}</span>
      </div>

      <div className={styles.fileInfo}>
        {editing ? (
          <input
            ref={inputRef}
            className={styles.fileNameInput}
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={onKeyDown}
            autoFocus
          />
        ) : (
          <div className={styles.fileNameWrapper}>
            <span
              className={styles.fileName}
              onClick={startEdit}
              title="Clic para editar nombre"
            >
              {fileName ?? 'Datos cargados'}
            </span>
            <button
              type="button"
              className={styles.deleteBtn}
              onClick={() => setFileName(null)}
              aria-label="Borrar nombre"
            >
              <Trash2 size={13} />
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
