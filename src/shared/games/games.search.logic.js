/// shared/games/games.search.logic.js

const safe = (v) => (v == null ? '' : String(v))

export const buildHaystack = (x) =>
  [
    x?.dateRaw,
    x?.hourRaw,
    x?.rival,
    x?.type,
    safe(x?.id),
    safe(x?.game?.id),
    safe(x?.game?.difficulty),
  ]
    .join(' ')
    .toLowerCase()
