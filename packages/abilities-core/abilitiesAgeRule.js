// C:\projects\devplan\packages\abilities-core\abilitiesAgeRule.js

export function toYear(value) {
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

export function resolvePlayerTeamYear(source = {}) {
  return (
    toYear(source?.team?.teamYear) ??
    toYear(source?.player?.team?.teamYear) ??
    toYear(source?.teamYear) ??
    toYear(source?.player?.teamYear) ??
    toYear(source?.publicMeta?.teamYear) ??
    null
  )
}

export function getPlayerYearBand(source = {}) {
  const teamYear = resolvePlayerTeamYear(source)
  if (teamYear == null) return null

  const currentYear = new Date().getFullYear()
  return currentYear - teamYear
}

export function shouldUseGrowthStage(source = {}) {
  const yearBand = getPlayerYearBand(source)
  if (yearBand == null) return true
  return yearBand < 15
}

export function shouldUseDevelopmentDomain(source = {}) {
  return shouldUseGrowthStage(source)
}
