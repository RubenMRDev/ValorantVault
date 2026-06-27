import { Link, useParams } from 'react-router-dom'
import { useApi } from '../lib/useApi.jsx'
import { Loading, ErrorState, EmptyState } from '../components/ui.jsx'
import p from './page.module.css'
import s from './Maps.module.css'

export function Maps() {
  const { data, error, loading } = useApi('/maps')

  if (loading) return <Loading label="Loading maps" />
  if (error) return <ErrorState error={error} onRetry={() => location.reload()} />

  const maps = (data || []).filter((m) => m.splash && m.coordinates)

  return (
    <div>
      <header className={p.header}>
        <h1 className={p.title}>Maps</h1>
        <p className={p.lead}>Every playable map with its splash art, minimap and callouts.</p>
      </header>
      <div className={s.grid}>
        {maps.map((m) => (
          <Link to={`/maps/${m.uuid}`} className={s.card} key={m.uuid}>
            <img src={m.splash} alt={m.displayName} loading="lazy" />
            <div className={s.cardMeta}>
              <div className={s.cardCoord}>{m.coordinates}</div>
              <div className={s.cardName}>{m.displayName}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

export function MapDetail() {
  const { id } = useParams()
  const { data, error, loading } = useApi(`/maps/${id}`)

  if (loading) return <Loading label="Loading map" />
  if (error) return <ErrorState error={error} onRetry={() => location.reload()} />
  if (!data) return <EmptyState title="Map not found" />

  // Game-world callout coords → minimap fraction (0..1). Transform per the
  // API's per-map multipliers. ponytail: known VALORANT mapping; if a dot
  // lands off, the multipliers are the knob to tune, not this code.
  const named = (data.callouts || []).filter((c) => c.regionName && c.location)
  const place = (loc) => ({
    left: `${(loc.y * data.xMultiplier + data.xScalarToAdd) * 100}%`,
    top: `${(loc.x * data.yMultiplier + data.yScalarToAdd) * 100}%`,
  })

  return (
    <div>
      <Link to="/maps" className={p.back}>← All maps</Link>

      <div className={s.splash}>
        <img src={data.splash} alt={data.displayName} />
        <div className={s.splashName}>{data.displayName}</div>
      </div>

      {data.tacticalDescription && (
        <p className={p.lead} style={{ marginTop: '1.4rem' }}>{data.tacticalDescription}</p>
      )}

      <div className={p.detailGrid} style={{ marginTop: '2rem' }}>
        <div>
          <h2 className={p.sectionTitle}>Minimap</h2>
          {data.displayIcon ? (
            <div className={s.minimapWrap}>
              <img src={data.displayIcon} alt={`${data.displayName} minimap`} />
              {named.map((c, i) => (
                <span className={s.dot} key={i} style={place(c.location)}>
                  <span>{c.regionName}{c.superRegionName ? ` ${c.superRegionName}` : ''}</span>
                </span>
              ))}
            </div>
          ) : (
            <EmptyState title="No minimap" />
          )}
        </div>

        <div>
          <h2 className={p.sectionTitle}>{named.length} Callouts</h2>
          {named.length > 0 ? (
            <div className={s.calloutList}>
              {named.map((c, i) => (
                <div className={s.calloutItem} key={i}>
                  <b>{c.regionName}</b>{c.superRegionName ? ` · ${c.superRegionName}` : ''}
                </div>
              ))}
            </div>
          ) : (
            <p className={p.lead} style={{ fontSize: 'var(--step-0)' }}>This map has no named callouts.</p>
          )}
        </div>
      </div>
    </div>
  )
}
