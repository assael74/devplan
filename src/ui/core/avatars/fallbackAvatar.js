// src/ui/avatars/fallbackAvatar.js

const PALETTE_BY_TYPE = {
  club: [
    ['#0EA5E9', '#2563EB'], // sky->blue
    ['#22C55E', '#16A34A'], // green
    ['#F59E0B', '#D97706'], // amber
    ['#A855F7', '#6D28D9'], // purple
    ['#06B6D4', '#0E7490'], // cyan->teal
  ],
  team: [
    ['#EF4444', '#B91C1C'], // red
    ['#F97316', '#C2410C'], // orange
    ['#EC4899', '#9D174D'], // pink
    ['#14B8A6', '#0F766E'], // teal
    ['#84CC16', '#3F6212'], // lime->olive
  ],
}

const norm = (v) => String(v ?? '').trim()

const hashStr = (s) => {
  const str = norm(s)
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

const pick = (arr, seed) => arr[seed % arr.length]

const initials = (name, fallback = '') => {
  const s = norm(name)
  if (!s) return fallback
  const parts = s.split(/\s+/).filter(Boolean)
  const a = parts[0][0] || ''
  const b = parts.length > 1 ? parts[parts.length - 1][0] : (parts[0][1] || '')
  return (a + b).toUpperCase()
}

const svgToDataUri = (svg) =>
  `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`

const pixelLayer = (seed, x0, y0, w, h, count, c1, c2, sizeMin = 10, sizeMax = 22) => {
  let s = seed
  const rnd = () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 4294967296
  }

  const items = []
  for (let i = 0; i < count; i++) {
    const px = x0 + rnd() * w
    const py = y0 + rnd() * h
    const sz = sizeMin + rnd() * (sizeMax - sizeMin)

    // 70% צבע אקסנט, 30% לבן/שחור עדין כדי לשמור קונטרסט
    const useAccent = rnd() < 0.7
    const fill = useAccent ? (rnd() < 0.5 ? c1 : c2) : (rnd() < 0.5 ? '#FFFFFF' : '#0B1220')

    const alpha = useAccent ? (0.22 + rnd() * 0.55) : (0.10 + rnd() * 0.25)

    items.push(
      `<rect x="${px.toFixed(1)}" y="${py.toFixed(1)}" width="${sz.toFixed(1)}" height="${sz.toFixed(
        1
      )}" rx="2" fill="${fill}" opacity="${alpha.toFixed(2)}"/>`
    )
  }
  return items.join('')
}

export function buildFallbackAvatar({ entityType, id, name, subline }) {
  const type = entityType === 'team' ? 'team' : 'club'
  const seed = hashStr(`${type}:${norm(id) || norm(name)}`)

  const palette = PALETTE_BY_TYPE[type]
  const [c1, c2] = pick(palette, seed)

  const ini = initials(name, type === 'club' ? 'C' : 'T')
  const sub = norm(subline)

  const centerShape =
    entityType === 'club'
      ? // Shield/badge
        `
        <path d="M256 88
                 C320 118 362 128 400 136
                 V260
                 C400 360 332 420 256 452
                 C180 420 112 360 112 260
                 V136
                 C150 128 192 118 256 88 Z"
              fill="rgba(0,0,0,0.72)"/>
        <path d="M256 116
                 C312 140 348 148 384 156
                 V258
                 C384 348 324 402 256 430
                 C188 402 128 348 128 258
                 V156
                 C164 148 200 140 256 116 Z"
              fill="rgba(255,255,255,0.06)"/>
      `
      : // Jersey
        `
        <path d="M176 126
                 L206 96
                 H306
                 L336 126
                 L396 162
                 L366 232
                 L336 214
                 V402
                 H176
                 V214
                 L146 232
                 L116 162
                 Z"
              fill="rgba(0,0,0,0.72)"/>
        <path d="M214 126
                 H298
                 C294 148 280 168 256 176
                 C232 168 218 148 214 126 Z"
              fill="rgba(255,255,255,0.08)"/>
      `

  // אזור “התפוררות פיקסלים”
  const pixelsA = pixelLayer(seed ^ 0x9e3779b9, 160, 148, 190, 190, 55, c1, c2, 10, 22)
  const pixelsB = pixelLayer(seed ^ 0x85ebca6b, 90, 340, 330, 110, 45, c1, c2, 10, 24)

  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
    <defs>
      <radialGradient id="bg" cx="50%" cy="40%" r="70%">
        <stop offset="0%" stop-color="#ffffff"/>
        <stop offset="70%" stop-color="#f1f3f7"/>
        <stop offset="100%" stop-color="#e6e8ee"/>
      </radialGradient>
      <linearGradient id="accent" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${c1}"/>
        <stop offset="100%" stop-color="${c2}"/>
      </linearGradient>
      <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="8" stdDeviation="10" flood-color="#000" flood-opacity="0.25"/>
      </filter>
    </defs>

    <rect width="512" height="512" fill="url(#bg)"/>
    <circle cx="256" cy="256" r="210" fill="url(#accent)" opacity="0.10"/>

    <g filter="url(#softShadow)">
      <circle cx="256" cy="246" r="172" fill="rgba(255,255,255,0.42)"/>
      <circle cx="256" cy="246" r="168" fill="rgba(255,255,255,0.28)"/>
    </g>

    <g>
      ${centerShape}
      ${pixelsA}
      ${pixelsB}
    </g>

    <g font-family="system-ui, -apple-system, Segoe UI, Roboto, Arial" text-anchor="middle">
      <text x="256" y="308" font-size="64" font-weight="800" fill="rgba(255,255,255,0.92)">${ini}</text>
      ${
        sub
          ? `<text x="256" y="352" font-size="28" font-weight="700" fill="rgba(255,255,255,0.85)">${sub}</text>`
          : ''
      }
    </g>
  </svg>
  `
  return svgToDataUri(svg)
}

export function resolveEntityAvatar({ entityType, entity, parentEntity, subline }) {
  const clean = (v) => {
    const s = String(v ?? '').trim()
    return s || ''
  }

  const directPhoto = clean(entity?.photo)
  if (directPhoto) return directPhoto

  const parentPhoto = clean(parentEntity?.photo)
  if (parentPhoto) return parentPhoto

  return buildFallbackAvatar({
    entityType,
    id: entity?.id,
    name: entity?.teamName || entity?.name,
    subline,
  })
}
