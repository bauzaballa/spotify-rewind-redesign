# Spotify Rewind

## Proyecto
App React que visualiza el historial extendido de Spotify. Sin backend. Todo en browser.
Vite + React. NO usar TypeScript. CSS Modules para estilos (archivo .module.css por componente).

## Stack fijo — no proponer alternativas
- recharts (gráficos)
- jszip (leer .zip en browser)
- date-fns (fechas)
- lucide-react (íconos)
- framer-motion (animaciones)
- CSS Modules

## Estructura de archivos — respetar siempre
src/
  context/DataContext.jsx
  utils/parseData.js
  utils/formatters.js
  components/layout/Sidebar.jsx + Sidebar.module.css
  components/layout/Header.jsx + Header.module.css
  components/screens/UploadScreen.jsx + UploadScreen.module.css
  components/sections/Overview.jsx
  components/sections/TopTracks.jsx
  components/sections/TopArtists.jsx
  components/sections/TopAlbums.jsx
  components/sections/Podcasts.jsx
  components/sections/Platforms.jsx
  components/sections/TimeAnalysis.jsx
  components/sections/Habits.jsx
  components/charts/BarChartComponent.jsx
  components/charts/LineChartComponent.jsx
  components/charts/DonutChartComponent.jsx
  components/charts/ActivityHeatmap.jsx
  components/ui/Card.jsx + Card.module.css
  components/ui/StatBadge.jsx
  components/ui/SectionHeader.jsx
  styles/variables.css
  styles/global.css

## Datos de Spotify — estructura de cada entrada JSON
{
  ts: string (ISO 8601 UTC),
  ms_played: number,
  master_metadata_track_name: string | null,
  master_metadata_album_artist_name: string | null,
  master_metadata_album_album_name: string | null,
  spotify_track_uri: string | null,
  episode_name: string | null,
  episode_show_name: string | null,
  skipped: boolean,
  shuffle: boolean,
  offline: boolean,
  platform: string,
  reason_end: string
}
Regla SIEMPRE aplicar: filtrar ms_played < 30000 antes de cualquier cálculo.
Canciones = master_metadata_track_name !== null
Podcasts = episode_name !== null

## parseData.js — output de procesarHistorial(entries)
Debe retornar exactamente:
{
  tracks: Map<uri, { name, artist, album, plays, msTotal, skips }>,
  artists: Map<name, { plays, msTotal, tracksSet: Set<uri> }>,
  albums: Map<`${artist}__${album}`, { name, artist, plays, msTotal }>,
  podcasts: Map<showName, { plays, msTotal, episodes: Set<string> }>,
  byYear: Map<year:string, { plays, msTotal }>,
  byMonth: Map<"YYYY-MM", { plays, msTotal }>,
  byHour: Array(24).fill(0),
  byDayOfWeek: Array(7).fill(0),
  byDay: Map<"YYYY-MM-DD", msTotal>,
  platforms: Map<platform, { plays, msTotal }>,
  reasonEnd: Map<reason, count>,
  stats: {
    totalMs, totalPlays, uniqueTracks, uniqueArtists, uniqueAlbums,
    skippedRatio, shuffleRatio, offlineRatio,
    topTrack: { name, artist, msTotal },
    topArtist: { name, msTotal },
    bestYear: string
  }
}

## Paleta — usar SIEMPRE estas variables, nunca hardcodear colores
--olive-leaf: #606c38
--black-forest: #283618
--cornsilk: #fefae0
--sunlit-clay: #dda15e
--copperwood: #bc6c25
--bg-main: #1a2210
--bg-sidebar: #1e2914
--bg-card: #232f14
--bg-card-hover: #2a3819
--text-primary: #fefae0
--text-secondary: #a8b88a
--text-muted: #5a6b3a
--accent: #dda15e
--accent-hover: #bc6c25
--border: rgba(96, 108, 56, 0.25)
--border-accent: rgba(221, 161, 94, 0.4)

## Tipografía
Google Fonts: "Playfair Display" (weights 400, 700) + "DM Sans" (weights 300, 400, 500)
Títulos de sección → Playfair Display
Datos, labels, body → DM Sans
Importar en variables.css con @import

## Estética — dark forest / organic
- body bg: var(--bg-main)
- Cards: bg var(--bg-card), border 1px solid var(--border), border-radius 12px
- Hover en cards: bg var(--bg-card-hover), box-shadow 0 4px 24px rgba(96,108,56,0.15), transition 200ms ease
- Scrollbar: width 6px, track var(--bg-sidebar), thumb var(--olive-leaf)
- Sidebar: 240px fijo, bg var(--bg-sidebar), border-right 1px solid var(--border)
- Sidebar item activo: bg rgba(96,108,56,0.3), border-left 3px solid var(--accent), color var(--cornsilk)
- Recharts: colores primarios var(--sunlit-clay) y var(--copperwood), tooltip bg var(--bg-card)
- Transiciones de sección: framer-motion, AnimatePresence con fade + slide up sutil (y: 8 → 0)
- Sin neón, sin gradientes agresivos, sin sombras duras

## Reglas de código
- Siempre usar CSS Modules, nunca inline styles salvo valores dinámicos
- useMemo para todos los cálculos derivados de datos pesados
- Componentes funcionales, hooks propios si se repite lógica
- No usar useEffect para derivar datos — solo useMemo
- Manejo de nulls: si no hay datos para una sección, mostrar EmptyState con ícono lucide
- Console.log solo en desarrollo, envuelto en if (import.meta.env.DEV)