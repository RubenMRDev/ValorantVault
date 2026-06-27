import { useState } from 'react'
import s from './ui.module.css'

/* Image that fades in when loaded, shows a shimmer while loading, and
   degrades to a striped tile + initial when the API gives us null. */
export function AssetImage({ src, alt, cover = false, className = '', style }) {
  const [loaded, setLoaded] = useState(false)
  const [failed, setFailed] = useState(false)
  const showFallback = !src || failed
  return (
    <div className={`${s.imgWrap} ${className}`} style={style}>
      {showFallback ? (
        <div className={s.imgFallback} aria-label={alt}>
          {(alt || '?').trim().charAt(0).toUpperCase()}
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          className={`${s.img} ${cover ? s.imgCover : ''} ${loaded ? s.imgLoaded : ''}`}
        />
      )}
    </div>
  )
}

export function Skeleton({ w = '100%', h = '1rem', r, style }) {
  return <div className={s.skel} style={{ width: w, height: h, borderRadius: r, ...style }} />
}

export function Loading({ label = 'Loading' }) {
  return (
    <div className={s.state} role="status">
      <div className={s.stateMark}>///</div>
      <p>{label}…</p>
    </div>
  )
}

export function ErrorState({ error, onRetry }) {
  return (
    <div className={s.state} role="alert">
      <div className={s.stateMark}>!</div>
      <h3>Signal lost</h3>
      <p>Couldn’t reach the VALORANT API{error?.message ? ` (${error.message})` : ''}.</p>
      {onRetry && <button className={s.retry} onClick={onRetry}>Try again</button>}
    </div>
  )
}

export function EmptyState({ title = 'Nothing here', hint }) {
  return (
    <div className={s.state}>
      <div className={s.stateMark}>∅</div>
      <h3>{title}</h3>
      {hint && <p>{hint}</p>}
    </div>
  )
}

export function Pill({ children, color }) {
  return (
    <span className={s.pill} style={color ? { color, borderColor: color + '55' } : undefined}>
      {children}
    </span>
  )
}
