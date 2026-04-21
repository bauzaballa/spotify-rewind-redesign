import { Shuffle, SkipForward, WifiOff, CheckCircle } from 'lucide-react'
import { useData } from '../../context/DataContext'
import { formatPercent } from '../../utils/formatters'
import SectionHeader from '../ui/SectionHeader'
import Card from '../ui/Card'
import styles from './Habits.module.css'

export default function Habits() {
  const { processed, viewData } = useData()

  if (!processed || !viewData) return null

  const { stats } = processed
  const { reasonEndData, reasonStartData, mostSkipped } = viewData
  const completedRatio = 1 - stats.skippedRatio

  return (
    <div className={styles.root}>
      <SectionHeader title="Habits" subtitle="Tus patrones de escucha" />

      <div className={styles.scrollArea}>
        <div className={styles.habitCards}>
          <Card variant="stat">
            <div className={styles.habitIconShuffle}>
              <Shuffle size={20} />
            </div>
            <p className={styles.habitLabel}>Shuffle</p>
            <p className={styles.habitValue}>{formatPercent(stats.shuffleRatio, 0)}</p>
            <p className={styles.habitSub}>de las reproducciones</p>
          </Card>
          <Card variant="stat">
            <div className={styles.habitIconSkip}>
              <SkipForward size={20} />
            </div>
            <p className={styles.habitLabel}>Skip rate</p>
            <p className={styles.habitValue}>{formatPercent(stats.skippedRatio, 0)}</p>
            <p className={styles.habitSub}>tracks saltados</p>
          </Card>
          <Card variant="stat">
            <div className={styles.habitIconOffline}>
              <WifiOff size={20} />
            </div>
            <p className={styles.habitLabel}>Offline</p>
            <p className={styles.habitValue}>{formatPercent(stats.offlineRatio, 0)}</p>
            <p className={styles.habitSub}>sin conexión</p>
          </Card>
          <Card variant="stat">
            <div className={styles.habitIconComplete}>
              <CheckCircle size={20} />
            </div>
            <p className={styles.habitLabel}>Completados</p>
            <p className={styles.habitValue}>{formatPercent(completedRatio, 0)}</p>
            <p className={styles.habitSub}>tracks hasta el final</p>
          </Card>
        </div>

        <div className={styles.row2}>
          <Card>
            <p className={styles.chartTitle}>Por qué terminan las canciones</p>
            {reasonEndData.length === 0 && (
              <p className={[styles.sectionLabel, styles.emptyLabel].join(' ')}>Sin datos</p>
            )}
            {reasonEndData.slice(0, 5).map(item => (
              <div key={item.name} className={styles.startRow}>
                <span className={styles.startLabel}>{item.name}</span>
                <div className={styles.startBarWrap}>
                  <div
                    className={styles.startBar}
                    style={{ width: `${Math.round(item.pct * 100)}%` }}
                  />
                </div>
                <span className={styles.startPct}>{formatPercent(item.pct, 0)}</span>
              </div>
            ))}
          </Card>

          <Card>
            <p className={styles.chartTitle}>Cómo empiezan las canciones</p>
            {reasonStartData.length === 0 && (
              <p className={[styles.sectionLabel, styles.emptyLabel].join(' ')}>Sin datos</p>
            )}
            {reasonStartData.slice(0, 5).map(item => (
              <div key={item.name} className={styles.startRow}>
                <span className={styles.startLabel}>{item.name}</span>
                <div className={styles.startBarWrap}>
                  <div
                    className={styles.startBar}
                    style={{ width: `${Math.round(item.pct * 100)}%` }}
                  />
                </div>
                <span className={styles.startPct}>{formatPercent(item.pct, 0)}</span>
              </div>
            ))}
          </Card>
        </div>

        <div className={styles.row3}>
          <p className={styles.row3Title}>Mayor skip rate</p>
          <div className={styles.skipCards}>
            {mostSkipped.length === 0 && (
              <p className={[styles.sectionLabel, styles.emptyLabel].join(' ')}>
                Insuficientes datos (mín. {MIN_PLAYS} plays)
              </p>
            )}
            {mostSkipped.map((a, i) => (
              <div key={a.name} className={styles.skipCard}>
                <span className={styles.skipCardRank}>#{i + 1}</span>
                <p className={styles.skipCardPct}>{formatPercent(a.skipRate, 0)}</p>
                <p className={styles.skipCardLabel}>skip rate</p>
                <p className={styles.skipCardName}>{a.name}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
