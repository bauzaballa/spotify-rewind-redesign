import { useState } from 'react'
import { useData } from '../../context/DataContext'
import { formatNumber, formatPercent } from '../../utils/formatters'
import SectionHeader from '../ui/SectionHeader'
import Card from '../ui/Card'
import BarChartComponent from '../charts/BarChartComponent'
import ActivityHeatmap from '../charts/ActivityHeatmap'
import styles from './Mood.module.css'

const DAY_NAMES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
export default function Mood() {
  const { processed, viewData } = useData()
  const [selectedYear, setSelectedYear] = useState(null)

  if (!processed || !viewData) return null

  const { moodStats, byDay } = processed
  const { skipRateByHour: skipData, availableYears } = viewData
  const activeYear = selectedYear ?? availableYears[availableYears.length - 1] ?? null

  return (
    <div className={styles.root}>
      <SectionHeader title="Mood" subtitle="Cómo escuchás" />
      <div className={styles.scrollArea}>

        <div className={styles.statCards}>
          <Card variant="stat">
            <p className={styles.statLabel}>Hora pico</p>
            <p className={styles.statValue}>{moodStats.peakHour}:00</p>
            <p className={styles.statSub}>más reproducciones</p>
          </Card>
          <Card variant="stat">
            <p className={styles.statLabel}>Día más activo</p>
            <p className={styles.statValue}>{DAY_NAMES[moodStats.peakDay]}</p>
            <p className={styles.statSub}>promedio histórico</p>
          </Card>
          <Card variant="stat">
            <p className={styles.statLabel}>Escucha diaria</p>
            <p className={styles.statValue}>{moodStats.medianSessionMinutes} min</p>
            <p className={styles.statSub}>mediana por día</p>
          </Card>
        </div>

        <Card>
          <p className={styles.chartTitle}>Skip rate por hora</p>
          <BarChartComponent
            data={skipData}
            xKey="hora"
            yKey="skip"
            formatter={v => `${v}%`}
            height={180}
          />
        </Card>

        <div className={styles.heatmapRow}>
          <Card className={styles.heatmapCard}>
            <div className={styles.heatmapHeader}>
              <p className={styles.chartTitle}>Intensidad de escucha</p>
              <select
                className={styles.yearSelect}
                value={activeYear ?? ''}
                onChange={e => setSelectedYear(e.target.value)}
              >
                {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <ActivityHeatmap
              byDay={byDay}
              availableYears={availableYears}
              selectedYear={activeYear}
              onYearChange={setSelectedYear}
            />
          </Card>
          <div className={styles.streakCards}>
            <Card variant="stat">
              <p className={styles.statLabel}>Racha actual</p>
              <p className={styles.statValue}>{formatNumber(moodStats.currentStreak)}</p>
              <p className={styles.statSub}>días seguidos</p>
            </Card>
            <Card variant="stat">
              <p className={styles.statLabel}>Racha más larga</p>
              <p className={styles.statValue}>{formatNumber(moodStats.longestStreak)}</p>
              <p className={styles.statSub}>
                {moodStats.longestStreakStart
                  ? `${moodStats.longestStreakStart.slice(0, 7)} — ${moodStats.longestStreakEnd.slice(0, 7)}`
                  : '—'}
              </p>
            </Card>
          </div>
        </div>

      </div>
    </div>
  )
}
