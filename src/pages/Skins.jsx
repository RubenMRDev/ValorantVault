import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useApi } from '../lib/useApi.jsx'
import { Loading, ErrorState, EmptyState, AssetImage } from '../components/ui.jsx'
import { SkinCard } from '../components/SkinCard.jsx'
import p from './page.module.css'
import s from './Skins.module.css'

// contenttiers keyed by uuid → { highlightColor, displayIcon, displayName, rank }
function useTierMap() {
  const { data } = useApi('/contenttiers')
  return useMemo(() => {
    const map = {}
    for (const t of data || []) map[t.uuid] = t
    return map
  }, [data])
}

const PAGE = 48

export function Skins() {
  const { data, error, loading } = useApi('/weapons/skins')
  const tiers = useTierMap()
  const [q, setQ] = useState('')
  const [tier, setTier] = useState('All')
  const [limit, setLimit] = useState(PAGE)

  const tierChips = useMemo(() => {
    const list = Object.values(tiers).sort((a, b) => a.rank - b.rank)
    return ['All', ...list]
  }, [tiers])

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase()
    let list = (data || []).filter((sk) => sk.displayName && !/random favorit/i.test(sk.displayName))
    if (tier !== 'All') list = list.filter((sk) => sk.contentTierUuid === tier)
    if (term) list = list.filter((sk) => sk.displayName.toLowerCase().includes(term))
    return list
  }, [data, q, tier])

  const visible = filtered.slice(0, limit)
  const reset = (fn) => { fn(); setLimit(PAGE) }

  return (
    <div>
      <header className={p.header}>
        <h1 className={p.title}>Weapon Skins</h1>
        <p className={p.lead}>Every skin in the game, sorted by rarity. Open one for chromas, level upgrades and in-game video.</p>
      </header>

      {loading && <Loading label="Loading skins" />}
      {error && <ErrorState error={error} onRetry={() => location.reload()} />}

      {!loading && !error && (
        <>
          <div className={p.filterBar}>
            {tierChips.map((t) => {
              const key = t === 'All' ? 'All' : t.uuid
              const color = t !== 'All' && t.highlightColor ? `#${t.highlightColor.slice(0, 6)}` : undefined
              return (
                <button key={key}
                  className={`${p.chip} ${tier === key ? p.chipOn : ''}`}
                  style={tier === key && color ? { background: color, borderColor: color } : undefined}
                  onClick={() => reset(() => setTier(key))}>
                  {t === 'All' ? 'All' : (
                    <>{t.displayIcon && <img src={t.displayIcon} alt="" width={14} height={14} />}{t.displayName}</>
                  )}
                </button>
              )
            })}
            <input className={p.search} placeholder="Search skins…"
              value={q} onChange={(e) => reset(() => setQ(e.target.value))} />
          </div>

          <span className={p.count}>{filtered.length} skins</span>

          {filtered.length === 0 ? (
            <EmptyState title="No skins match" hint="Try another rarity or search term." />
          ) : (
            <>
              <div className={s.grid} style={{ marginTop: '1rem' }}>
                {visible.map((sk) => (
                  <SkinCard key={sk.uuid} skin={sk} tier={tiers[sk.contentTierUuid]} />
                ))}
              </div>
              {limit < filtered.length && (
                <button className={s.more} onClick={() => setLimit((l) => l + PAGE)}>
                  Load more ({filtered.length - limit} left)
                </button>
              )}
            </>
          )}
        </>
      )}
    </div>
  )
}

const prettyItem = (raw) => raw ? raw.split('::').pop().replace(/([a-z])([A-Z])/g, '$1 $2') : null

export function SkinDetail() {
  const { id } = useParams()
  const { data, error, loading } = useApi(`/weapons/skins/${id}`)
  const tiers = useTierMap()
  const [sel, setSel] = useState({ kind: 'chroma', i: 0 })

  if (loading) return <Loading label="Loading skin" />
  if (error) return <ErrorState error={error} onRetry={() => location.reload()} />
  if (!data) return <EmptyState title="Skin not found" />

  const tier = tiers[data.contentTierUuid]
  const color = tier?.highlightColor ? `#${tier.highlightColor.slice(0, 6)}` : undefined
  const chromas = data.chromas || []
  const levels = data.levels || []
  const current = sel.kind === 'chroma' ? chromas[sel.i] : levels[sel.i]
  const video = current?.streamedVideo
  const render = current?.fullRender || current?.displayIcon || data.displayIcon

  return (
    <div>
      <Link to="/skins" className={p.back}>← All skins</Link>

      <header className={p.header}>
        <h1 className={p.title} style={{ fontSize: 'var(--step-3)' }}>{data.displayName}</h1>
      </header>

      <div className={s.stage} style={{ '--glow': color ? color + '33' : undefined }}>
        {tier && (
          <span className={s.tierTag} style={{ color }}>
            {tier.displayIcon && <img src={tier.displayIcon} alt="" />}
            {tier.displayName}
          </span>
        )}
        {video
          ? <video key={video} src={video} controls autoPlay muted loop playsInline poster={render} />
          : <img className={s.render} src={render} alt={data.displayName} />}
      </div>

      {chromas.length > 1 && (
        <section className={p.section} style={{ marginTop: '1.6rem' }}>
          <h2 className={p.sectionTitle} style={{ fontSize: 'var(--step-1)' }}>Chromas</h2>
          <div className={s.variants}>
            {chromas.map((c, i) => (
              <button key={c.uuid}
                className={`${s.swatch} ${sel.kind === 'chroma' && sel.i === i ? s.swatchOn : ''}`}
                title={c.displayName}
                onClick={() => setSel({ kind: 'chroma', i })}>
                <img src={c.swatch || c.fullRender || data.displayIcon} alt={c.displayName} />
              </button>
            ))}
          </div>
        </section>
      )}

      {levels.length > 0 && (
        <section className={p.section} style={{ marginTop: '1.4rem' }}>
          <h2 className={p.sectionTitle} style={{ fontSize: 'var(--step-1)' }}>Level upgrades</h2>
          <div className={s.levelRow}>
            {levels.map((lv, i) => (
              <button key={lv.uuid}
                className={`${s.level} ${sel.kind === 'level' && sel.i === i ? s.levelOn : ''}`}
                onClick={() => setSel({ kind: 'level', i })}>
                Level {i + 1}
                {prettyItem(lv.levelItem) && <span style={{ color: 'var(--text-mute)' }}>· {prettyItem(lv.levelItem)}</span>}
                {lv.streamedVideo && <span className={s.playMark}>▶</span>}
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
