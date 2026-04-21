import { useMemo, useState, useTransition } from 'react'
import { useData } from '../../context/DataContext'
import { msToReadable, formatNumber } from '../../utils/formatters'
import SectionHeader from '../ui/SectionHeader'
import styles from './TopAlbums.module.css'

const LIMIT_OPTIONS = [
  { value: 50,  label: 'Top 50'  },
  { value: 100, label: 'Top 100' },
  { value: 200, label: 'Top 200' },
  { value: 500, label: 'Top 500' },
  { value: 0,   label: 'Todos'   },
]

function SortableTh({ label, sortKey, currentSort, currentDir, onSort, right }) {
  const isActive = currentSort === sortKey
  return (
    <th
      className={[
        styles.th,
        styles.thSortable,
        right ? styles.thRight : '',
        isActive ? styles.thActive : '',
      ].filter(Boolean).join(' ')}
      onClick={() => onSort(sortKey)}
    >
      {label}
      <span className={styles.sortArrow}>
        {isActive ? (currentDir === 'desc' ? '▼' : '▲') : '⇅'}
      </span>
    </th>
  )
}

export default function TopAlbums() {
  const { processed, viewData, fileName } = useData()
  const isDemo = fileName === 'sample_data.json'
  const [isPending, startTransition] = useTransition()
  const [sortBy, setSortBy]   = useState('msTotal')
  const [sortDir, setSortDir] = useState('desc')
  const [limit, setLimit]     = useState(200)

  function toggleSort(key) {
    if (sortBy === key) setSortDir(d => d === 'desc' ? 'asc' : 'desc')
    else { setSortBy(key); setSortDir('desc') }
  }

  const albums = useMemo(() => {
    if (!viewData) return []
    const mul = sortDir === 'desc' ? -1 : 1
    const sorted = [...viewData.allAlbums].sort((a, b) => {
      if (sortBy === 'name')       return mul * a.name.localeCompare(b.name)
      if (sortBy === 'artist')     return mul * a.artist.localeCompare(b.artist)
      if (sortBy === 'trackCount') return mul * (a.trackCount - b.trackCount)
      return mul * (a[sortBy] - b[sortBy])
    })
    return limit === 0 ? sorted : sorted.slice(0, limit)
  }, [viewData, sortBy, sortDir, limit])

  if (!processed || !viewData) return null

  const totalAlbums = viewData.allAlbums.length

  return (
    <div className={styles.root}>
      <SectionHeader title="Top Albums" subtitle="Los álbumes que más te acompañaron" />

      <div className={styles.controls}>
        {[
          { key: 'msTotal', label: 'Tiempo' },
          { key: 'plays',   label: 'Plays'  },
        ].map(({ key, label }) => (
          <button
            key={key}
            type="button"
            className={[styles.sortPill, sortBy === key ? styles.sortPillActive : ''].filter(Boolean).join(' ')}
            onClick={() => toggleSort(key)}
          >
            {label}
            {sortBy === key && <span className={styles.sortPillArrow}>{sortDir === 'desc' ? '↓' : '↑'}</span>}
          </button>
        ))}
        {!isDemo && <select
          className={styles.select}
          value={limit}
          onChange={e => { const v = Number(e.target.value); startTransition(() => setLimit(v)) }}
          aria-label="Cantidad de álbumes a mostrar"
        >
          {LIMIT_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>}
        <span className={styles.countLabel}>{albums.length}{limit !== 0 && totalAlbums > limit ? ` de ${formatNumber(totalAlbums)}` : ''} álbumes</span>
      </div>
      {(isPending || limit === 0) && <p className={styles.slowHint}>Mostrar todos puede tardar unos segundos según la cantidad de datos.</p>}

      {/* Desktop table */}
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th}>#</th>
              <SortableTh label="Álbum"   sortKey="name"       currentSort={sortBy} currentDir={sortDir} onSort={toggleSort} />
              <SortableTh label="Artista" sortKey="artist"     currentSort={sortBy} currentDir={sortDir} onSort={toggleSort} />
              <SortableTh label="Plays"   sortKey="plays"      currentSort={sortBy} currentDir={sortDir} onSort={toggleSort} right />
              <SortableTh label="Tiempo"  sortKey="msTotal"    currentSort={sortBy} currentDir={sortDir} onSort={toggleSort} right />
              <SortableTh label="Tracks"  sortKey="trackCount" currentSort={sortBy} currentDir={sortDir} onSort={toggleSort} right />
            </tr>
          </thead>
          <tbody>
            {albums.map((a, i) => (
              <tr key={a.key} className={styles.row}>
                <td className={styles.td}><span className={styles.rank}>{i + 1}</span></td>
                <td className={styles.td}><span className={styles.albumName}>{a.name}</span></td>
                <td className={[styles.td, styles.tdMuted].join(' ')}>{a.artist}</td>
                <td className={[styles.td, styles.tdRight].join(' ')}>{formatNumber(a.plays)}</td>
                <td className={[styles.td, styles.tdRight].join(' ')}>{msToReadable(a.msTotal)}</td>
                <td className={[styles.td, styles.tdRight].join(' ')}>{formatNumber(a.trackCount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile card list */}
      <div className={styles.cardList}>
        {albums.map((a, i) => (
          <div key={a.key} className={styles.albumCard}>
            <span className={styles.albumRank}>{i + 1}</span>
            <div className={styles.albumInfo}>
              <div className={styles.albumNameMobile}>{a.name}</div>
              <div className={styles.albumArtistMobile}>{a.artist}</div>
            </div>
            <div className={styles.albumMeta}>
              <div className={styles.albumTime}>{msToReadable(a.msTotal)}</div>
              <div className={styles.albumStats}>
                {formatNumber(a.plays)} plays · {formatNumber(a.trackCount)} tracks
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
