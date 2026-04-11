// functions\src\domain\abilities\abilitiesAgeRule.js

// קובץ מקביל: src/shared/abilities/abilitiesAgeRule.js
// הערה: בכל שינוי בקובץ זה יש לבדוק ולעדכן גם את הקובץ המקביל בצד ה־src.

function toYear(value) {
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

function resolvePlayerTeamYear(source = {}) {
  return (
    toYear(source?.team?.teamYear) ??
    toYear(source?.player?.team?.teamYear) ??
    toYear(source?.teamYear) ??
    toYear(source?.player?.teamYear) ??
    toYear(source?.publicMeta?.teamYear) ??
    null
  )
}

function getPlayerYearBand(source = {}) {
  const teamYear = resolvePlayerTeamYear(source)
  if (teamYear == null) return null

  const currentYear = new Date().getFullYear()
  return currentYear - teamYear
}

function shouldUseGrowthStage(source = {}) {
  const yearBand = getPlayerYearBand(source)
  if (yearBand == null) return true
  return yearBand < 15
}

function shouldUseDevelopmentDomain(source = {}) {
  return shouldUseGrowthStage(source)
}

module.exports = {
  toYear,
  resolvePlayerTeamYear,
  getPlayerYearBand,
  shouldUseGrowthStage,
  shouldUseDevelopmentDomain,
}
