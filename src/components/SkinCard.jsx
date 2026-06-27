import { Link } from 'react-router-dom'
import { AssetImage } from './ui.jsx'
import s from './SkinCard.module.css'

export function SkinCard({ skin, tier }) {
  const img = skin.chromas?.[0]?.fullRender || skin.displayIcon
  const color = tier?.highlightColor ? `#${tier.highlightColor.slice(0, 6)}` : undefined
  return (
    <Link
      to={`/skins/${skin.uuid}`}
      className={s.card}
      style={{ '--tier': color, '--tier-glow': color ? color + '40' : undefined }}
    >
      <div className={s.media}>
        <AssetImage src={img} alt={skin.displayName} />
        {tier?.displayIcon && (
          <span className={s.tier}><img src={tier.displayIcon} alt={tier.displayName} /></span>
        )}
      </div>
      <div className={s.body}>
        <span className={s.dot} />
        <span className={s.name}>{skin.displayName}</span>
      </div>
    </Link>
  )
}
