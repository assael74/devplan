// shared/games/insights/team/sections/squad/squad.rules.js

export const SQUAD_RULES = {
  attack: {
    wideMin: 45,
    mediumMin: 30,
  },
  lineup: {
    stableMin: 65,
    unstableBelow: 45,
  },
  integration: {
    wideMin: 80,
    mediumMin: 65,
  },
}

export function getUsageRowsByGroup(metrics, group) {
  const rows = metrics?.squadUsageEvaluation?.rows || []
  return rows.filter((row) => row.group === group)
}

export function getAttackStatus(metrics) {
  if (metrics.scorersEvaluation?.summary?.isStrong) return 'wide'
  if (metrics.scorersEvaluation?.summary?.isRisk) return 'narrow'

  if (!metrics.usedPlayers && !metrics.squadSize) return 'empty'

  if (metrics.attackingInvolvementPct >= SQUAD_RULES.attack.wideMin) {
    return 'wide'
  }

  if (metrics.attackingInvolvementPct >= SQUAD_RULES.attack.mediumMin) {
    return 'medium'
  }

  return 'narrow'
}

export function getLineupStatus(metrics) {
  const lineupRows = getUsageRowsByGroup(metrics, 'lineup')
  const lineupRedCount = lineupRows.filter((row) => row.evaluation.isRed).length
  const lineupGreenCount = lineupRows.filter((row) => row.evaluation.isGreen).length

  if (lineupRedCount >= 2) return 'unstable'
  if (lineupGreenCount >= 2) return 'stable'

  if (!metrics.usedPlayers || !metrics.starters) return 'empty'

  if (metrics.lineupStabilityPct >= SQUAD_RULES.lineup.stableMin) {
    return 'stable'
  }

  if (metrics.lineupStabilityPct < SQUAD_RULES.lineup.unstableBelow) {
    return 'unstable'
  }

  return 'medium'
}

export function getIntegrationStatus(metrics) {
  const integrationRows = getUsageRowsByGroup(metrics, 'integration')
  const integrationRedCount = integrationRows.filter((row) => {
    return row.evaluation.isRed
  }).length
  const integrationGreenCount = integrationRows.filter((row) => {
    return row.evaluation.isGreen
  }).length

  if (integrationRedCount >= 1) return 'limited'
  if (integrationGreenCount >= 2) return 'wide'

  if (!metrics.squadSize && !metrics.usedPlayers) return 'empty'

  if (metrics.playerIntegrationPct >= SQUAD_RULES.integration.wideMin) {
    return 'wide'
  }

  if (metrics.playerIntegrationPct >= SQUAD_RULES.integration.mediumMin) {
    return 'medium'
  }

  return 'limited'
}

export function getAttackTone(metrics, performance) {
  const status = getAttackStatus(metrics)

  if (status === 'empty') return 'neutral'
  if (metrics.scorersEvaluation?.summary?.isStrong) return 'success'
  if (metrics.scorersEvaluation?.summary?.isRisk) return 'warning'
  if (status === 'wide' && performance.isStrong) return 'success'
  if (status === 'narrow') return 'warning'

  return 'neutral'
}

export function getLineupTone(metrics, performance) {
  const status = getLineupStatus(metrics)

  if (status === 'empty') return 'neutral'
  if (status === 'stable' && performance.isStrong) return 'success'
  if (status === 'unstable' && !performance.isStrong) return 'warning'

  return 'neutral'
}

export function getIntegrationTone(metrics, performance) {
  const status = getIntegrationStatus(metrics)

  if (status === 'empty') return 'neutral'
  if (status === 'wide' && performance.isStrong) return 'success'
  if (status === 'limited') return 'warning'

  return 'neutral'
}

export function getLabelByTone(tone) {
  if (tone === 'warning') return 'מוקד פעולה'
  if (tone === 'success') return 'המשך פעולה'
  return 'המשך בדיקה'
}

export function getSquadOverallTone(items) {
  if (items.some((item) => item.tone === 'warning')) return 'warning'
  if (items.some((item) => item.tone === 'success')) return 'success'
  return 'neutral'
}
