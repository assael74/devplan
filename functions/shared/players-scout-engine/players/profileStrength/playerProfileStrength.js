// src/shared/scouting/players/profileStrength/playerProfileStrength.js

const toFiniteNumber = (value) => {
  if (value === null || value === undefined || value === '') return null

  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

const finiteOrZero = value => toFiniteNumber(value) || 0

export const buildPlayerProfileStrength = ({ profileDepth } = {}) => {
  const depth = Math.max(0, finiteOrZero(profileDepth?.depth))
  const depthPct = Math.max(0, Math.round(finiteOrZero(profileDepth?.depthPct)))

  return {
    depth,
    depthPct,
    method: profileDepth?.method || 'generic_threshold',
    baseDepth: Math.max(0, finiteOrZero(profileDepth?.baseDepth)),
    baseDepthPct: Math.max(0, Math.round(finiteOrZero(profileDepth?.baseDepthPct))),
    contextAdjustment: toFiniteNumber(profileDepth?.contextAdjustment),
    contextAdjustmentPct: toFiniteNumber(profileDepth?.contextAdjustmentPct),
    factors: profileDepth?.factors && typeof profileDepth.factors === 'object'
      ? { ...profileDepth.factors }
      : {},
    measurableRuleCount: Number(profileDepth?.measurableRuleCount) || 0,
  }
}
