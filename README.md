# VALORANT Vault

An interactive explorer for [valorant-api.com](https://valorant-api.com) — the community
data API for VALORANT. Built with React + Vite.

### 🔴 [Live preview → valorant-vault-iota.vercel.app](https://valorant-vault-iota.vercel.app/)

---

## What it covers

- **Agents** — role-filtered roster, detail pages with full ability kits and per-agent color theming.
- **Weapons** — armory with stats and damage-falloff tables, plus every skin per weapon.
- **Skins** — 1,300+ skins by rarity, with chroma swatches, level upgrades and **in-game video previews**.
- **Maps** — splash art, minimaps with tactical callouts plotted in place.
- **Ranks** — the competitive ladder, Iron to Radiant, in each tier's own color.
- **Cosmetics** — player cards, sprays, gun buddies, bundles, titles, currencies, gear.
- **Cmd/Ctrl-K search** across agents, weapons, skins and maps.
- **18 languages** via the API's `language` parameter (switcher in the top bar).
- Live game build version pulled from `/v1/version`.

## Tech stack

- [React 18](https://react.dev) + [Vite 5](https://vitejs.dev)
- [React Router 6](https://reactrouter.com) for routing
- CSS Modules for styling — no UI framework
- Data from [valorant-api.com](https://valorant-api.com) (public, no key)

## Run locally

```bash
git clone https://github.com/RubenMRDev/ValorantApi.git
cd ValorantApi
npm install
npm run dev      # http://localhost:5173
```

```bash
npm run build    # production bundle in dist/
npm run preview  # serve the built bundle locally
```

No API key needed — valorant-api.com is public and read-only. Responses are cached
in-memory per language for the session.

## Project structure

```
src/
├── pages/        # Agents, Weapons, Skins, Maps, Ranks, Collection, Home
├── components/   # Layout, SearchPalette, SkinCard, shared UI
├── lib/          # api.js (fetch + cache), useApi hook
└── styles/       # global styles
```

## Credits

Game data and assets from [valorant-api.com](https://valorant-api.com).
VALORANT is a trademark of Riot Games — this is an unofficial fan project.
