import styles from './Detail.module.css'

export default function DetailTile({ label, value }) {
  return (
    <div className={styles.tile}>
      <div className={styles.tileLabel}>{label}</div>
      <div className={styles.tileValue}>{value}</div>
    </div>
  )
}
