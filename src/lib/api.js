// Data layer for valorant-api.com (v1). Read-only static game data, so a
// module-level cache keyed by url is all we need — no react-query.
// ponytail: in-memory Map cache; swap for a real query lib only if we add mutations.

const BASE = 'https://valorant-api.com/v1'

// Languages the API serves. value -> label shown in the switcher.
export const LANGUAGES = [
  { code: 'en-US', label: 'English' },
  { code: 'es-ES', label: 'Español' },
  { code: 'es-MX', label: 'Español (MX)' },
  { code: 'fr-FR', label: 'Français' },
  { code: 'de-DE', label: 'Deutsch' },
  { code: 'it-IT', label: 'Italiano' },
  { code: 'pt-BR', label: 'Português' },
  { code: 'ru-RU', label: 'Русский' },
  { code: 'tr-TR', label: 'Türkçe' },
  { code: 'pl-PL', label: 'Polski' },
  { code: 'ja-JP', label: '日本語' },
  { code: 'ko-KR', label: '한국어' },
  { code: 'zh-CN', label: '简体中文' },
  { code: 'zh-TW', label: '繁體中文' },
  { code: 'ar-AE', label: 'العربية' },
  { code: 'th-TH', label: 'ไทย' },
  { code: 'vi-VN', label: 'Tiếng Việt' },
  { code: 'id-ID', label: 'Indonesia' },
]

const cache = new Map()

export async function apiGet(path, language = 'en-US') {
  const url = `${BASE}${path}${path.includes('?') ? '&' : '?'}language=${language}`
  if (cache.has(url)) return cache.get(url)
  const p = fetch(url)
    .then(async (r) => {
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      const json = await r.json()
      return json.data
    })
    .catch((err) => {
      cache.delete(url) // let a retry try again
      throw err
    })
  cache.set(url, p)
  return p
}

/* ----------------------------------------------------------------
   Resource registry. Each entry drives a route, the nav, the global
   search index, and (for simple ones) a generic gallery page.
   `image(item)` / `title(item)` / `sub(item)` keep the generic
   Collection page from needing to know each schema.
   ---------------------------------------------------------------- */
export const RESOURCES = {
  agents: {
    path: '/agents?isPlayableCharacter=true',
    label: 'Agents',
    blurb: 'Duelists, controllers, sentinels and initiators, with every ability.',
    title: (a) => a.displayName,
    sub: (a) => a.role?.displayName,
    image: (a) => a.displayIcon,
  },
  weapons: {
    path: '/weapons',
    label: 'Weapons',
    blurb: 'Every weapon, its stats, and the skins built on it.',
    title: (w) => w.displayName,
    sub: (w) => w.shopData?.categoryText,
    image: (w) => w.displayIcon,
  },
  skins: {
    path: '/weapons/skins',
    label: 'Skins',
    blurb: '1,300+ weapon skins with chromas, level upgrades and video previews.',
    title: (s) => s.displayName,
    image: (s) => s.chromas?.[0]?.fullRender || s.displayIcon,
  },
  maps: {
    path: '/maps',
    label: 'Maps',
    blurb: 'Playable maps with splash art, minimaps and tactical callouts.',
    title: (m) => m.displayName,
    sub: (m) => m.coordinates,
    image: (m) => m.splash,
  },
  playercards: {
    path: '/playercards',
    label: 'Player Cards',
    blurb: 'Identity banners shown beside your name in the lobby.',
    title: (c) => c.displayName,
    image: (c) => c.largeArt || c.displayIcon,
  },
  sprays: {
    path: '/sprays',
    label: 'Sprays',
    blurb: 'Tag the walls. Every spray and its level art.',
    title: (s) => s.displayName,
    image: (s) => s.fullTransparentIcon || s.displayIcon,
  },
  buddies: {
    path: '/buddies',
    label: 'Gun Buddies',
    blurb: 'Charms that dangle off your weapon.',
    title: (b) => b.displayName,
    image: (b) => b.displayIcon,
  },
  bundles: {
    path: '/bundles',
    label: 'Bundles',
    blurb: 'Themed store collections of skins, sprays and accessories.',
    title: (b) => b.displayName,
    image: (b) => b.displayIcon,
  },
  sprays_titles: {
    path: '/playertitles',
    label: 'Player Titles',
    blurb: 'The flair that trails your name.',
    title: (t) => t.displayName,
    sub: (t) => t.titleText,
    image: () => null,
  },
  competitivetiers: {
    path: '/competitivetiers',
    label: 'Ranks',
    blurb: 'The full competitive ladder, Iron to Radiant.',
  },
  gamemodes: {
    path: '/gamemodes',
    label: 'Game Modes',
    blurb: 'Every way to queue, from Unrated to Deathmatch.',
    title: (g) => g.displayName,
    sub: (g) => g.duration,
    image: (g) => g.displayIcon,
  },
  currencies: {
    path: '/currencies',
    label: 'Currencies',
    blurb: 'VP, Radianite and Kingdom Credits.',
    title: (c) => c.displayName,
    image: (c) => c.displayIcon,
  },
  gear: {
    path: '/gear',
    label: 'Gear',
    blurb: 'Shields and armor available in the buy phase.',
    title: (g) => g.displayName,
    sub: (g) => g.shopData?.cost != null ? `${g.shopData.cost} creds` : null,
    image: (g) => g.displayIcon,
  },
}

// Categories that render with the generic gallery grid.
export const COLLECTION_KEYS = [
  'playercards', 'sprays', 'buddies', 'bundles',
  'sprays_titles', 'gamemodes', 'currencies', 'gear',
]
