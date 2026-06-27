import { Link } from 'react-router-dom'
import { useApi } from '../lib/useApi.jsx'
import s from './Home.module.css'

const grad = (colors) =>
  colors?.length ? `linear-gradient(140deg, ${colors.map((c) => `#${c.slice(0, 6)}`).join(', ')})` : 'var(--ink-800)'

const TILES = [
  ['/agents', 'Agents', 'Every duelist, controller, sentinel and initiator, with full ability breakdowns.'],
  ['/skins', 'Skins', '1,300+ weapon skins with chromas, level upgrades and in-game video previews.'],
  ['/weapons', 'Weapons', 'The armory with stats, damage falloff tables and every skin per weapon.'],
  ['/maps', 'Maps', 'Splash art, minimaps and tactical callouts plotted in place.'],
  ['/ranks', 'Ranks', 'The competitive ladder from Iron to Radiant in each tier’s own color.'],
  ['/playercards', 'Cosmetics', 'Player cards, sprays, gun buddies, bundles and titles, all in one place.'],
]

export function Home() {
  const agents = useApi('/agents?isPlayableCharacter=true').data
  const skins = useApi('/weapons/skins').data
  const maps = useApi('/maps').data

  const featured = (agents || []).slice(0, 14)
  const fmt = (n) => (n == null ? '—' : n.toLocaleString())

  return (
    <div>
      <section className={s.hero}>
        <div className={`kicker ${s.kick}`}>Community Data Explorer</div>
        <h1 className={s.bigTitle}>
          VALORANT
          <em>Vault</em>
        </h1>
        <p className={s.heroLead}>
          A complete, searchable window into VALORANT’s game data, every agent, skin, map, rank
          and cosmetic, served live from the community valorant-api in 18 languages.
        </p>

        <div className={s.stats}>
          <div className={s.stat}><span className={s.statN}>{fmt(agents?.length)}</span><span className={s.statL}>Agents</span></div>
          <div className={s.stat}><span className={s.statN}>{fmt(skins?.length)}</span><span className={s.statL}>Skins</span></div>
          <div className={s.stat}><span className={s.statN}>{fmt(maps?.length)}</span><span className={s.statL}>Maps</span></div>
          <div className={s.stat}><span className={s.statN}>18</span><span className={s.statL}>Languages</span></div>
        </div>

        {featured.length > 0 && (
          <div className={s.faces}>
            {featured.map((a) => (
              <Link to={`/agents/${a.uuid}`} className={s.face} key={a.uuid}
                style={{ '--g': grad(a.backgroundGradientColors) }} title={a.displayName}>
                <img src={a.displayIcon} alt={a.displayName} loading="lazy" />
              </Link>
            ))}
          </div>
        )}
      </section>

      <div className={s.tiles}>
        {TILES.map(([to, name, blurb]) => (
          <Link to={to} className={s.tile} key={to}>
            <div className={s.tileHead}>
              <span className={s.tileName}>{name}</span>
              <span className={s.tileArrow}>→</span>
            </div>
            <span className={s.tileBlurb}>{blurb}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
