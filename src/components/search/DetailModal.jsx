import { useEffect, useMemo } from 'react'
import { createPortal } from 'react-dom'
// eslint-disable-next-line no-unused-vars
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { useData } from '../../context/DataContext'
import { useSearch } from '../../context/SearchContext'
import { deriveEntityDetail } from '../../utils/deriveEntityDetail'
import DetailTrack  from './DetailTrack'
import DetailArtist from './DetailArtist'
import DetailAlbum  from './DetailAlbum'
import styles from './DetailModal.module.css'
import sharedStyles from './Detail.module.css'

export default function DetailModal() {
  const { raw, processed, viewData } = useData()
  const { activeEntity, closeEntity, cacheRef } = useSearch()

  useEffect(() => {
    if (!activeEntity) return
    function onKey(e) {
      if (e.key === 'Escape') {
        e.preventDefault()
        closeEntity()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [activeEntity, closeEntity])

  /* eslint-disable react-hooks/refs -- intentional memo cache keyed by entity */
  const { detail, item } = useMemo(() => {
    if (!activeEntity || !raw || !processed || !viewData) {
      return { detail: null, item: null }
    }
    const { type, id } = activeEntity
    const key = `${type}:${id}`
    const cache = cacheRef.current
    let d = cache.get(key)
    if (!d) {
      d = deriveEntityDetail(raw, type, id, processed)
      cache.set(key, d)
    }
    const foundItem = viewData.searchIndex.find(x => x.type === type && x.id === id) ?? null
    return { detail: d, item: foundItem }
  }, [activeEntity, raw, processed, viewData, cacheRef])
  /* eslint-enable react-hooks/refs */

  if (!activeEntity) return null

  let content = null
  if (detail && item) {
    if (activeEntity.type === 'track') {
      content = <DetailTrack item={item} detail={detail} />
    } else if (activeEntity.type === 'artist') {
      const artistData = processed?.artists.get(activeEntity.id)
      const uniqueTracks = artistData?.tracksSet.size ?? 0
      const uniqueAlbums = detail.topAlbums.length
      content = (
        <DetailArtist
          item={item}
          detail={detail}
          uniqueTracks={uniqueTracks}
          uniqueAlbums={uniqueAlbums}
        />
      )
    } else if (activeEntity.type === 'album') {
      content = <DetailAlbum item={item} detail={detail} />
    }
  }
  if (detail && detail.totalPlays === 0) {
    content = <div className={sharedStyles.empty}>Sin reproducciones válidas para esta entidad.</div>
  }

  return createPortal(
    <AnimatePresence>
      <motion.div
        key="detail-backdrop"
        className={styles.backdrop}
        onClick={closeEntity}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}
      >
        <motion.div
          key="detail-card"
          className={styles.card}
          role="dialog"
          aria-modal="true"
          aria-label={item?.name ?? 'Detalle'}
          onClick={e => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
        >
          <button type="button" className={styles.close} onClick={closeEntity} aria-label="Cerrar">
            <X size={18} />
          </button>
          {content}
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body,
  )
}
