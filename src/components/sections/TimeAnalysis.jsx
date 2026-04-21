import { useState } from 'react'
import { useData } from '../../context/DataContext'
import { formatNumber, msToReadable } from '../../utils/formatters'
import SectionHeader from '../ui/SectionHeader'
import Card from '../ui/Card'
import BarChartComponent from '../charts/BarChartComponent'
import ActivityHeatmap from '../charts/ActivityHeatmap'
import styles from './TimeAnalysis.module.css'


export default function TimeAnalysis() {
  const { processed, viewData } = useData()
  const [selectedYear, setSelectedYear] = useState(null)

  if (!processed || !viewData) return null

  const { hourData, dowData, peakHour, peakDow, availableYears } = viewData
  const activeYear = selectedYear ?? availableYears[availableYears.length - 1] ?? null

  return (
    <div className={styles.root}>
      <SectionHeader title="Time Analysis" subtitle="Cuándo y cómo escuchás música" />

      <div className={styles.scrollArea}>
        <div className={styles.statCards}>
          {peakHour && (
            <Card variant="stat">
              <p className={styles.statLabel}>Peak Hour</p>
              <p className={styles.statValue}>{peakHour.label}</p>
              <p className={styles.statSub}>{peakHour.period} · {formatNumber(peakHour.plays)} plays</p>
            </Card>
          )}
          {peakDow && (
            <Card variant="stat">
              <p className={styles.statLabel}>Día favorito</p>
              <p className={styles.statValue}>{peakDow.name.slice(0, 3)}</p>
              <p className={styles.statSub}>{peakDow.name} · {formatNumber(peakDow.plays)} plays</p>
            </Card>
          )}
        </div>

        <Card className={styles.heatmapCard}>
          <div className={styles.heatmapHeader}>
            <p className={styles.chartTitle}>Actividad diaria</p>
            <select
              className={styles.yearSelect}
              value={activeYear ?? ''}
              onChange={e => setSelectedYear(e.target.value)}
            >
              {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <ActivityHeatmap
            byDay={processed.byDay}
            availableYears={availableYears}
            selectedYear={activeYear}
            onYearChange={setSelectedYear}
          />
        </Card>

        <div className={styles.row2}>
          <Card>
            <p className={styles.chartTitle}>Plays por hora del día</p>
            <BarChartComponent
              data={hourData}
              xKey="hora"
              yKey="plays"
              formatter={formatNumber}
              height={220}
            />
          </Card>
          <Card>
            <p className={styles.chartTitle}>Plays por día de la semana</p>
            <BarChartComponent
              data={dowData}
              xKey="día"
              yKey="plays"
              color="var(--accent-hover)"
              formatter={formatNumber}
              height={220}
            />
          </Card>
        </div>
      </div>
    </div>
  )
}
