import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useApi } from '../lib/useApi.jsx'
import { AssetImage, Loading, ErrorState, EmptyState } from '../components/ui.jsx'
import p from './page.module.css'
import s from './Agents.module.css'

// backgroundGradientColors are 8-char RRGGBBAA without '#'
const grad = (colors, angle = 135) => {
  if (!colors?.length) return 'var(--ink-800)'
  const stops = colors.map((c) => `#${c.slice(0, 6)}`)
  return `linear-gradient(${angle}deg, ${stops.join(', ')})`
}

export function Agents() {
  const { data, error, loading } = useApi('/agents?isPlayableCharacter=true')
  const [role, setRole] = useState('All')

  const roles = useMemo(() => {
    const set = new Set((data || []).map((a) => a.role?.displayName).filter(Boolean))
    return ['All', ...[...set].sort()]
  }, [data])

  const agents = useMemo(() => {
    const list = (data || []).slice().sort((a, b) => a.displayName.localeCompare(b.displayName))
    return role === 'All' ? list : list.filter((a) => a.role?.displayName === role)
  }, [data, role])

  return (
    <div>
      <header className={p.header}>
        <h1 className={p.title}>Agents</h1>
        <p className={p.lead}>Every playable agent and the kit they bring to a match.</p>
      </header>

      {loading && <Loading label="Loading agents" />}
      {error && <ErrorState error={error} onRetry={() => location.reload()} />}

      {!loading && !error && (
        <>
          <div className={p.filterBar}>
            {roles.map((r) => (
              <button
                key={r}
                className={`${p.chip} ${role === r ? p.chipOn : ''}`}
                onClick={() => setRole(r)}
              >
                {r}
              </button>
            ))}
            <span className={p.count} style={{ marginLeft: 'auto' }}>{agents.length} agents</span>
          </div>

          {agents.length === 0 ? (
            <EmptyState title="No agents in this role" />
          ) : (
            <div className={s.grid}>
              {agents.map((a) => (
                <Link to={`/agents/${a.uuid}`} className={s.card} key={a.uuid}
                  style={{ '--grad': grad(a.backgroundGradientColors) }}>
                  <img className={s.portrait} src={a.fullPortrait || a.displayIcon} alt="" loading="lazy" />
                  <div className={s.meta}>
                    <span className={s.role}>
                      {a.role?.displayIcon && <img src={a.role.displayIcon} alt="" />}
                      {a.role?.displayName}
                    </span>
                    <div className={s.name}>{a.displayName}</div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

const SLOT_LABEL = { Ability1: 'C', Ability2: 'Q', Grenade: 'E', Ultimate: 'X', Passive: '·' }

export function AgentDetail() {
  const { id } = useParams()
  const { data, error, loading } = useApi(`/agents/${id}`)

  if (loading) return <Loading label="Loading agent" />
  if (error) return <ErrorState error={error} onRetry={() => location.reload()} />
  if (!data) return <EmptyState title="Agent not found" />

  const abilities = (data.abilities || []).filter((ab) => ab.displayName)

  return (
    <div>
      <Link to="/agents" className={p.back}>← All agents</Link>

      <div className={s.hero}>
        <div className={s.heroBg} style={{ background: grad(data.backgroundGradientColors, 105) }} />
        <div className={s.heroText}>
          <span className={s.role} style={{ color: 'var(--acc-bright)' }}>
            {data.role?.displayIcon && <img src={data.role.displayIcon} alt="" />}
            {data.role?.displayName}
          </span>
          <h1 className={s.heroName}>{data.displayName}</h1>
          <p className={s.heroDesc}>{data.description}</p>
        </div>
        <div className={s.heroPortrait}>
          <img src={data.fullPortrait || data.bustPortrait} alt={data.displayName} />
        </div>
      </div>

      {data.role?.description && (
        <section className={p.section}>
          <h2 className={p.sectionTitle}>Role · {data.role.displayName}</h2>
          <p className={p.lead} style={{ fontSize: 'var(--step-0)' }}>{data.role.description}</p>
        </section>
      )}

      <section className={p.section}>
        <h2 className={p.sectionTitle}>Abilities</h2>
        <div className={s.abilities}>
          {abilities.map((ab) => (
            <div className={s.ability} key={ab.slot}>
              <div className={s.abilityIcon}>
                {ab.displayIcon
                  ? <img src={ab.displayIcon} alt="" />
                  : <span className={s.abilitySlot}>{SLOT_LABEL[ab.slot] || ''}</span>}
              </div>
              <div>
                <div className={s.abilitySlot}>{SLOT_LABEL[ab.slot] || ab.slot}</div>
                <div className={s.abilityName}>{ab.displayName}</div>
                <div className={s.abilityDesc}>{ab.description}</div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
