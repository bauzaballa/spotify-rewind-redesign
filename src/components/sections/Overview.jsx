import { useData } from '../../context/DataContext'
import { msToHours, msToReadable, formatNumber, formatPercent } from '../../utils/formatters'
import SectionHeader from '../ui/SectionHeader'
import Card from '../ui/Card'
import { SkeletonStatCard, SkeletonChartCard } from '../ui/Skeleton'
import BarChartComponent from '../charts/BarChartComponent'
import LineChartComponent from '../charts/LineChartComponent'
import styles from './Overview.module.css'

function OverviewSkeleton() {
  return (
    <div className={styles.root}>
      <SectionHeader title="Overview" subtitle="Procesando tu historial…" />
      <div className={styles.grid4}>
        {[0, 1, 2, 3].map(i => <SkeletonStatCard key={i} />)}
      </div>
      <div className={styles.grid2}>
        <SkeletonChartCard height={80} />
        <SkeletonChartCard height={80} />
      </div>
      <div className={styles.chartsRow}>
        <SkeletonChartCard height={220} />
        <SkeletonChartCard height={220} />
      </div>
    </div>
  )
}

export default function Overview() {
  const { processed, viewData, loading } = useData()

  if (loading && !processed) return <OverviewSkeleton />
  if (!processed || !viewData) return null

  const { stats } = processed
  const { yearData, monthData } = viewData

  return (
    <div className={styles.root}>
      <SectionHeader title="Overview" subtitle="Tu historial completo de Spotify" />

      <div className={styles.scrollArea}>
        <div className={styles.grid4}>
          <Card variant="stat">
            <p className={styles.statLabel}>Horas escuchadas</p>
            <p className={styles.statValue}>{formatNumber(msToHours(stats.totalMs))}</p>
            <p className={styles.statSub}>{msToReadable(stats.totalMs)}</p>
          </Card>
          <Card variant="stat">
            <p className={styles.statLabel}>Tracks únicos</p>
            <p className={styles.statValue}>{formatNumber(stats.uniqueTracks)}</p>
            <p className={styles.statSub}>{formatNumber(stats.totalPlays)} reproducciones</p>
          </Card>
          <Card variant="stat">
            <p className={styles.statLabel}>Artistas únicos</p>
            <p className={styles.statValue}>{formatNumber(stats.uniqueArtists)}</p>
            <p className={styles.statSub}>{formatNumber(stats.uniqueAlbums)} álbumes</p>
          </Card>
          <Card variant="stat">
            <p className={styles.statLabel}>Skipped</p>
            <p className={styles.statValue}>{formatPercent(stats.skippedRatio, 0)}</p>
            <p className={styles.statSub}>Mejor año: {stats.bestYear ?? '—'}</p>
          </Card>
        </div>

        <div className={styles.grid2}>
          {stats.topTrack && (
            <Card variant="highlight">
              <p className={styles.highlightLabel}># 1 Track</p>
              <p className={styles.highlightName}>{stats.topTrack.name}</p>
              <p className={styles.highlightSub}>{stats.topTrack.artist}</p>
              <p className={styles.highlightTime}>{msToReadable(stats.topTrack.msTotal)}</p>
            </Card>
          )}
          {stats.topArtist && (
            <Card variant="highlight">
              <p className={styles.highlightLabel}># 1 Artista</p>
              <p className={styles.highlightName}>{stats.topArtist.name}</p>
              <p className={styles.highlightSub}>{msToReadable(stats.topArtist.msTotal)} escuchadas</p>
            </Card>
          )}
        </div>

        <div className={styles.chartsRow}>
          <Card className={styles.chartCard}>
            <p className={styles.chartTitle}>Reproducciones por año</p>
            <div className={styles.chartFill}>
              <BarChartComponent
                data={yearData}
                xKey="year"
                yKey="plays"
                formatter={formatNumber}
                height="100%"
              />
            </div>
          </Card>
          <Card className={styles.chartCard}>
            <p className={styles.chartTitle}>Minutos por mes (últimos 24)</p>
            <div className={styles.chartFill}>
              <LineChartComponent
                data={monthData}
                xKey="month"
                yKey="minutos"
                formatter={(v) => `${formatNumber(v)} min`}
                height="100%"
              />
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
