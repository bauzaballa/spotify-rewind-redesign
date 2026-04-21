import styles from './Card.module.css'

/**
 * Reusable card container.
 * @param {'default' | 'highlight' | 'stat'} variant
 */
export default function Card({ children, variant = 'default', className = '', ...props }) {
  const variantClass = variant !== 'default' ? styles[variant] : ''

  return (
    <div
      className={[styles.card, variantClass, className].filter(Boolean).join(' ')}
      {...props}
    >
      {children}
    </div>
  )
}
