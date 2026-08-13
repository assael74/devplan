// src/shared/scouting/common/futureCompetition/futureCompetitionPath.js

import {
  FUTURE_COMPETITION_DIRECTION,
  FUTURE_COMPETITION_OUTLOOK,
} from './futureCompetition.model.js'

import {
  resolveCompetitionDirection,
  resolveFutureLeagueLevel,
  shiftSeasonKey,
  toCompetitionLevel,
} from './futureCompetition.utils.js'

const toBirthYear = (value) => {
  const year = Number(value)

  return Number.isFinite(year) && year > 1900 ? year : null
}

const toSlot = (value) => {
  const slot = Number(value)

  return Number.isFinite(slot) && slot > 0 ? slot : null
}

const resolveRowBirthYear = (row = {}) => {
  return toBirthYear(
    row.birthYear ||
    row.teamBirthYear ||
    row.ageGroupYear
  )
}

const resolveRowSlot = (row = {}) => {
  return toSlot(
    row.birthTeamSlot ||
    row.teamSlot ||
    row.slot
  )
}

const findChainRow = ({ rows, sourceBirthYear, birthTeamSlot } = {}) => {
  const matches = rows.filter((row) => {
    return resolveRowBirthYear(row) === sourceBirthYear
  })

  if (!matches.length) return null

  if (birthTeamSlot) {
    const sameSlot = matches.find((row) => {
      return resolveRowSlot(row) === birthTeamSlot
    })

    if (sameSlot) return sameSlot
  }

  return matches[0]
}

const buildFutureStep = ({
  row,
  offset,
  currentBirthYear,
  currentLeagueLevel,
  previousLeagueLevel,
  currentSeasonKey,
} = {}) => {
  const sourceBirthYear = currentBirthYear - offset
  const resolvedLevel = resolveFutureLeagueLevel(row || {})
  const leagueLevel = resolvedLevel.leagueLevel

  return {
    offset,
    seasonKey: shiftSeasonKey(currentSeasonKey, offset),
    sourceBirthYear,
    sourceAgeGroupId: row?.ageGroupId || '',
    sourceAgeGroupLabel: row?.ageGroupLabel || '',
    sourceLeagueId: row?.leagueId || '',
    sourceLeagueLevel: toCompetitionLevel(row?.leagueLevel),
    leagueLevel,
    levelStatus: resolvedLevel.status,
    directionFromCurrent: resolveCompetitionDirection({
      fromLevel: currentLeagueLevel,
      toLevel: leagueLevel,
    }),
    directionFromPrevious: resolveCompetitionDirection({
      fromLevel: previousLeagueLevel,
      toLevel: leagueLevel,
    }),
  }
}

const resolveOutlook = (steps = []) => {
  const directions = steps
    .map(step => step.directionFromCurrent)
    .filter(direction => direction !== FUTURE_COMPETITION_DIRECTION.UNKNOWN)

  if (!directions.length) return FUTURE_COMPETITION_OUTLOOK.UNKNOWN

  const hasUp = directions.includes(FUTURE_COMPETITION_DIRECTION.UP)
  const hasDown = directions.includes(FUTURE_COMPETITION_DIRECTION.DOWN)

  if (hasUp && hasDown) return FUTURE_COMPETITION_OUTLOOK.MIXED
  if (hasDown) return FUTURE_COMPETITION_OUTLOOK.RISK
  if (hasUp) return FUTURE_COMPETITION_OUTLOOK.UPSIDE

  return FUTURE_COMPETITION_OUTLOOK.STABLE
}

export const buildYouthFutureCompetitionPath = ({
  birthYear,
  leagueLevel,
  seasonKey,
  birthTeamSlot,
  clubBirthTeams = [],
  yearsAhead = 2,
} = {}) => {
  const currentBirthYear = toBirthYear(birthYear)
  const currentLeagueLevel = toCompetitionLevel(leagueLevel)
  const currentSlot = toSlot(birthTeamSlot)
  const safeRows = Array.isArray(clubBirthTeams) ? clubBirthTeams : []
  const safeYearsAhead = Math.max(0, Math.min(Number(yearsAhead) || 0, 2))

  if (!currentBirthYear || !currentLeagueLevel || safeYearsAhead === 0) {
    return {
      current: {
        birthYear: currentBirthYear,
        seasonKey: String(seasonKey || '').trim(),
        leagueLevel: currentLeagueLevel,
        birthTeamSlot: currentSlot,
      },
      steps: [],
      outlook: FUTURE_COMPETITION_OUTLOOK.UNKNOWN,
      hasCompletePath: false,
    }
  }

  const steps = []
  let previousLeagueLevel = currentLeagueLevel

  for (let offset = 1; offset <= safeYearsAhead; offset += 1) {
    const sourceBirthYear = currentBirthYear - offset
    const row = findChainRow({
      rows: safeRows,
      sourceBirthYear,
      birthTeamSlot: currentSlot,
    })
    const step = buildFutureStep({
      row,
      offset,
      currentBirthYear,
      currentLeagueLevel,
      previousLeagueLevel,
      currentSeasonKey: seasonKey,
    })

    steps.push(step)

    if (step.leagueLevel) previousLeagueLevel = step.leagueLevel
  }

  return {
    current: {
      birthYear: currentBirthYear,
      seasonKey: String(seasonKey || '').trim(),
      leagueLevel: currentLeagueLevel,
      birthTeamSlot: currentSlot,
    },
    steps,
    outlook: resolveOutlook(steps),
    hasCompletePath: steps.length === safeYearsAhead && steps.every(step => Boolean(step.leagueLevel)),
  }
}
