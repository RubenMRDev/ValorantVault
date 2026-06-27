import { createContext, useContext, useEffect, useState } from 'react'
import { apiGet } from './api.js'

/* Language is global app state; every fetch re-keys on it. */
const LangContext = createContext({ lang: 'en-US', setLang: () => {} })

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(
    () => localStorage.getItem('val-lang') || 'en-US'
  )
  useEffect(() => { localStorage.setItem('val-lang', lang) }, [lang])
  return (
    <LangContext.Provider value={{ lang, setLang }}>
      {children}
    </LangContext.Provider>
  )
}

export const useLang = () => useContext(LangContext)

/* Fetch one API path. Returns { data, error, loading } and refetches
   when the path or the active language changes. */
export function useApi(path) {
  const { lang } = useLang()
  const [state, setState] = useState({ data: null, error: null, loading: true })

  useEffect(() => {
    if (!path) return
    let alive = true
    setState((s) => ({ ...s, loading: true, error: null }))
    apiGet(path, lang)
      .then((data) => alive && setState({ data, error: null, loading: false }))
      .catch((error) => alive && setState({ data: null, error, loading: false }))
    return () => { alive = false }
  }, [path, lang])

  return state
}
