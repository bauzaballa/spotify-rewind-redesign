import { useEffect, useState } from 'react'
import { motion, useMotionValue, animate } from 'framer-motion'
import { useData } from '../../context/DataContext'
import styles from './LoaderScreen.module.css'

const BAR_AMPLITUDES = [0.45, 0.75, 0.55, 1.0, 0.65, 0.9, 0.38, 0.82, 0.6, 0.95, 0.42, 0.72, 0.58, 0.88, 0.5, 0.78]
const BAR_COLORS = ['var(--accent)', 'var(--accent-hover)', 'rgba(245,158,11,0.7)', 'rgba(245,158,11,0.5)']

export default function LoaderScreen() {
  const { progress } = useData()
  const mv = useMotionValue(0)
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    const unsub = mv.on('change', v => setDisplay(Math.floor(v)))
    return unsub
  }, [mv])

  useEffect(() => {
    animate(mv, Math.min(progress, 99), { duration: 0.8, ease: 'easeOut' })
  }, [progress, mv])

  return (
    <div className={styles.root}>
      <div className={styles.content}>

        <p className={styles.logo}>REWIND</p>

        <div className={styles.equalizer}>
          {BAR_AMPLITUDES.map((amp, i) => (
            <motion.div
              key={i}
              className={styles.bar}
              style={{ background: BAR_COLORS[i % BAR_COLORS.length], transformOrigin: 'bottom' }}
              animate={{ scaleY: [amp * 0.15, amp, amp * 0.35, amp * 0.85, amp * 0.1, amp * 0.9, amp * 0.15] }}
              transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.09, ease: 'easeInOut' }}
            />
          ))}
        </div>

        <p className={styles.progressNum}>{display}%</p>

      </div>
    </div>
  )
}
