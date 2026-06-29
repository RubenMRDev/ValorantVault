// VALORANT battle pass math. The tier-cost ramp is the documented one; every XP
// figure below is a *default* the UI lets you override. The only live data is the
// act window, which the page pulls from valorant-api's /seasons endpoint.
// ponytail: defaults are community averages — all editable in the UI, tune freely.

export const TIERS = 50
export const EPILOGUE_TIERS = 5
export const MAX_TIER = TIERS + EPILOGUE_TIERS        // 55 = Epilogue 5
export const EPILOGUE_XP = 36500                      // per epilogue tier

const BASE_TIER_XP = 2000                             // cost tier 1 -> 2
const TIER_STEP = 750                                 // each later level-up +750

export const DEFAULTS = {
  weeklyXp: 30000,   // XP from one full week of weekly missions
  dailyXp: 0,        // XP from daily bonuses (first win of the day, etc.) per day
  boostPct: 0,       // overall XP boost applied to match XP, %
}

export const MODES = [
  { key: 'std', label: 'Unrated / Competitive', xp: 4100, minutes: 35 },
  { key: 'rush', label: 'Spike Rush', xp: 1000, minutes: 12 },
  { key: 'dm', label: 'Deathmatch', xp: 800, minutes: 7 },
]

export const levelUpCost = (t) => BASE_TIER_XP + (t - 1) * TIER_STEP
export const tierLabel = (t) => (t > TIERS ? `Epilogue ${t - TIERS}` : `Tier ${t}`)

// cumulative XP needed to reach a given tier from tier 1
// (tiers 1..50 normal, 51..55 = epilogue 1..5)
export function cumXp(tier) {
  let sum = 0
  const cap = Math.min(tier, TIERS)
  for (let t = 1; t < cap; t++) sum += levelUpCost(t)
  if (tier > TIERS) sum += (tier - TIERS) * EPILOGUE_XP
  return sum
}

// XP still owed inside the current tier before it ticks over
export const tierToNext = (tier) => (tier >= MAX_TIER ? 0 : tier >= TIERS ? EPILOGUE_XP : levelUpCost(tier))

export function plan({
  currentTier, goalTier, currentXp = 0, days = 0,
  weeklyXp = 0, dailyXp = 0, boostPct = 0, modes = MODES,
}) {
  const bpTotal = cumXp(goalTier)
  const have = cumXp(currentTier) + Math.max(0, currentXp)
  const weeks = days / 7

  const grossRemaining = Math.max(0, bpTotal - have)            // XP still owed to the pass
  const challengeBudget = Math.ceil(weeks) * Math.max(0, weeklyXp) + days * Math.max(0, dailyXp)
  const remaining = Math.max(0, grossRemaining - challengeBudget) // must come from matches
  const challengeXp = grossRemaining - remaining                  // challenge XP actually useful

  const perDay = days > 0 ? remaining / days : remaining
  const perWeek = weeks > 0 ? remaining / weeks : remaining
  const mult = 1 + Math.max(0, boostPct) / 100

  const modeRows = modes.map((m) => {
    const xp = Math.max(0, m.xp) * mult
    const games = xp > 0 ? Math.ceil(remaining / xp) : 0
    const minutes = games * Math.max(0, m.minutes)
    return {
      ...m,
      games,
      minutes,
      gamesPerDay: days > 0 ? games / days : games,
      hoursPerDay: (days > 0 ? minutes / days : minutes) / 60,
    }
  })

  return {
    bpTotal, have, grossRemaining, remaining, challengeXp,
    perDay, perWeek, weeks,
    remainingTiers: Math.max(0, goalTier - currentTier),
    modes: modeRows,
  }
}

// self-check (stripped from prod builds by Vite)
if (import.meta.env.DEV) {
  console.assert(cumXp(50) === 980000, 'reach tier 50 should cost 980,000 XP')
  console.assert(cumXp(MAX_TIER) === 1162500, 'full pass + epilogue = 1,162,500 XP')
  const r = plan({ currentTier: 1, goalTier: 50, days: 49 })
  console.assert(r.remaining === 980000 && r.remainingTiers === 49, 'plan baseline')
}
