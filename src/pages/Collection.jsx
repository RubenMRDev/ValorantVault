import { useMemo, useState } from 'react'
import { RESOURCES } from '../lib/api.js'
import { useApi } from '../lib/useApi.jsx'
import { AssetImage, Loading, ErrorState, EmptyState } from '../components/ui.jsx'
import p from './page.module.css'

// per-collection presentation hints
const MEDIA = {
  playercards: { ratio: 0.72, cover: true, min: 170, img: (x) => x.largeArt || x.displayIcon },
  sprays: { ratio: 1, pad: true, min: 150 },
  buddies: { ratio: 1, pad: true, min: 140 },
  bundles: { ratio: 1.6, cover: true, min: 280 },
  gamemodes: { ratio: 1.4, pad: true, min: 220 },
  currencies: { ratio: 1, pad: true, min: 150 },
  gear: { ratio: 1, pad: true, min: 200 },
  sprays_titles: { text: true, min: 240 },
}

export function Collection({ resourceKey }) {
  const cfg = RESOURCES[resourceKey]
  const media = MEDIA[resourceKey] || { ratio: 1 }
  const { data, error, loading } = useApi(cfg.path)
  const [q, setQ] = useState('')

  const items = useMemo(() => {
    if (!data) return []
    const term = q.trim().toLowerCase()
    const base = data.filter((d) => (cfg.title(d) || '').trim())
    if (!term) return base
    return base.filter((d) => (cfg.title(d) || '').toLowerCase().includes(term))
  }, [data, q, cfg])

  return (
    <div>
      <header className={p.header}>
        <h1 className={p.title}>{cfg.label}</h1>
        <p className={p.lead}>{cfg.blurb}</p>
      </header>

      {!loading && !error && (
        <div className={p.filterBar}>
          <span className={p.count}>{items.length} entries</span>
          <input
            className={p.search}
            placeholder={`Filter ${cfg.label.toLowerCase()}…`}
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
      )}

      {loading && <Loading label={`Loading ${cfg.label.toLowerCase()}`} />}
      {error && <ErrorState error={error} onRetry={() => location.reload()} />}
      {!loading && !error && items.length === 0 && (
        <EmptyState title="No matches" hint="Try a different search term." />
      )}

      {!loading && !error && items.length > 0 && (
        <div className={p.grid} style={{ '--card-min': `${media.min || 200}px` }}>
          {items.map((it) => {
            const img = (media.img || cfg.image)?.(it)
            const sub = cfg.sub?.(it)
            return (
              <article className={p.card} key={it.uuid}>
                {media.text ? (
                  <div className={p.cardMedia} style={{ '--media-ratio': 1.6, display: 'grid', placeItems: 'center', padding: '1rem', textAlign: 'center' }}>
                    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.3rem', letterSpacing: '0.04em' }}>
                      {sub || it.displayName}
                    </span>
                  </div>
                ) : (
                  <AssetImage
                    src={img}
                    alt={cfg.title(it)}
                    cover={media.cover}
                    className={`${p.cardMedia} ${media.pad ? p.cardMediaPad : ''}`}
                    style={{ '--media-ratio': media.ratio }}
                  />
                )}
                <div className={p.cardBody}>
                  <div className={p.cardTitle}>{cfg.title(it)}</div>
                  {sub && !media.text && <div className={p.cardSub}>{sub}</div>}
                </div>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}
