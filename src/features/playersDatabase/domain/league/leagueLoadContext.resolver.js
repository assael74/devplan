// src/features/playersDatabase/domain/league/leagueLoadContext.resolver.js

import { resolveLeagueScheduleProjection } from '../projections/leagueSchedule.projection.js'
import { requireSeasonId } from '../identity/index.js'
import {
  normalizeLeagueIdentity,
  requireLeagueId,
  resolveLeagueTeamId,
} from './leagueIdentity.js'

const clean = value => String(value === null || value === undefined ? '' : value).trim()

const requirePositiveInteger = (value, fieldName) => {
  const numberValue = Number(value)
  if (!Number.isInteger(numberValue) || numberValue <= 0) {
    throw new Error(`Invalid ${fieldName}`)
  }

  return numberValue
}

const resolveValue = ({ supplied, existing, fallback = null }) => {
  if (supplied !== undefined && supplied !== null && supplied !== '') return supplied
  if (existing !== undefined && existing !== null && existing !== '') return existing
  return fallback
}

export const resolveLeagueLoadContext = ({
  league = {},
  season = {},
  rows = [],
  existingLeague = {},
} = {}) => {
  if (!Array.isArray(rows)) throw new Error('League rows must be an array')

  const leagueId = requireLeagueId(league.leagueId)
  const existingLeagueId = clean(existingLeague && existingLeague.leagueId)
  if (existingLeagueId && existingLeagueId !== leagueId) {
    throw new Error('Existing league identity does not match target league')
  }

  const seasonId = requireSeasonId(season.seasonId)
  const birthYear = requirePositiveInteger(season.birthYear, 'birthYear')
  const existingSeasonsById = existingLeague && existingLeague.seasonsById &&
    typeof existingLeague.seasonsById === 'object'
    ? existingLeague.seasonsById
    : {}
  const existingSeason = existingSeasonsById[seasonId] || {}
  const existingNames = existingLeague && existingLeague.names && typeof existingLeague.names === 'object'
    ? existingLeague.names
    : {}
  const suppliedNames = league.names && typeof league.names === 'object'
    ? league.names
    : {}
  const canonicalRows = rows.map(row => ({
    ...row,
    teamId: resolveLeagueTeamId({ row, birthYear }),
  }))
  const schedule = resolveLeagueScheduleProjection({
    teamsCount: canonicalRows.length,
    leagueTotalRound: resolveValue({
      supplied: season.leagueTotalRound,
      existing: existingSeason.leagueTotalRound,
      fallback: null,
    }),
  })
  const normalizedLeagueIdentity = normalizeLeagueIdentity({
    leagueId,
    names: {
      official: resolveValue({
        supplied: suppliedNames.official,
        existing: existingNames.official,
        fallback: '',
      }),
      display: resolveValue({
        supplied: suppliedNames.display,
        existing: existingNames.display,
        fallback: '',
      }),
      short: resolveValue({
        supplied: suppliedNames.short,
        existing: existingNames.short,
        fallback: '',
      }),
      source: resolveValue({
        supplied: suppliedNames.source,
        existing: existingNames.source,
        fallback: '',
      }),
    },
    region: resolveValue({
      supplied: league.region,
      existing: existingLeague.region,
      fallback: '',
    }),
    ageGroupId: resolveValue({
      supplied: league.ageGroupId,
      existing: existingLeague.ageGroupId,
      fallback: '',
    }),
    ageGroupLabel: resolveValue({
      supplied: league.ageGroupLabel,
      existing: existingLeague.ageGroupLabel,
      fallback: '',
    }),
    level: resolveValue({
      supplied: league.level,
      existing: existingLeague.level,
      fallback: null,
    }),
  })

  return {
    leagueId,
    seasonId,
    birthYear,
    existingSeasonsById,
    existingSeason,
    existingTimestamps: existingLeague && existingLeague.timestamps &&
      typeof existingLeague.timestamps === 'object'
      ? existingLeague.timestamps
      : {},
    normalizedLeagueIdentity,
    resolvedLeagueLevel: normalizedLeagueIdentity.level,
    resolvedLeagueTotalRound: schedule.leagueTotalRound || null,
    canonicalRows,
  }
}
