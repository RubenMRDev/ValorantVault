import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiGet } from '../lib/api.js'
import { useLang } from '../lib/useApi.jsx'
import { AssetImage } from './ui.jsx'
import s from './SearchPalette.module.css'

// Pull the four entity types that have detail pages, build a flat index.
const SOURCES = [
  { path: '/agents?isPlayableCharacter=true', type: 'Agent', to: (x) => `/agents/${x.uuid}`,
    img: (x) => x.displayIcon, sub: (x) => x.role?.displayName },
  { path: '/weapons', type: 'Weapon', to: (x) => `/weapons/${x.uuid}`,
    img: (x) => x.displayIcon, sub: (x) => x.shopData?.categoryText },
  { path: '/weapons/skins', type: 'Skin', to: (x) => `/skins/${x.uuid}`,
    img: (x) => x.chromas?.[0]?.fullRender || x.displayIcon, sub: () => null },
  { path: '/maps', type: 'Map', to: (x) => `/maps/${x.uuid}`,
    img: (x) => x.listViewIcon || x.splash, sub: (x) => x.coordinates },
]

export function SearchPalette({ onClose }) {
  const { lang } = useLang()
  const [index, setIndex] = useState([])
  const [q, setQ] = useState('')
  const [active, setActive] = useState(0)
  const navigate = useNavigate()
  const inputRef = useRef(null)
  const listRef = useRef(null)

  useEffect(() => { inputRef.current?.focus() }, [])

  useEffect(() => {
    let alive = true
    Promise.all(SOURCES.map((src) =>
      apiGet(src.path, lang)
        .then((items) => (items || []).map((it) => ({
          id: it.uuid,
          type: src.type,
          name: it.displayName || '',
          to: src.to(it),
          img: src.img(it),
          sub: src.sub(it),
        })))
        .catch(() => [])
    )).then((all) => { if (alive) setIndex(all.flat()) })
    return () => { alive = false }
  }, [lang])

  const results = useMemo(() => {
    const term = q.trim().toLowerCase()
    if (!term) return []
    return index
      .filter((x) => x.name.toLowerCase().includes(term))
      .slice(0, 40)
  }, [q, index])

  // group results by type, preserving a stable order
  const groups = useMemo(() => {
    const order = ['Agent', 'Weapon', 'Skin', 'Map']
    const flat = []
    const byType = {}
    for (const r of results) (byType[r.type] ||= []).push(r)
    for (const t of order) for (const r of (byType[t] || [])) flat.push(r)
    return flat
  }, [results])

  useEffect(() => { setActive(0) }, [q])

  const go = (item) => { if (item) { navigate(item.to); onClose() } }

  const onKey = (e) => {
    if (e.key === 'Escape') return onClose()
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((i) => Math.min(i + 1, groups.length - 1)) }
    if (e.key === 'ArrowUp') { e.preventDefault(); setActive((i) => Math.max(i - 1, 0)) }
    if (e.key === 'Enter') { e.preventDefault(); go(groups[active]) }
  }

  // keep the active row in view
  useEffect(() => {
    listRef.current?.querySelector(`[data-i="${active}"]`)?.scrollIntoView({ block: 'nearest' })
  }, [active])

  let lastType = null

  return (
    <div className={s.overlay} onClick={onClose}>
      <div className={s.panel} onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Search">
        <div className={s.inputRow}>
          <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
            <circle cx="7" cy="7" r="5" /><path d="M11 11l3.5 3.5" />
          </svg>
          <input
            ref={inputRef}
            className={s.input}
            placeholder={index.length ? 'Search agents, weapons, skins, maps…' : 'Indexing…'}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={onKey}
          />
          <span className={s.esc}>ESC</span>
        </div>

        <div className={s.results} ref={listRef}>
          {q && groups.length === 0 && (
            <div className={s.empty}>No matches for “{q}”.</div>
          )}
          {!q && (
            <div className={s.empty}>Type to search {index.length || '…'} entries across the game.</div>
          )}
          {groups.map((item, i) => {
            const header = item.type !== lastType ? item.type : null
            lastType = item.type
            return (
              <div key={item.type + item.id}>
                {header && <div className={s.groupLabel}>{header}s</div>}
                <button
                  data-i={i}
                  className={`${s.row} ${i === active ? s.rowActive : ''}`}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => go(item)}
                >
                  <AssetImage src={item.img} alt={item.name} className={s.thumb} />
                  <span className={s.rowText}>
                    <div className={s.rowTitle}>{item.name}</div>
                    {item.sub && <div className={s.rowSub}>{item.sub}</div>}
                  </span>
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
