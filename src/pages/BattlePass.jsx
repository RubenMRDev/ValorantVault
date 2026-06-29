import { useEffect, useMemo, useState } from 'react'
import { useApi } from '../lib/useApi.jsx'
import { Loading, ErrorState } from '../components/ui.jsx'
import {
  MODES, MAX_TIER, TIERS, DEFAULTS, tierLabel, tierToNext, plan,
} from '../lib/battlepass.js'
import p from './page.module.css'
import s from './BattlePass.module.css'

const DAY = 86400000
const num = (v) => { const n = parseFloat(v); return isNaN(n) ? 0 : n }
const nfmt = (n) => Math.round(n).toLocaleString()
const hm = (mins) => `${Math.floor(mins / 60)}h ${Math.round(mins % 60)}m`
const toInput = (iso) => (iso ? new Date(iso).toISOString().slice(0, 10) : '')
const TIER_OPTS = Array.from({ length: MAX_TIER }, (_, i) => i + 1)

// current act = the Act-type season whose window contains now; else next upcoming; else latest
function pickAct(seasons) {
  const now = Date.now()
  const acts = (seasons || []).filter((x) => x.type === 'EAresSeasonType::Act')
  const live = acts.find((a) => Date.parse(a.startTime) <= now && now < Date.parse(a.endTime))
  if (live) return live
  const next = acts.filter((a) => Date.parse(a.startTime) > now)
    .sort((a, b) => Date.parse(a.startTime) - Date.parse(b.startTime))[0]
  return next || acts.at(-1) || null
}

