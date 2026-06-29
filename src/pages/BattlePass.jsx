import { useMemo, useState } from 'react'
import { useApi } from '../lib/useApi.jsx'
import { Loading, ErrorState } from '../components/ui.jsx'
import { MODES, TIERS, levelUpCost, plan } from '../lib/battlepass.js'
import p from './page.module.css'
import s from './BattlePass.module.css'

const DAY = 86400000

// The current act = the Act-type season whose window contains now; otherwise the
// next upcoming act, otherwise the most recent one in the list.
function pickAct(seasons) {
  const now = Date.now()
  const acts = (seasons || []).filter((x) => x.type === 'EAresSeasonType::Act')
  const live = acts.find((a) => Date.parse(a.startTime) <= now && now < Date.parse(a.endTime))
  if (live) return live
  const next = acts
    .filter((a) => Date.parse(a.startTime) > now)
    .sort((a, b) => Date.parse(a.startTime) - Date.parse(b.startTime))[0]
  return next || acts.at(-1) || null
}

const nfmt = (n) => Math.round(n).toLocaleString()
const dfmt = (iso) =>
  new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })

export function BattlePass() {
  const { data, error, loading } = useApi('/seasons')
  const [tier, setTier] = useState(1)
  const [xpInto, setXpInto] = useState(0)
  const [epilogue, setEpilogue] = useState(false)
  const [weeklies, setWeeklies] = useState(true)

  const act = useMemo(() => pickAct(data), [data])
  const daysLeft = useMemo(
    () => (act ? Math.max(0, Math.ceil((Date.parse(act.endTime) - Date.now()) / DAY)) : 0),
    [act]
  )

  const tierCost = levelUpCost(Math.min(tier, TIERS - 1))
  const xp = Math.min(xpInto, tierCost)
  const result = useMemo(
    () => plan({ tier, xpInto: xp, epilogue, weeklies, daysLeft }),
    [tier, xp, epilogue, weeklies, daysLeft]
  )

  if (loading) return <Loading label="Loading season" />
  if (error) return <ErrorState error={error} onRetry={() => location.reload()} />

  const parent = data?.find((x) => x.uuid === act?.parentUuid)
  const done = result.remaining <= 0

  return (
    <div>
      <header className={p.header}>
        <h1 className={p.title}>Battle Pass Calculator</h1>
        <p className={p.lead}>
          How much you have to grind to max the pass before the act ends. Act dates are pulled
          live from valorant-api; the XP values are community averages.
        </p>
      </header>

      {act && (
        <div className={s.banner}>
          <div>
            <div className="kicker">{parent ? `${parent.displayName} · ` : ''}Current Act</div>
            <div className={s.actName}>{act.displayName}</div>
            <div className={s.actDates}>Ends {dfmt(act.endTime)}</div>
          </div>
          <div className={s.countdown}>
            <span className={s.countN}>{daysLeft}</span>
            <span className={s.countL}>days left · {result.weeksLeft.toFixed(1)} weeks</span>
          </div>
        </div>
      )}

      <div className={s.layout}>
        <div className={s.panel}>
          <label className={s.field}>
            <span className={s.fieldLabel}>Current tier <b>{tier}</b> <i>/ {TIERS}</i></span>
            <input className={s.range} type="range" min="1" max={TIERS} value={tier}
              onChange={(e) => setTier(+e.target.value)} />
          </label>

          <label className={s.field}>
            <span className={s.fieldLabel}>Progress into this tier <i>· {nfmt(tierCost)} to next</i></span>
            <input className={s.range} type="range" min="0" max={tierCost} step="100" value={xp}
              onChange={(e) => setXpInto(+e.target.value)} />
            <span className={s.fieldHint}>{nfmt(xp)} XP</span>
          </label>

          <label className={s.check}>
            <input type="checkbox" checked={weeklies} onChange={(e) => setWeeklies(e.target.checked)} />
            Count weekly missions <i>(~30k XP / week)</i>
          </label>
          <label className={s.check}>
            <input type="checkbox" checked={epilogue} onChange={(e) => setEpilogue(e.target.checked)} />
            Include epilogue <i>(5 extra tiers)</i>
          </label>
        </div>

        <div className={s.results}>
          <div className={s.summary}>
            <div className={s.sumItem}>
              <span className={s.sumN}>{done ? '0' : nfmt(result.remaining)}</span>
              <span className={s.sumL}>XP remaining</span>
            </div>
            <div className={s.sumItem}>
              <span className={s.sumN}>{done || daysLeft === 0 ? '—' : nfmt(result.perDay)}</span>
              <span className={s.sumL}>XP / day needed</span>
            </div>
          </div>

          {done ? (
            <div className={s.doneCard}>Pass complete for this selection 🎉</div>
          ) : (
            <div className={s.modes}>
              {result.modes.map((m) => (
                <div className={s.mode} key={m.key}>
                  <div className={s.modeName}>{m.label}</div>
                  <div className={s.modeBig}>{nfmt(m.games)} <small>games</small></div>
                  <div className={s.modeRow}>
                    <span>{daysLeft > 0 ? `${m.gamesPerDay.toFixed(1)} / day` : '—'}</span>
                    <span>{Math.round(m.hours)} h total</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <p className={s.disclaimer}>
        Averages: Unrated ~4,100 · Spike Rush ~1,000 · Deathmatch ~800 XP per match, on the
        documented tier ramp (2,000 XP rising +750 each tier). Unofficial fan tool, not
        affiliated with Riot Games.
      </p>
    </div>
  )
}
