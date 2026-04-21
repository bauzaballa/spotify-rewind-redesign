import { motion } from 'framer-motion'
import { useData } from '../../context/DataContext'
import styles from './LoaderScreen.module.css'

// Bar amplitudes — determines each bar's relative max height
const BAR_AMPLITUDES = [0.45, 0.75, 0.55, 1.0, 0.65, 0.9, 0.38, 0.82, 0.6, 0.95, 0.42, 0.72, 0.58, 0.88, 0.5, 0.78]

// Alternates between two accent colors for visual depth
const BAR_COLORS = ['var(--accent)', 'var(--accent-hover)', 'rgba(245,158,11,0.7)', 'rgba(245,158,11,0.5)']

export default function LoaderScreen() {
  const { progress, stepLabel, fileName, totalEntries } = useData()

  return (
    <div className={styles.root}>
      <div className={styles.content}>

        <p className={styles.logo}>REWIND</p>

        {/* Equalizer */}
        <div className={styles.equalizer}>
          {BAR_AMPLITUDES.map((amp, i) => (
            <motion.div
              key={i}
              className={styles.bar}
              style={{
                background: BAR_COLORS[i % BAR_COLORS.length],
                transformOrigin: 'bottom',
              }}
              animate={{ scaleY: [amp * 0.15, amp, amp * 0.35, amp * 0.85, amp * 0.1, amp * 0.9, amp * 0.15] }}
              transition={{
                duration: 1.6,
                repeat: Infinity,
                delay: i * 0.09,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>

        {/* Progress number */}
        <motion.p
          className={styles.progressNum}
          key={Math.floor(progress / 5)}
          initial={{ opacity: 0.6, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {Math.min(progress, 99)}%
        </motion.p>

        {/* Step label */}
        <motion.p
          className={styles.stepLabel}
          key={stepLabel}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {stepLabel}
        </motion.p>

        {/* File name */}
        {fileName && (
          <p className={styles.fileName}>{fileName}</p>
        )}

        {/* Progress bar */}
        <div className={styles.trackWrap}>
          <motion.div
            className={styles.trackFill}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: progress / 100 }}
            transition={{ ease: 'easeOut', duration: 0.4 }}
          />
        </div>

      </div>
    </div>
  )
}
