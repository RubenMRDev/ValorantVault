# VALORANT Vault

An interactive explorer for [valorant-api.com](https://valorant-api.com) — the community
data API for VALORANT. Built with React + Vite.

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

## Run

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production bundle in dist/
```

No API key needed — valorant-api.com is public and read-only. Responses are cached
in-memory per language for the session.
