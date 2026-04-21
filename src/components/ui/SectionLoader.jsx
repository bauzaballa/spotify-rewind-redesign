import { motion } from 'framer-motion'
import styles from './SectionLoader.module.css'

const BARS = [0.5, 1.0, 0.7, 0.85, 0.55]

export default function SectionLoader() {
  return (
    <div className={styles.root}>
      <div className={styles.equalizer}>
        {BARS.map((amp, i) => (
          <motion.div
            key={i}
            className={styles.bar}
            animate={{ scaleY: [amp * 0.2, amp, amp * 0.4, amp * 0.9, amp * 0.2] }}
            transition={{
              duration: 1.4,
              repeat: Infinity,
              delay: i * 0.1,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>
    </div>
  )
}
