import { createContext, useContext, useState, useCallback, useRef } from 'react'
import { procesarHistorialAsync } from '../utils/parseData'
import { deriveViewData } from '../utils/deriveData'

const DataContext = createContext(null)

const INITIAL_STATE = {
  raw:           null,
  processed:     null,
  viewData:      null,
  loading:       false,
  progress:      0,
  stepLabel:     '',
  totalEntries:  0,
  fileName:      null,
}

export function DataProvider({ children }) {
  const [state, setState] = useState(INITIAL_STATE)
  const loadStartRef = useRef(null)

  const iniciarCarga = useCallback((fileName = null) => {
    loadStartRef.current = Date.now()
    setState(prev => ({
      ...prev,
      loading:   true,
      progress:  0,
      stepLabel: 'Leyendo archivo...',
      fileName,
    }))
  }, [])

  const cargarArchivos = useCallback(async (entries, fileName = null) => {
    if (!loadStartRef.current) {
      loadStartRef.current = Date.now()
      setState(prev => ({
        ...prev,
        loading:   true,
        progress:  0,
        stepLabel: 'Iniciando...',
        fileName,
      }))
    }

    try {
      const processed = await procesarHistorialAsync(entries, (progress) => {
        setState(prev => ({
          ...prev,
          progress,
          stepLabel: getStepLabel(progress, entries.length),
        }))
      })

      setState(prev => ({ ...prev, stepLabel: 'Preparando vistas...' }))
      const viewData = deriveViewData(processed)

      // Ensure loader is visible for at least 4 seconds from first click
      const elapsed = Date.now() - (loadStartRef.current ?? Date.now())
      const remaining = Math.max(0, 4000 - elapsed)
      loadStartRef.current = null
      if (remaining > 0) await new Promise(r => setTimeout(r, remaining))

      setState({
        raw:          entries,
        processed,
        viewData,
        loading:      false,
        progress:     100,
        stepLabel:    '',
        totalEntries: entries.length,
        fileName,
      })
    } catch (err) {
      loadStartRef.current = null
      if (import.meta.env.DEV) {
        console.error('[DataContext] Error procesando historial:', err)
      }
      setState(prev => ({ ...prev, loading: false, progress: 0, stepLabel: '' }))
    }
  }, [])

  const resetData = useCallback(() => {
    setState(INITIAL_STATE)
  }, [])

  const setFileName = useCallback((name) => {
    setState(prev => ({ ...prev, fileName: name }))
  }, [])

  return (
    <DataContext.Provider value={{ ...state, iniciarCarga, cargarArchivos, resetData, setFileName }}>
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used inside DataProvider')
  return ctx
}

function getStepLabel(progress, totalEntries) {
  if (progress < 8)  return 'Filtrando reproducciones...'
  if (progress < 90) return `Procesando ${totalEntries.toLocaleString('es')} entradas...`
  if (progress < 98) return 'Calculando estadísticas...'
  return 'Finalizando...'
}
