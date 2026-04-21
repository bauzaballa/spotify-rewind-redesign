import { useMemo, useState } from 'react'
import { X } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { useData } from '../../context/DataContext'
import { msToReadable, formatNumber } from '../../utils/formatters'
import SectionHeader from '../ui/SectionHeader'
import Card from '../ui/Card'
import BarChartComponent from '../charts/BarChartComponent'
import styles from './TopArtists.module.css'

const SORT_OPTIONS = [
  { key: 'msTotal',      label: 'Tiempo'       },
  { key: 'plays',        label: 'Plays'        },
  { key: 'uniqueTracks', label: 'Tracks únicos'},
]

const LIMIT_OPTIONS = [
  { value: 50,  label: 'Top 50'  },
  { value: 100, label: 'Top 100' },
  { value: 200, label: 'Top 200' },
  { value: 500, label: 'Top 500' },
  { value: 0,   label: 'Todos'   },
]

function ArtistDetail({ selected, topTracks, onClose, isMobile }) {
  if (!selected) return null

  const content = (
    <>
      <div className={styles.panelHeader}>
        <div>
          <p className={styles.panelName}>{selected.name}</p>
          <p className={styles.panelSub}>
            {msToReadable(selected.msTotal)} · {formatNumber(selected.plays)} plays · {selected.uniqueTracks} tracks
          </p>
        </div>
        <button className={styles.closeBtn} onClick={onClose} type="button">
          <X size={18} />
        </button>
      </div>
      <div>
        <p className={styles.sectionLabel}>Top 5 tracks</p>
        <div className={styles.trackList}>
          {topTracks.map(t => (
            <div key={t.name} className={styles.trackItem}>
              <span className={styles.trackItemName}>{t.name}</span>
              <span className={styles.trackItemTime}>{msToReadable(t.msTotal)}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  )

  if (isMobile) {
    return (
      <>
        <motion.div
          style={{ position: 'fixed', inset: 0, zIndex: 99, background: 'rgba(0,0,0,0.45)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        />
        <motion.div
          className={styles.bottomSheet}
          initial={{ y: 300 }}
          animate={{ y: 0 }}
          exit={{ y: 300 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
        >
          <div className={styles.bottomSheetHandle}>
            <div className={styles.handle} />
          </div>
          {content}
        </motion.div>
      </>
    )
  }

  return (
    <>
      <div
        style={{ position: 'fixed', inset: 0, zIndex: 99, background: 'rgba(0,0,0,0.35)' }}
        onClick={onClose}
      />
      <aside className={styles.panel}>{content}</aside>
    </>
  )
}

export default function TopArtists() {
  const { processed, viewData, fileName } = useData()
  const isDemo = fileName === 'my_spotify_data.zip'
  const [selected, setSelected] = useState(null)
  const [sortBy, setSortBy]     = useState('msTotal')
  const [sortDir, setSortDir]   = useState('desc')
  const [limit, setLimit]       = useState(200)

  function toggleSort(key) {
    if (sortBy === key) setSortDir(d => d === 'desc' ? 'asc' : 'desc')
    else { setSortBy(key); setSortDir('desc') }
  }

  const artists = useMemo(() => {
    if (!viewData) return []
    const mul = sortDir === 'desc' ? -1 : 1
    const sorted = [...viewData.allArtists].sort((a, b) => {
      if (sortBy === 'uniqueTracks') return mul * (a.uniqueTracks - b.uniqueTracks)
      return mul * (a[sortBy] - b[sortBy])
    })
    return limit === 0 ? sorted : sorted.slice(0, limit)
  }, [viewData, sortBy, sortDir, limit])

  const artistTopTracks = useMemo(() => {
    if (!selected || !viewData) return []
    return viewData.allTracks
      .filter(t => t.artist === selected.name)
      .sort((a, b) => b.msTotal - a.msTotal)
      .slice(0, 5)
  }, [selected, viewData])

  if (!processed || !viewData) return null

  const chartData = viewData.topArtistsChart

  return (
    <div className={styles.root}>
      <SectionHeader title="Top Artists" subtitle="Los artistas que dominaron tu historial" />

      <div className={styles.layout}>
        <Card style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <p className={styles.chartTitle}>Top 15 por horas</p>
          <div style={{ flex: 1, minHeight: 320 }}>
            <BarChartComponent
              data={chartData}
              xKey="name"
              yKey="value"
              formatter={(v) => `${v}h`}
              height="100%"
              horizontal
            />
          </div>
        </Card>

        <div className={styles.listCol}>
          <p className={styles.chartTitle}>
            {artists.length}{limit !== 0 && viewData.allArtists.length > limit ? ` de ${formatNumber(viewData.allArtists.length)}` : ''} artistas
          </p>
          <div className={styles.controls}>
            {SORT_OPTIONS.map(opt => (
              <button
                key={opt.key}
                type="button"
                className={[styles.sortBtn, sortBy === opt.key ? styles.sortBtnActive : ''].join(' ')}
                onClick={() => toggleSort(opt.key)}
              >
                {opt.label}
                {sortBy === opt.key && (
                  <span style={{ marginLeft: '0.25rem', fontSize: '0.6rem' }}>
                    {sortDir === 'desc' ? '▼' : '▲'}
                  </span>
                )}
              </button>
            ))}
            {!isDemo && <select
              className={styles.limitSelect}
              value={limit}
              onChange={e => setLimit(Number(e.target.value))}
              aria-label="Cantidad de artistas a mostrar"
            >
              {LIMIT_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>}
          </div>
          <div className={styles.listScroll}>
            {artists.map((a, i) => (
              <div
                key={a.name}
                className={styles.artistCard}
                onClick={() => setSelected(a)}
              >
                <span className={styles.artistRank}>{i + 1}</span>
                <span className={styles.artistName}>{a.name}</span>
                <div className={styles.artistMeta}>
                  <div>{msToReadable(a.msTotal)}</div>
                  <div className={styles.artistMetaSub}>
                    {formatNumber(a.plays)} plays · {a.uniqueTracks} tracks
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {selected && (
          <ArtistDetail
            selected={selected}
            topTracks={artistTopTracks}
            onClose={() => setSelected(null)}
            isMobile={window.matchMedia('(max-width: 640px)').matches}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
