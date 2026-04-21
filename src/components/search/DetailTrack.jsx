import MiniTimeline from './MiniTimeline'
import MiniHeatmap from './MiniHeatmap'
import DetailTile from './DetailTile'
import { DOW_FULL, formatDate, formatMs, formatPct } from './detail-utils'
import styles from './Detail.module.css'

export default function DetailTrack({ item, detail }) {
  return (
    <div>
      <header className={styles.header}>
        <div className={styles.headerType}>Track</div>
        <h2 className={styles.headerTitle}>{item.name}</h2>
        {item.sub && <div className={styles.headerSub}>{item.sub}</div>}
      </header>

      <section className={styles.statGrid4}>
        <DetailTile label="Plays"        value={detail.totalPlays} />
        <DetailTile label="Tiempo"       value={formatMs(detail.totalMs)} />
        <DetailTile label="Skip rate"    value={formatPct(detail.skipRate)} />
        <DetailTile label="Duración avg" value={formatMs(detail.avgPlayMs)} />
      </section>

      <section className={styles.meta}>
        Primera: {formatDate(detail.firstTs)} · Última: {formatDate(detail.lastTs)}<br />
        Peak: {detail.peakHour == null ? '—' : `${detail.peakHour}h`} · {detail.peakDow == null ? '—' : DOW_FULL[detail.peakDow]}<br />
        % de tu escucha total: {formatPct(detail.pctOfTotal)}
      </section>

      <section className={styles.section}>
        <MiniTimeline byMonth={detail.byMonth} />
      </section>

      <section className={styles.section}>
        <MiniHeatmap heatmap={detail.heatmap} />
      </section>

      {detail.platforms.length > 0 && (
        <section>
          <p className={styles.sectionTitle}>Plataformas</p>
          <ul className={styles.platformsList}>
            {detail.platforms.map(p => (
              <li key={p.name} className={styles.platformsRow}>
                <span>{p.name}</span>
                <span className={styles.platformsMeta}>{p.plays} plays · {formatMs(p.msTotal)}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