export function BattlePass() {
  const { data, error, loading } = useApi('/seasons')
  const act = useMemo(() => pickAct(data), [data])
  const parent = data?.find((x) => x.uuid === act?.parentUuid)

  // --- progress ---
  const [currentTier, setCurrentTier] = useState(1)
  const [goalTier, setGoalTier] = useState(TIERS)
  const [xpLeft, setXpLeft] = useState(String(tierToNext(1))) // XP left to next tier (typeable)

  // --- act window (prefilled from API, editable) ---
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  // --- bonus XP (all customizable) ---
  const [weeklyOn, setWeeklyOn] = useState(true)
  const [weeklyXp, setWeeklyXp] = useState(String(DEFAULTS.weeklyXp))
  const [dailyXp, setDailyXp] = useState(String(DEFAULTS.dailyXp))
  const [boostPct, setBoostPct] = useState(String(DEFAULTS.boostPct))

  // --- per-mode XP / match length (customizable) ---
  const [modeCfg, setModeCfg] = useState(
    MODES.map((m) => ({ ...m, xp: String(m.xp), minutes: String(m.minutes) }))
  )

  // prefill dates once the act resolves
  useEffect(() => {
    if (act) { setStartDate(toInput(act.startTime)); setEndDate(toInput(act.endTime)) }
  }, [act])

  // reset "XP to next" whenever the current tier changes
  useEffect(() => { setXpLeft(String(tierToNext(currentTier))) }, [currentTier])

  const toNext = tierToNext(currentTier)
  const days = useMemo(() => {
    const end = Date.parse(endDate)
    if (isNaN(end)) return 0
    const start = Date.parse(startDate)
    const from = Math.max(Date.now(), isNaN(start) ? Date.now() : start)
    return Math.max(0, Math.ceil((end - from) / DAY))
  }, [startDate, endDate])

  const result = useMemo(() => plan({
    currentTier,
    goalTier,
    currentXp: Math.min(toNext, Math.max(0, toNext - num(xpLeft))),
    days,
    weeklyXp: weeklyOn ? num(weeklyXp) : 0,
    dailyXp: num(dailyXp),
    boostPct: num(boostPct),
    modes: modeCfg.map((m) => ({ ...m, xp: num(m.xp), minutes: num(m.minutes) })),
  }), [currentTier, goalTier, toNext, xpLeft, days, weeklyOn, weeklyXp, dailyXp, boostPct, modeCfg])

  if (loading) return <Loading label="Loading season" />
  if (error) return <ErrorState error={error} onRetry={() => location.reload()} />

  const done = result.remaining <= 0
  const setMode = (key, field, val) =>
    setModeCfg((cfg) => cfg.map((m) => (m.key === key ? { ...m, [field]: val } : m)))

  return (
    <div>
      <header className={p.header}>
        <h1 className={p.title}>Battle Pass Calculator</h1>
        <p className={p.lead}>
          Set your tier and the XP left to your next tier, confirm the act dates, tweak the bonus
          XP — and see exactly how many games you must play to finish the pass in time.
        </p>
      </header>

      {act && (
        <div className={s.banner}>
          <div>
            <div className="kicker">{parent ? `${parent.displayName} · ` : ''}Current Act</div>
            <div className={s.actName}>{act.displayName}</div>
          </div>
          <div className={s.countdown}>
            <span className={s.countN}>{days}</span>
            <span className={s.countL}>days left · {result.weeks.toFixed(1)} weeks</span>
          </div>
        </div>
      )}

      <div className={s.layout}>
        {/* ---------------- inputs ---------------- */}
        <div className={s.panel}>
          <fieldset className={s.group}>
            <legend className={s.legend}>1 · Your progress</legend>
            <div className={s.row2}>
              <label className={s.field}>
                <span className={s.fieldLabel}>Current tier</span>
                <select className={s.select} value={currentTier}
                  onChange={(e) => setCurrentTier(+e.target.value)}>
                  {TIER_OPTS.map((t) => <option key={t} value={t}>{tierLabel(t)}</option>)}
                </select>
              </label>
              <label className={s.field}>
                <span className={s.fieldLabel}>Tier goal</span>
                <select className={s.select} value={goalTier}
                  onChange={(e) => setGoalTier(+e.target.value)}>
                  {TIER_OPTS.map((t) => <option key={t} value={t}>{tierLabel(t)}</option>)}
                </select>
              </label>
            </div>

            <label className={s.field}>
              <span className={s.fieldLabel}>
                XP left to next tier <i>· of {nfmt(toNext)}</i>
              </span>
              <input className={s.input} type="number" min="0" max={toNext} inputMode="numeric"
                value={xpLeft} onChange={(e) => setXpLeft(e.target.value)} />
              <input className={s.range} type="range" min="0" max={toNext} step="50"
                value={Math.min(num(xpLeft), toNext)}
                onChange={(e) => setXpLeft(e.target.value)} />
            </label>
          </fieldset>

          <fieldset className={s.group}>
            <legend className={s.legend}>2 · Act dates</legend>
            <div className={s.row2}>
              <label className={s.field}>
                <span className={s.fieldLabel}>Start</span>
                <input className={s.input} type="date" value={startDate}
                  onChange={(e) => setStartDate(e.target.value)} />
              </label>
              <label className={s.field}>
                <span className={s.fieldLabel}>End</span>
                <input className={s.input} type="date" value={endDate}
                  onChange={(e) => setEndDate(e.target.value)} />
              </label>
            </div>
            <span className={s.note}>Prefilled from valorant-api — edit if you want a custom window.</span>
          </fieldset>

          <fieldset className={s.group}>
            <legend className={s.legend}>3 · Bonus XP <i>(customizable)</i></legend>
            <label className={s.check}>
              <input type="checkbox" checked={weeklyOn} onChange={(e) => setWeeklyOn(e.target.checked)} />
              Count weekly missions
            </label>
            <div className={s.row2}>
              <label className={s.field}>
                <span className={s.fieldLabel}>Weekly XP <i>/ week</i></span>
                <input className={s.input} type="number" min="0" inputMode="numeric"
                  value={weeklyXp} disabled={!weeklyOn}
                  onChange={(e) => setWeeklyXp(e.target.value)} />
              </label>
              <label className={s.field}>
                <span className={s.fieldLabel}>Daily bonus XP <i>/ day</i></span>
                <input className={s.input} type="number" min="0" inputMode="numeric"
                  value={dailyXp} onChange={(e) => setDailyXp(e.target.value)} />
              </label>
            </div>
            <label className={s.field}>
              <span className={s.fieldLabel}>XP boost <i>· % on match XP</i></span>
              <input className={s.input} type="number" min="0" inputMode="numeric"
                value={boostPct} onChange={(e) => setBoostPct(e.target.value)} />
            </label>
          </fieldset>
        </div>

        {/* ---------------- results ---------------- */}
        <div className={s.results}>
          <div className={s.summary}>
            <div className={`${s.sumItem} ${s.sumLead}`}>
              <span className={s.sumN}>{nfmt(result.remaining)}</span>
              <span className={s.sumL}>XP to grind in matches</span>
            </div>
            <div className={s.sumItem}>
              <span className={s.sumN}>{done || days === 0 ? '—' : nfmt(result.perDay)}</span>
              <span className={s.sumL}>XP / day</span>
            </div>
            <div className={s.sumItem}>
              <span className={s.sumN}>{done || days === 0 ? '—' : nfmt(result.perWeek)}</span>
              <span className={s.sumL}>XP / week</span>
            </div>
          </div>

          <div className={s.stripe}>
            <span><b>{nfmt(result.bpTotal)}</b> pass total</span>
            <span><b>{nfmt(result.challengeXp)}</b> from challenges</span>
            <span><b>{result.remainingTiers}</b> tiers left</span>
          </div>

          {done ? (
            <div className={s.doneCard}>You'll reach your goal with XP to spare 🎉</div>
          ) : (
            <table className={s.table}>
              <thead>
                <tr>
                  <th>Mode</th><th>XP/match</th><th>Min</th>
                  <th>Games</th><th>Total</th><th>/ day</th>
                </tr>
              </thead>
              <tbody>
                {result.modes.map((m) => (
                  <tr key={m.key}>
                    <td className={s.modeCell}>{m.label}</td>
                    <td>
                      <input className={s.cellInput} type="number" min="0" value={m.xp}
                        onChange={(e) => setMode(m.key, 'xp', e.target.value)} />
                    </td>
                    <td>
                      <input className={s.cellInput} type="number" min="0" value={m.minutes}
                        onChange={(e) => setMode(m.key, 'minutes', e.target.value)} />
                    </td>
                    <td className={s.big}>{nfmt(m.games)}</td>
                    <td>{hm(m.minutes)}</td>
                    <td>{days > 0 ? `${m.gamesPerDay.toFixed(1)}` : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <p className={s.disclaimer}>
        Defaults are community averages on the documented tier ramp (2,000 XP rising +750 each tier;
        epilogue 36,500/tier). Every XP value above is editable. Unofficial fan tool, not affiliated
        with Riot Games.
      </p>
    </div>
  )
}
