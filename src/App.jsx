import { useState } from 'react'
// eslint-disable-next-line no-unused-vars
import { AnimatePresence, motion } from 'framer-motion'
import { useData } from './context/DataContext'
import { SearchProvider } from './context/SearchContext'
import DetailModal from './components/search/DetailModal'
import MobileSearchOverlay from './components/search/MobileSearchOverlay'
import { useTheme } from './hooks/useTheme'
import UploadScreen from './components/screens/UploadScreen'
import LoaderScreen from './components/screens/LoaderScreen'
import Sidebar from './components/layout/Sidebar'
import Header from './components/layout/Header'
import Overview from './components/sections/Overview'
import TopTracks from './components/sections/TopTracks'
import TopArtists from './components/sections/TopArtists'
import TopAlbums from './components/sections/TopAlbums'
import Mood from './components/sections/Mood'
import TimeAnalysis from './components/sections/TimeAnalysis'
import Platforms from './components/sections/Platforms'
import Habits from './components/sections/Habits'
import styles from './App.module.css'

const SECTIONS = {
  overview:  { Component: Overview,     label: 'Overview'  },
  tracks:    { Component: TopTracks,    label: 'Tracks'    },
  artists:   { Component: TopArtists,   label: 'Artists'   },
  albums:    { Component: TopAlbums,    label: 'Albums'    },
  mood:      { Component: Mood,         label: 'Mood'      },
  platforms: { Component: Platforms,    label: 'Platforms' },
  time:      { Component: TimeAnalysis, label: 'Time'      },
  habits:    { Component: Habits,       label: 'Habits'    },
}

const fadeSlide = {
  initial:    { opacity: 0, y: 8 },
  animate:    { opacity: 1, y: 0 },
  exit:       { opacity: 0, y: -8 },
  transition: { duration: 0.25, ease: 'easeOut' },
}

export default function App() {
  const { processed, loading } = useData()
  const [activeSection, setActiveSection] = useState('overview')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const { theme, toggle: toggleTheme } = useTheme()

  const section = SECTIONS[activeSection] ?? null
  const SectionComponent = section?.Component ?? null

  function handleSelect(id) {
    setActiveSection(id)
    setDrawerOpen(false)
  }

  return (
    <SearchProvider>
      <AnimatePresence mode="wait">
        {!loading && !processed && (
          <motion.div key="upload" {...fadeSlide}>
            <UploadScreen />
          </motion.div>
        )}

        {loading && !processed && (
          <motion.div key="loader" {...fadeSlide}>
            <LoaderScreen />
          </motion.div>
        )}

        {!!processed && (
          <motion.div key="app" className={styles.layout} {...fadeSlide}>
            <Sidebar
              active={activeSection}
              onSelect={handleSelect}
              isOpen={drawerOpen}
              onClose={() => setDrawerOpen(false)}
              theme={theme}
              onThemeToggle={toggleTheme}
            />
            <div className={styles.rightCol}>
              <Header
                sectionName={section?.label ?? ''}
                onMenuOpen={() => setDrawerOpen(true)}
              />
              <main className={styles.main}>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeSection}
                    style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                  >
                    {SectionComponent && <SectionComponent />}
                  </motion.div>
                </AnimatePresence>
              </main>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <DetailModal />
      <MobileSearchOverlay />
    </SearchProvider>
  )
}
