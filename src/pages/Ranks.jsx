import { useApi } from '../lib/useApi.jsx'
import { Loading, ErrorState, EmptyState } from '../components/ui.jsx'
import p from './page.module.css'
import s from './Ranks.module.css'

const hex = (c) => (c && c !== '0' ? `#${c.slice(0, 6)}` : undefined)

export function Ranks() {
  const { data, error, loading } = useApi('/competitivetiers')

  if (loading) return <Loading label="Loading ranks" />
  if (error) return <ErrorState error={error} onRetry={() => location.reload()} />

  // last entry = current ranked ladder; skip the Unranked placeholder (tier 0)
  const latest = (data || []).at(-1)
  const tiers = (latest?.tiers || []).filter((t) => t.tier > 0 && t.largeIcon)

  // group by division (Iron, Bronze, …) for readable headers
  const groups = []
  for (const t of tiers) {
    const name = t.divisionName || 'Tier'
    let g = groups.find((x) => x.name === name)
    if (!g) { g = { name, items: [] }; groups.push(g) }
    g.items.push(t)
  }

  if (tiers.length === 0) return <EmptyState title="No tier data" />

  return (
    <div>
      <header className={p.header}>
        <h1 className={p.title}>Competitive Ranks</h1>
        <p className={p.lead}>The current ranked ladder, Iron through Radiant, with each tier’s in-game color.</p>
      </header>

      <div className={s.grid}>
        {groups.map((g) => (
          <div key={g.name} style={{ display: 'contents' }}>
            <div className={s.divHead}>{g.name}</div>
            {g.items.map((t) => {
              const color = hex(t.color)
              return (
                <div className={s.tier} key={t.tier}
                  style={{ '--rank': color, '--glow': color ? color + '26' : 'transparent' }}>
                  <img src={t.largeIcon} alt={t.tierName} loading="lazy" />
                  <div>
                    <div className={s.tname}>{t.divisionName}</div>
                    {/^\D*\d/.test(t.tierName) && (
                      <div className={s.division}>{t.tierName}</div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
