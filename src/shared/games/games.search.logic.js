// shared/games/games.search.logic.js

const safe = (v) => (v == null ? '' : String(v))

export const buildHaystack = (x) =>
  [
    x?.dateRaw,
    x?.hourRaw,
    x?.rival,
    x?.type,
    x?.typeH,
    x?.difficulty,
    x?.difficultyH,
    x?.result,
    x?.resultH,
    x?.score,
    x?.homeKey,
    x?.homeH,
    safe(x?.id),
    safe(x?.game?.id),
  ]
    .join(' ')
    .toLowerCase()
