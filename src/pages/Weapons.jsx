import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useApi } from '../lib/useApi.jsx'
import { Loading, ErrorState, EmptyState } from '../components/ui.jsx'
import { SkinCard } from '../components/SkinCard.jsx'
import p from './page.module.css'
import s from './Weapons.module.css'

export function Weapons() {
  const { data, error, loading } = useApi('/weapons')
  const [cat, setCat] = useState('All')

  const cats = useMemo(() => {
    const set = new Set((data || []).map((w) => w.shopData?.categoryText).filter(Boolean))
    return ['All', ...[...set]]
  }, [data])

  const weapons = useMemo(() => {
    const list = (data || []).slice().sort(
      (a, b) => (a.shopData?.shopOrderPriority ?? 99) - (b.shopData?.shopOrderPriority ?? 99)
    )
    return cat === 'All' ? list : list.filter((w) => w.shopData?.categoryText === cat)
  }, [data, cat])

  return (
    <div>
      <header className={p.header}>
        <h1 className={p.title}>Weapons</h1>
        <p className={p.lead}>The full armory. Open any weapon for stats, damage falloff and its skins.</p>
      </header>

      {loading && <Loading label="Loading weapons" />}
      {error && <ErrorState error={error} onRetry={() => location.reload()} />}

      {!loading && !error && (
        <>
          <div className={p.filterBar}>
            {cats.map((c) => (
              <button key={c} className={`${p.chip} ${cat === c ? p.chipOn : ''}`} onClick={() => setCat(c)}>
                {c}
              </button>
            ))}
          </div>
          <div className={s.grid}>
            {weapons.map((w) => (
              <Link to={`/weapons/${w.uuid}`} className={s.card} key={w.uuid}>
                <img className="weapon" src={w.displayIcon} alt={w.displayName} loading="lazy" />
                <div className={s.wname}>{w.displayName}</div>
                <div className={s.wmeta}>
                  <span className={s.wcat}>{w.shopData?.categoryText || 'Melee'}</span>
                  {w.shopData?.cost != null && <span className={s.wcost}>{w.shopData.cost} ¢</span>}
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

const Stat = ({ value, label }) => (
  <div className={s.stat}>
    <div className={s.statVal}>{value}</div>
    <div className={s.statLabel}>{label}</div>
  </div>
)

export function WeaponDetail() {
  const { id } = useParams()
  const { data, error, loading } = useApi(`/weapons/${id}`)
  const tiers = useApi('/contenttiers').data
  const tierMap = useMemo(() => {
    const m = {}; for (const t of tiers || []) m[t.uuid] = t; return m
  }, [tiers])

  if (loading) return <Loading label="Loading weapon" />
  if (error) return <ErrorState error={error} onRetry={() => location.reload()} />
  if (!data) return <EmptyState title="Weapon not found" />

  const st = data.weaponStats
  const skins = (data.skins || []).filter(
    (sk) => sk.displayName && !/standard|random favorit/i.test(sk.displayName)
  )

  return (
    <div>
      <Link to="/weapons" className={p.back}>← All weapons</Link>

      <div className={s.detailHead}>
        <img className="hero" src={data.displayIcon} alt={data.displayName} />
        <div>
          <span className="kicker">{data.shopData?.categoryText || 'Melee'}</span>
          <h1 className={p.title} style={{ fontSize: 'var(--step-3)' }}>{data.displayName}</h1>
          {data.shopData?.cost != null && (
            <p className={p.lead} style={{ fontSize: 'var(--step-0)', color: 'var(--gold)' }}>
              {data.shopData.cost} credits
            </p>
          )}
          {st && (
            <div className={s.statGrid}>
              {st.magazineSize != null && <Stat value={st.magazineSize} label="Magazine" />}
              {st.fireRate != null && <Stat value={st.fireRate} label="Fire rate /s" />}
              {st.reloadTimeSeconds != null && <Stat value={`${st.reloadTimeSeconds}s`} label="Reload" />}
              {st.equipTimeSeconds != null && <Stat value={`${st.equipTimeSeconds}s`} label="Equip" />}
              {st.wallPenetration && <Stat value={st.wallPenetration.split('::').pop()} label="Wall pen" />}
            </div>
          )}
        </div>
      </div>

      {st?.damageRanges?.length > 0 && (
        <section className={p.section}>
          <h2 className={p.sectionTitle}>Damage falloff</h2>
          <div style={{ overflowX: 'auto' }}>
            <table className={s.table}>
              <thead>
                <tr>
                  <th>Range (m)</th>
                  <th className={s.head}>Head</th>
                  <th>Body</th>
                  <th>Leg</th>
                </tr>
              </thead>
              <tbody>
                {st.damageRanges.map((r, i) => (
                  <tr key={i}>
                    <td>{r.rangeStartMeters} – {r.rangeEndMeters}</td>
                    <td className={s.head}>{Math.round(r.headDamage)}</td>
                    <td>{Math.round(r.bodyDamage)}</td>
                    <td>{Math.round(r.legDamage)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section className={p.section}>
        <h2 className={p.sectionTitle}>{skins.length} Skins</h2>
        <div className={s.grid} style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}>
          {skins.map((sk) => (
            <SkinCard key={sk.uuid} skin={sk} tier={tierMap[sk.contentTierUuid]} />
          ))}
        </div>
      </section>
    </div>
  )
}
