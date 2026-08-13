// src/shared/scouting/common/futureCompetition/futureCompetition.utils.js

import {
  FUTURE_COMPETITION_DIRECTION,
  FUTURE_COMPETITION_LEVEL_STATUS,
} from './futureCompetition.model.js'

export const toCompetitionLevel = (value) => {
  if (value === null || value === undefined || value === '') return null

  const level = Number(value)

  return Number.isFinite(level) && level > 0 ? level : null
}

export const resolveCompetitionDirection = ({ fromLevel, toLevel } = {}) => {
  const from = toCompetitionLevel(fromLevel)
  const to = toCompetitionLevel(toLevel)

  if (!from || !to) return FUTURE_COMPETITION_DIRECTION.UNKNOWN
  if (to < from) return FUTURE_COMPETITION_DIRECTION.UP
  if (to > from) return FUTURE_COMPETITION_DIRECTION.DOWN

  return FUTURE_COMPETITION_DIRECTION.STABLE
}

export const resolveFutureLeagueLevel = (row = {}) => {
  const confirmed = toCompetitionLevel(row.confirmedLeagueLevel)
  if (confirmed) {
    return {
      leagueLevel: confirmed,
      status: FUTURE_COMPETITION_LEVEL_STATUS.CONFIRMED,
    }
  }

  const projected = toCompetitionLevel(
    row.projectedLeagueLevel || row.expectedLeagueLevel
  )
  if (projected) {
    return {
      leagueLevel: projected,
      status: FUTURE_COMPETITION_LEVEL_STATUS.PROJECTED,
    }
  }

  const current = toCompetitionLevel(row.leagueLevel)
  if (current) {
    return {
      leagueLevel: current,
      status: FUTURE_COMPETITION_LEVEL_STATUS.CURRENT_CHAIN,
    }
  }

  return {
    leagueLevel: null,
    status: FUTURE_COMPETITION_LEVEL_STATUS.UNKNOWN,
  }
}

export const shiftSeasonKey = (seasonKey, offset = 1) => {
  const value = String(seasonKey || '').trim()
  const match = value.match(/^(\d{2}|\d{4})\s*\/\s*(\d{2}|\d{4})$/)

  if (!match) return ''

  const start = Number(match[1])
  const end = Number(match[2])

  if (!Number.isFinite(start) || !Number.isFinite(end)) return ''

  const startText = String(start + offset).padStart(match[1].length, '0')
  const endText = String(end + offset).padStart(match[2].length, '0')

  return `${startText}/${endText}`
}
