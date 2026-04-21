import { useMemo, useState } from 'react'
import { Radio } from 'lucide-react'
import { useData } from '../../context/DataContext'
import { msToReadable, formatNumber } from '../../utils/formatters'
import SectionHeader from '../ui/SectionHeader'
import Card from '../ui/Card'
import BarChartComponent from '../charts/BarChartComponent'
import styles from './Podcasts.module.css'

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

export default function Podcasts() {
  const { processed, viewData, fileName } = useData()
  const isDemo = fileName === 'my_spotify_data.zip'
  const [sortBy, setSortBy]   = useState('msTotal')
  const [sortDir, setSortDir] = useState('desc')
  const [limit, setLimit]     = useState(200)

  function toggleSort(key) {
    if (sortBy === key) setSortDir(d => d === 'desc' ? 'asc' : 'desc')
    else { setSortBy(key); setSortDir('desc') }
  }

  const shows = useMemo(() => {
    if (!viewData) return []
    const mul = sortDir === 'desc' ? -1 : 1
    const sorted = [...viewData.allShows].sort((a, b) => {
      if (sortBy === 'name')         return mul * a.name.localeCompare(b.name)
      if (sortBy === 'episodeCount') return mul * (a.episodeCount - b.episodeCount)
      return mul * (a[sortBy] - b[sortBy])
    })
    return limit === 0 ? sorted : sorted.slice(0, limit)
  }, [viewData, sortBy, sortDir, limit])

  if (!processed || !viewData) return null

  const chartData = viewData.topShowsChart
  const totalShows = viewData.allShows.length

  if (totalShows === 0) {
    return (
      <div className={styles.root}>
        <SectionHeader title="Podcasts" subtitle="Shows y episodios escuchados" />
        <Card>
          <div className={styles.emptyWrap}>
            <Radio size={32} />
            <span>No hay podcasts en tu historial</span>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className={styles.root}>
      <SectionHeader
        title="Podcasts"
        subtitle={`${formatNumber(totalShows)} shows · ${formatNumber(viewData.allShows.reduce((acc, s) => acc + s.episodeCount, 0))} episodios únicos`}
      />

      <div className={styles.layout}>
        <Card>
          <p className={styles.chartTitle}>Top 10 shows por horas</p>
          <BarChartComponent
            data={chartData}
            xKey="name"
            yKey="value"
            color="var(--copperwood)"
            formatter={(v) => `${v}h`}
            height={300}
            horizontal
          />
        </Card>

        <div className={styles.listCol}>
          <div className={styles.controls}>
            {!isDemo && <select
              className={styles.select}
              value={limit}
              onChange={e => setLimit(Number(e.target.value))}
              aria-label="Cantidad de shows a mostrar"
            >
              {LIMIT_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>}
            <span className={styles.countLabel}>
              {shows.length}{limit !== 0 && totalShows > limit ? ` de ${formatNumber(totalShows)}` : ''} shows
            </span>
          </div>

          {/* Desktop table */}
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.th}>#</th>
                  <SortableTh label="Show"      sortKey="name"         currentSort={sortBy} currentDir={sortDir} onSort={toggleSort} />
                  <SortableTh label="Episodios" sortKey="episodeCount" currentSort={sortBy} currentDir={sortDir} onSort={toggleSort} right />
                  <SortableTh label="Plays"     sortKey="plays"        currentSort={sortBy} currentDir={sortDir} onSort={toggleSort} right />
                  <SortableTh label="Tiempo"    sortKey="msTotal"      currentSort={sortBy} currentDir={sortDir} onSort={toggleSort} right />
                </tr>
              </thead>
              <tbody>
                {shows.map((show, i) => (
                  <tr key={show.name} className={styles.row}>
                    <td className={styles.td}><span className={styles.rank}>{i + 1}</span></td>
                    <td className={styles.td}><span className={styles.showName}>{show.name}</span></td>
                    <td className={[styles.td, styles.tdRight].join(' ')}>{formatNumber(show.episodeCount)}</td>
                    <td className={[styles.td, styles.tdRight].join(' ')}>{formatNumber(show.plays)}</td>
                    <td className={[styles.td, styles.tdRight].join(' ')}>{msToReadable(show.msTotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile card list */}
          <div className={styles.cardList}>
            {shows.map((show, i) => (
              <div key={show.name} className={styles.showCard}>
                <span className={styles.showRank}>{i + 1}</span>
                <div className={styles.showInfo}>
                  <div className={styles.showNameMobile}>{show.name}</div>
                </div>
                <div className={styles.showMeta}>
                  <div className={styles.showTime}>{msToReadable(show.msTotal)}</div>
                  <div className={styles.showStats}>
                    {formatNumber(show.plays)} plays · {formatNumber(show.episodeCount)} ep.
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
