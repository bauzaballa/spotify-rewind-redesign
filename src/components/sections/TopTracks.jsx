import { useMemo, useState, useTransition } from 'react'
import { useData } from '../../context/DataContext'
import { msToReadable, formatNumber, formatPercent } from '../../utils/formatters'
import SectionHeader from '../ui/SectionHeader'
import styles from './TopTracks.module.css'

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

export default function TopTracks() {
  const { processed, viewData, fileName } = useData()
  const isDemo = fileName === 'sample_data.json'
  const [isPending, startTransition] = useTransition()
  const [sortBy, setSortBy]   = useState('plays')
  const [sortDir, setSortDir] = useState('desc')
  const [limit, setLimit]     = useState(200)

  function toggleSort(key) {
    if (sortBy === key) setSortDir(d => d === 'desc' ? 'asc' : 'desc')
    else { setSortBy(key); setSortDir('desc') }
  }

  const rows = useMemo(() => {
    if (!viewData) return []
    const mul = sortDir === 'desc' ? -1 : 1
    const sorted = [...viewData.allTracks].sort((a, b) => {
      if (sortBy === 'name')   return mul * a.name.localeCompare(b.name)
      if (sortBy === 'artist') return mul * a.artist.localeCompare(b.artist)
      return mul * (a[sortBy] - b[sortBy])
    })
    return limit === 0 ? sorted : sorted.slice(0, limit)
  }, [viewData, sortBy, sortDir, limit])

  if (!processed || !viewData) return null

  return (
    <div className={styles.root}>
      <SectionHeader title="Top Tracks" subtitle="Las canciones que más escuchaste" />

      <div className={styles.controls}>
        {[
          { key: 'plays',   label: 'Plays'  },
          { key: 'msTotal', label: 'Tiempo' },
          { key: 'skips',   label: 'Skips'  },
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
          aria-label="Cantidad de tracks a mostrar"
        >
          {LIMIT_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>}
        <span className={styles.countLabel}>
          {rows.length}{limit !== 0 && viewData.allTracks.length > limit ? ` de ${formatNumber(viewData.allTracks.length)}` : ''} tracks
        </span>
      </div>
      {(isPending || limit === 0) && <p className={styles.slowHint}>Mostrar todos puede tardar unos segundos según la cantidad de datos.</p>}

      {/* Desktop table */}
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th}>#</th>
              <SortableTh label="Track"   sortKey="name"    currentSort={sortBy} currentDir={sortDir} onSort={toggleSort} />
              <SortableTh label="Artista" sortKey="artist"  currentSort={sortBy} currentDir={sortDir} onSort={toggleSort} />
              <th className={styles.th}>Álbum</th>
              <SortableTh label="Plays"   sortKey="plays"   currentSort={sortBy} currentDir={sortDir} onSort={toggleSort} right />
              <SortableTh label="Tiempo"  sortKey="msTotal" currentSort={sortBy} currentDir={sortDir} onSort={toggleSort} right />
              <SortableTh label="Skips"   sortKey="skips"   currentSort={sortBy} currentDir={sortDir} onSort={toggleSort} right />
            </tr>
          </thead>
          <tbody>
            {rows.map((t, i) => (
              <tr key={t.uri} className={styles.row}>
                <td className={styles.td}><span className={styles.rank}>{i + 1}</span></td>
                <td className={styles.td}><span className={styles.trackName}>{t.name}</span></td>
                <td className={[styles.td, styles.tdMuted].join(' ')}>{t.artist}</td>
                <td className={[styles.td, styles.tdMuted].join(' ')}>{t.album}</td>
                <td className={[styles.td, styles.tdRight].join(' ')}>{formatNumber(t.plays)}</td>
                <td className={[styles.td, styles.tdRight].join(' ')}>{msToReadable(t.msTotal)}</td>
                <td className={[styles.td, styles.tdRight].join(' ')}>
                  {t.plays > 0 ? formatPercent(t.skips / t.plays, 0) : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile card list */}
      <div className={styles.cardList}>
        {rows.map((t, i) => (
          <div key={t.uri} className={styles.trackCard}>
            <span className={styles.trackRank}>{i + 1}</span>
            <div className={styles.trackInfo}>
              <div className={styles.trackNameMobile}>{t.name}</div>
              <div className={styles.trackArtistMobile}>{t.artist}</div>
            </div>
            <div className={styles.trackMeta}>
              <div className={styles.trackTime}>{msToReadable(t.msTotal)}</div>
              <div className={styles.trackStats}>
                {formatNumber(t.plays)} plays · {t.plays > 0 ? formatPercent(t.skips / t.plays, 0) : '—'} skip
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
