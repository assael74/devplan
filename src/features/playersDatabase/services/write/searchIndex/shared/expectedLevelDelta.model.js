// features/playersDatabase/services/write/searchIndex/shared/expectedLevelDelta.model.js

import { clean } from '../../leagues/leagueDoc.js'

export const buildExpectedLevelKey = ({
  seasonId = '',
  clubId = '',
  birthYear = 0,
  birthTeamSlot = 1,
} = {}) => [
  clean(seasonId),
  clean(clubId),
  Number(birthYear) || 0,
  Number(birthTeamSlot) || 1,
].join('::')

export const buildExpectedLevelDelta = ({
  currentLevel = null,
  nextLevel = null,
} = {}) => {
  const current = Number(currentLevel)
  const next = Number(nextLevel)

  if (!Number.isFinite(current) || current <= 0) return null
  if (!Number.isFinite(next) || next <= 0) return null

  return current - next
}

export const resolveExpectedLevelDirection = expectedLevelDelta => {
  if (expectedLevelDelta === null || expectedLevelDelta === undefined) return 'unknown'

  const delta = Number(expectedLevelDelta)
  if (!Number.isFinite(delta)) return 'unknown'
  if (delta > 0) return 'promotion'
  if (delta < 0) return 'relegation'

  return 'unchanged'
}

export const buildExpectedLeagueLevelChangeView = ({
  expectedLevelDelta = null,
  currentLevel = null,
} = {}) => {
  const delta = expectedLevelDelta === null || expectedLevelDelta === undefined
    ? null
    : Number(expectedLevelDelta)
  const current = Number(currentLevel)
  const hasDelta = Number.isFinite(delta)
  const hasCurrent = Number.isFinite(current) && current > 0

  return {
    currentLevel: hasCurrent ? current : null,
    nextSeasonLevel: hasDelta && hasCurrent ? current - delta : null,
    levelGap: hasDelta ? -delta : null,
    direction: resolveExpectedLevelDirection(hasDelta ? delta : null),
  }
}
