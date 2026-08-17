// src/shared/scouting/players/profileStrength/playerProfileStrength.js

const toFiniteNumber = (value) => {
  const number = Number(value)
  return Number.isFinite(number) ? number : 0
}

export const buildPlayerProfileStrength = ({ profileDepth } = {}) => {
  const depth = Math.max(0, toFiniteNumber(profileDepth?.depth))
  const depthPct = Math.max(0, Math.round(toFiniteNumber(profileDepth?.depthPct)))

  return {
    depth,
    depthPct,
    measurableRuleCount: Number(profileDepth?.measurableRuleCount) || 0,
  }
}
