import { Smartphone, Monitor, Globe, Tv } from 'lucide-react'
import { useData } from '../../context/DataContext'
import { formatNumber, formatPercent } from '../../utils/formatters'
import SectionHeader from '../ui/SectionHeader'
import Card from '../ui/Card'
import styles from './Platforms.module.css'

const GROUP_META = {
  mobile:  { label: 'Mobile',        Icon: Smartphone },
  desktop: { label: 'Desktop',       Icon: Monitor    },
  web:     { label: 'Web Player',    Icon: Globe      },
  smart:   { label: 'Smart devices', Icon: Tv         },
}

export default function Platforms() {
  const { processed, viewData } = useData()

  if (!processed || !viewData) return null

  const groups = viewData.platformGroups.map(g => ({ ...g, ...GROUP_META[g.id] }))

  return (
    <div className={styles.root}>
      <SectionHeader title="Platforms" subtitle="Desde dónde escuchás música" />
      <div className={styles.scrollArea}>
        <Card>
          <div className={styles.list}>
            {groups.map(({ id, label, Icon, plays, pct, subtypeList }) => (
              <div key={id} className={styles.row}>
                <div className={styles.iconWrap}>
                  <Icon size={16} />
                </div>
                <div className={styles.info}>
                  <span className={styles.groupLabel}>{label}</span>
                  {subtypeList.length > 0 && (
                    <span className={styles.subtypes}>
                      {subtypeList.join(' · ')}
                    </span>
                  )}
                </div>
                <div className={styles.stats}>
                  <span className={styles.pct}>{formatPercent(pct, 0)}</span>
                  <span className={styles.plays}>{formatNumber(plays)} plays</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
