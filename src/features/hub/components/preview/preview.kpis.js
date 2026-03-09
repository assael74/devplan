const toNum = (v) => {
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

export function avg(values) {
  const arr = (values || []).map(toNum).filter((x) => x !== null)
  if (!arr.length) return null
  const s = arr.reduce((a, b) => a + b, 0)
  return s / arr.length
}

export function roundToHalf(n) {
  if (n === null || n === undefined) return null
  return Math.round(n * 2) / 2
}

export function computeTeamLevels(team) {
  const players = team?.players || []
  const level = roundToHalf(avg(players.map((p) => p?.level)))
  const levelPotential = roundToHalf(avg(players.map((p) => p?.levelPotential)))
  return { level, levelPotential }
}
