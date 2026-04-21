import { useMemo } from 'react'
// eslint-disable-next-line no-unused-vars
import { AnimatePresence, motion } from 'framer-motion'
import {
  LayoutDashboard, Music, Mic2, Disc3,
  Monitor, Clock, Brain, Sparkles,
  Sun, Moon,
} from 'lucide-react'
import { useData } from '../../context/DataContext'
import { msToHours, formatNumber } from '../../utils/formatters'
import SearchInput   from '../search/SearchInput'
import SearchResults from '../search/SearchResults'
import styles from './Sidebar.module.css'

const NAV_ITEMS = [
  { id: 'overview',   label: 'Overview',   Icon: LayoutDashboard },
  { id: 'tracks',     label: 'Tracks',     Icon: Music           },
  { id: 'artists',    label: 'Artists',    Icon: Mic2            },
  { id: 'albums',     label: 'Albums',     Icon: Disc3           },
  { id: 'mood',       label: 'Mood',       Icon: Sparkles        },
  { id: 'platforms',  label: 'Platforms',  Icon: Monitor         },
  { id: 'time',       label: 'Time',       Icon: Clock           },
  { id: 'habits',     label: 'Habits',     Icon: Brain           },
]

function NavContent({ active, onSelect, footerStats, theme, onThemeToggle, isDemo }) {
  return (
    <>
      <div className={styles.brand}>
        <span className={styles.brandName}>REWIND</span>
        <span className={styles.brandSep}> ×</span>
        <div className={styles.brandHandle}>@bauzaballa</div>
      </div>
      <div className={styles.searchWrap}>
        <SearchInput />
      </div>
      <nav className={styles.nav}>
        {NAV_ITEMS.map(({ id, label, Icon }) => (
          <button
            key={id}
            className={[styles.navItem, active === id ? styles.navItemActive : ''].join(' ')}
            onClick={() => onSelect(id)}
            type="button"
          >
            <Icon size={16} className={styles.navIcon} />
            {label}
          </button>
        ))}
      </nav>
      {footerStats && (
        <div className={styles.footer}>
          <span className={styles.footerStat}>
            <span className={styles.footerValue}>{formatNumber(footerStats.hours)}h</span>
            {' '}escuchadas
          </span>
          <span className={styles.footerStat}>
            <span className={styles.footerValue}>{formatNumber(footerStats.tracks)}</span>
            {' '}tracks únicos
          </span>
        </div>
      )}
      {isDemo && (
        <div className={styles.demoBanner}>
          <span className={styles.demoBannerTitle}>👀 Modo espía activado</span>
          <span className={styles.demoBannerText}>Estás viendo el historial real de @bauzaballa.</span>
        </div>
      )}
      <div className={styles.themeRow}>
        <button
          type="button"
          className={styles.themeBtn}
          onClick={onThemeToggle}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          {theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
        </button>
      </div>
    </>
  )
}

export default function Sidebar({ active, onSelect, isOpen, onClose, theme, onThemeToggle }) {
  const { processed, fileName } = useData()
  const isDemo = fileName === 'my_spotify_data.zip'

  const footerStats = useMemo(() => {
    if (!processed) return null
    return {
      hours: msToHours(processed.stats.totalMs),
      tracks: processed.stats.uniqueTracks,
    }
  }, [processed])

  return (
    <>
      <aside className={styles.sidebar}>
        <NavContent
          active={active}
          onSelect={onSelect}
          footerStats={footerStats}
          theme={theme}
          onThemeToggle={onThemeToggle}
          isDemo={isDemo}
        />
      </aside>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              className={styles.overlay}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={onClose}
            />
            <motion.aside
              className={styles.drawer}
              initial={{ x: -260 }}
              animate={{ x: 0 }}
              exit={{ x: -260 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              <NavContent
                active={active}
                onSelect={onSelect}
                footerStats={footerStats}
                theme={theme}
                onThemeToggle={onThemeToggle}
                isDemo={isDemo}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <SearchResults />
    </>
  )
}
