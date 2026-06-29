// VALORANT battle pass math. The tier-cost ramp is the documented one; the
// per-match XP figures are community averages. The only *live* data is the act
// end date, which the page pulls from valorant-api's /seasons endpoint.
// ponytail: averages, not exact — tune MODES[].xp / WEEKLY_XP / EPILOGUE_XP here.

export const TIERS = 50
export const EPILOGUE_TIERS = 5
export const EPILOGUE_XP = 36500            // per epilogue tier
export const WEEKLY_XP = 30000              // est. XP from a full week of missions

const BASE_TIER_XP = 2000                   // cost to go from tier 1 -> 2
const TIER_STEP = 750                       // each later level-up costs +750

export const MODES = [
  { key: 'std', label: 'Unrated / Competitive', xp: 4100, minutes: 35 },
  { key: 'rush', label: 'Spike Rush', xp: 1000, minutes: 12 },
  { key: 'dm', label: 'Deathmatch', xp: 800, minutes: 7 },
]

// XP to advance from tier t to t+1 (t = 1..49)
export const levelUpCost = (t) => BASE_TIER_XP + (t - 1) * TIER_STEP

// total tier XP needed to climb from `tier` up to tier 50
export function tierXpFrom(tier) {
  let sum = 0
  for (let t = Math.max(1, tier); t < TIERS; t++) sum += levelUpCost(t)
  return sum
}

// Given progress + options + days left in the act, return what's left to grind
// and how many games / hours that is per mode.
export function plan({ tier, xpInto = 0, epilogue = false, weeklies = false, daysLeft = 0 }) {
  let remaining = tierXpFrom(tier) - Math.max(0, xpInto)
  if (epilogue) remaining += EPILOGUE_TIERS * EPILOGUE_XP
  remaining = Math.max(0, remaining)

  const weeksLeft = daysLeft / 7
  if (weeklies) remaining = Math.max(0, remaining - Math.ceil(weeksLeft) * WEEKLY_XP)

  const perDay = daysLeft > 0 ? remaining / daysLeft : remaining
  const modes = MODES.map((m) => {
    const games = Math.ceil(remaining / m.xp)
    return {
      ...m,
      games,
      gamesPerDay: daysLeft > 0 ? games / daysLeft : games,
      hours: (games * m.minutes) / 60,
    }
  })
  return { remaining, perDay, weeksLeft, modes }
}

// self-check (stripped from prod builds by Vite)
if (import.meta.env.DEV) {
  console.assert(tierXpFrom(1) === 980000, 'tier 1->50 should total 980,000 XP')
  console.assert(levelUpCost(1) === 2000 && levelUpCost(2) === 2750, 'tier ramp +750')
  console.assert(plan({ tier: 50, daysLeft: 10 }).remaining === 0, 'tier 50 = done')
}
