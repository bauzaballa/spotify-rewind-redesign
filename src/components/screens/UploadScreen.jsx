import { useRef, useState, useCallback } from 'react'
import JSZip from 'jszip'
import { UploadCloud } from 'lucide-react'
import { useData } from '../../context/DataContext'
import styles from './UploadScreen.module.css'

// ---------------------------------------------------------------------------
// Sample data generator
// ---------------------------------------------------------------------------
const SAMPLE_ARTISTS = [
  'Radiohead', 'Bon Iver', 'Tame Impala', 'Nick Cave', 'Sufjan Stevens',
  'The National', 'Arcade Fire', 'Portishead', 'Massive Attack', 'Sigur Rós',
  'Neutral Milk Hotel', 'Fleet Foxes', 'Beach House', 'Grizzly Bear', 'Low',
]

const SAMPLE_TRACKS = {
  Radiohead: ['Karma Police', 'Creep', 'Fake Plastic Trees', 'Exit Music'],
  'Bon Iver': ['Skinny Love', 'Holocene', 'Towers', 'Bloodbank'],
  'Tame Impala': ['The Less I Know The Better', 'Feels Like We Only Go Backwards', 'Let It Happen'],
  'Nick Cave': ['Into My Arms', 'The Ship Song', 'Red Right Hand'],
  'Sufjan Stevens': ['Death With Dignity', 'Should Have Known Better', 'Chicago'],
  'The National': ['Bloodbuzz Ohio', 'About Today', 'Sorrow'],
  'Arcade Fire': ['Wake Up', 'Rebellion (Lies)', 'Ready to Start'],
  Portishead: ['Sour Times', 'Glory Box', 'Roads'],
  'Massive Attack': ['Teardrop', 'Unfinished Sympathy', 'Angel'],
  'Sigur Rós': ['Hoppípolla', 'Ára bátur', 'Svefn-g-englar'],
  'Neutral Milk Hotel': ['In the Aeroplane Over the Sea', 'Holland, 1945'],
  'Fleet Foxes': ['White Winter Hymnal', 'Mykonos', 'Helplessness Blues'],
  'Beach House': ['Space Song', 'Myth', 'Norway'],
  'Grizzly Bear': ['Two Weeks', 'Knife', 'Ready, Able'],
  Low: ['Dinosaur Act', 'Lullaby', 'Pissing'],
}

const PLATFORMS = ['android', 'ios', 'windows', 'web_player', 'osx']
const REASONS = ['trackdone', 'fwdbtn', 'backbtn', 'endplay', 'remote']

function generateSampleData(count = 1000) {
  const entries = []
  const now = Date.now()
  const twoYearsMs = 2 * 365 * 24 * 3600 * 1000

  for (let i = 0; i < count; i++) {
    const artist = SAMPLE_ARTISTS[Math.floor(Math.random() * SAMPLE_ARTISTS.length)]
    const trackList = SAMPLE_TRACKS[artist]
    const track = trackList[Math.floor(Math.random() * trackList.length)]
    const ts = new Date(now - Math.random() * twoYearsMs).toISOString()

    entries.push({
      ts,
      ms_played: Math.floor(30_000 + Math.random() * 270_000),
      master_metadata_track_name: track,
      master_metadata_album_artist_name: artist,
      master_metadata_album_album_name: `${artist} — Best Of`,
      spotify_track_uri: `spotify:track:${btoa(artist + track).slice(0, 22)}`,
      episode_name: null,
      episode_show_name: null,
      skipped: Math.random() < 0.15,
      shuffle: Math.random() < 0.4,
      offline: Math.random() < 0.08,
      platform: PLATFORMS[Math.floor(Math.random() * PLATFORMS.length)],
      reason_end: REASONS[Math.floor(Math.random() * REASONS.length)],
    })
  }

  return entries
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function UploadScreen() {
  const { iniciarCarga, cargarArchivos, fileName } = useData()
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef(null)

  const processEntries = useCallback((entries, name) => {
    cargarArchivos(entries, name)
  }, [cargarArchivos])

  async function handleZip(file) {
    iniciarCarga(file.name)
    const zip = await JSZip.loadAsync(file)
    const audioFiles = Object.values(zip.files).filter(
      f => /Streaming_History_Audio_.*\.json$/i.test(f.name)
    )

    if (audioFiles.length === 0) return

    let all = []
    for (const zipFile of audioFiles) {
      const text = await zipFile.async('text')
      const parsed = JSON.parse(text)
      all = all.concat(parsed)
    }

    processEntries(all, file.name)
  }

  async function handleJsonFiles(files) {
    iniciarCarga(files.length === 1 ? files[0].name : `${files.length} archivos`)
    let all = []
    for (const file of files) {
      const text = await file.text()
      all = all.concat(JSON.parse(text))
    }
    processEntries(all, files.length === 1 ? files[0].name : `${files.length} archivos`)
  }

  async function handleFiles(fileList) {
    const files = Array.from(fileList)
    if (files.length === 0) return

    if (files.length === 1 && files[0].name.endsWith('.zip')) {
      await handleZip(files[0])
    } else {
      const jsonFiles = files.filter(f => f.name.endsWith('.json'))
      if (jsonFiles.length > 0) await handleJsonFiles(jsonFiles)
    }
  }

  function onDrop(e) {
    e.preventDefault()
    setIsDragging(false)
    handleFiles(e.dataTransfer.files)
  }

  function onDragOver(e) {
    e.preventDefault()
    setIsDragging(true)
  }

  function onDragLeave() {
    setIsDragging(false)
  }

  function onInputChange(e) {
    handleFiles(e.target.files)
    e.target.value = ''
  }

  async function loadSample() {
    try {
      const res = await fetch('/sample_data.zip')
      if (!res.ok) throw new Error('no zip')
      const blob = await res.blob()
      const zip = await JSZip.loadAsync(blob)
      const audioFiles = Object.values(zip.files).filter(
        f => /Streaming_History_Audio_.*\.json$/i.test(f.name)
      )
      if (audioFiles.length === 0) throw new Error('no audio files')
      let all = []
      for (const zipFile of audioFiles) {
        const text = await zipFile.async('text')
        all = all.concat(JSON.parse(text))
      }
      processEntries(all, 'sample_data.json')
    } catch {
      setTimeout(() => {
        const entries = generateSampleData(1000)
        processEntries(entries, 'sample_data.json')
      }, 0)
    }
  }

  return (
    <div className={styles.root}>
      <div className={styles.content}>
        <div className={styles.logoBlock}>
          <h1 className={styles.logo}>REWIND</h1>
          <span className={styles.logoHandle}>× @bauzaballa</span>
        </div>
        <p className={styles.tagline}>Tu historial de Spotify, al desnudo</p>

        <div
          className={[styles.dropzone, isDragging ? styles.dropzoneActive : ''].join(' ')}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onClick={() => inputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={e => e.key === 'Enter' && inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".zip,.json"
            multiple
            className={styles.fileInput}
            onChange={onInputChange}
          />
          <UploadCloud size={36} className={styles.dropIcon} />
          <span className={styles.dropTitle}>
            Arrastrá tu archivo .zip o archivos .json
          </span>
          <span className={styles.dropSub}>
            Spotify → Configuración → Privacidad → Descargar tus datos
          </span>
        </div>


        <button className={styles.sampleBtn} onClick={loadSample} type="button">
          Ver demo con datos reales
        </button>
      </div>
    </div>
  )
}
