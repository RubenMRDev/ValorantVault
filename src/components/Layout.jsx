import { useEffect, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { LANGUAGES } from '../lib/api.js'
import { useApi, useLang } from '../lib/useApi.jsx'
import { SearchPalette } from './SearchPalette.jsx'
import s from './Layout.module.css'

const NAV = [
  {
    label: 'Tools',
    links: [
      ['/battle-pass', 'Battle Pass Calc'],
    ],
  },
  {
    label: 'Arsenal',
    links: [
      ['/agents', 'Agents'],
      ['/weapons', 'Weapons'],
      ['/skins', 'Skins'],
      ['/maps', 'Maps'],
      ['/ranks', 'Ranks'],
      ['/gamemodes', 'Game Modes'],
    ],
  },
  {
    label: 'Cosmetics',
    links: [
      ['/playercards', 'Player Cards'],
      ['/sprays', 'Sprays'],
      ['/buddies', 'Gun Buddies'],
      ['/bundles', 'Bundles'],
      ['/sprays_titles', 'Player Titles'],
    ],
  },
  {
    label: 'Economy',
    links: [
      ['/currencies', 'Currencies'],
      ['/gear', 'Gear'],
    ],
  },
]

export function Layout({ children }) {
  const { lang, setLang } = useLang()
  const [navOpen, setNavOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const loc = useLocation()
  const version = useApi('/version').data

  // close the mobile drawer on navigation
  useEffect(() => { setNavOpen(false) }, [loc.pathname])

  // Cmd/Ctrl-K opens search
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setSearchOpen((v) => !v)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div className={s.shell}>
      <div
        className={`${s.scrim} ${navOpen ? s.scrimOpen : ''}`}
        onClick={() => setNavOpen(false)}
      />

      <aside className={`${s.rail} ${navOpen ? s.railOpen : ''}`}>
        <NavLink to="/" className={s.brand}>
          <span className={s.brandMark}>V</span>
          <span className={s.brandName}>
            VAULT
            <small>VALORANT API</small>
          </span>
        </NavLink>

        <nav className={s.nav}>
          {NAV.map((group) => (
            <div className={s.group} key={group.label}>
              <div className={s.groupLabel}>{group.label}</div>
              {group.links.map(([to, label]) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `${s.link} ${isActive ? s.linkActive : ''}`
                  }
                >
                  <span className={s.linkDot} />
                  {label}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div className={s.railFoot}>
          <b>Live build</b>
          <br />
          {version ? `${version.version}` : '…'}
          {version?.branch ? ` · ${version.branch}` : ''}
          <br />
          data: valorant-api.com
        </div>
      </aside>

      <div className={s.main}>
        <header className={s.topbar}>
          <button
            className={s.hamburger}
            onClick={() => setNavOpen((v) => !v)}
            aria-label="Toggle navigation"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M2 4h14M2 9h14M2 14h14" />
            </svg>
          </button>

          <button className={s.searchBtn} onClick={() => setSearchOpen(true)}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="7" cy="7" r="5" />
              <path d="M11 11l3.5 3.5" />
            </svg>
            Search agents, skins, maps…
            <kbd>Ctrl K</kbd>
          </button>

          <select
            className={s.langSelect}
            value={lang}
            onChange={(e) => setLang(e.target.value)}
            aria-label="Language"
          >
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>{l.label}</option>
            ))}
          </select>
        </header>

        <main className={s.content}>{children}</main>
      </div>

      {searchOpen && <SearchPalette onClose={() => setSearchOpen(false)} />}
    </div>
  )
}
