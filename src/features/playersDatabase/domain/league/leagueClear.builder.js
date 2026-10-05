// src/features/playersDatabase/domain/league/leagueClear.builder.js

import { requireSeasonId } from '../identity/index.js'
import { requireLeagueId } from './leagueIdentity.js'

const clean = value => String(value === null || value === undefined ? '' : value).trim()

const emptyPerformanceCalculation = () => ({
  engineVersion: '',
  normalizationMode: '',
  appliedFactor: null,
  calculatedAt: null,
})

const readLeagueState = existingLeague => {
  const hasLeagueDocument = Boolean(
    existingLeague
    && typeof existingLeague === 'object'
    && Object.keys(existingLeague).length > 0
  )
  const league = hasLeagueDocument ? existingLeague : {}
  const seasonsById = league.seasonsById && typeof league.seasonsById === 'object'
    ? league.seasonsById
    : {}

  return { league, seasonsById, hasLeagueDocument }
}

const readSeasonTarget = ({ seasonsById, seasonId }) => {
  const season = seasonsById[seasonId]

  if (!season || typeof season !== 'object') {
    throw new Error('League season does not exist')
  }

  const table = season.table && typeof season.table === 'object' ? season.table : {}
  const teamsById = table.teamsById && typeof table.teamsById === 'object'
    ? table.teamsById
    : {}

  return { season, teamsById }
}

const readMatchingTeamSeasonIds = ({
  existingTeamSeasons,
  leagueId,
  seasonId,
}) => {
  const rows = Array.isArray(existingTeamSeasons) ? existingTeamSeasons : []

  return rows.reduce((teamIds, teamSeason) => {
    const document = teamSeason && typeof teamSeason === 'object' ? teamSeason : {}
    const identity = document.identity && typeof document.identity === 'object'
      ? document.identity
      : {}

    if (clean(identity.leagueId) !== leagueId || clean(identity.seasonId) !== seasonId) {
      return teamIds
    }

    const teamId = clean(identity.teamId)
    if (teamId) teamIds.add(teamId)

    return teamIds
  }, new Set())
}

const collectAffectedTeamIds = ({
  teamsById = {},
  existingTeamSeasons = [],
  leagueId,
  seasonId,
}) => {
  const teamIds = new Set(Object.keys(teamsById))
  const matchingTeamSeasonIds = readMatchingTeamSeasonIds({
    existingTeamSeasons,
    leagueId,
    seasonId,
  })

  matchingTeamSeasonIds.forEach(teamId => teamIds.add(teamId))

  return Array.from(teamIds).sort()
}

const assertLeagueIdentity = ({ league, leagueId }) => {
  if (clean(league.leagueId) && clean(league.leagueId) !== leagueId) {
    throw new Error('Existing league identity does not match target league')
  }
}

export const buildLeagueTeamsClearApprovedState = ({
  leagueId,
  seasonId,
  existingLeague = {},
  existingTeamSeasons = [],
  updatedAt = null,
} = {}) => {
  const resolvedLeagueId = requireLeagueId(leagueId)
  const resolvedSeasonId = requireSeasonId(seasonId)
  const { league, seasonsById } = readLeagueState(existingLeague)
  const { season, teamsById } = readSeasonTarget({
    seasonsById,
    seasonId: resolvedSeasonId,
  })

  assertLeagueIdentity({ league, leagueId: resolvedLeagueId })

  const affectedTeamIds = collectAffectedTeamIds({
    teamsById,
    existingTeamSeasons,
    leagueId: resolvedLeagueId,
    seasonId: resolvedSeasonId,
  })
  const nextSeason = {
    ...season,
    table: {
      tableState: 'NOT_LOADED',
      teamsById: {},
    },
    performanceCalculation: emptyPerformanceCalculation(),
    updatedAt: updatedAt || null,
  }

  return {
    leagueId: resolvedLeagueId,
    seasonId: resolvedSeasonId,
    affectedTeamIds,
    document: {
      ...league,
      leagueId: resolvedLeagueId,
      seasonsById: {
        ...seasonsById,
        [resolvedSeasonId]: nextSeason,
      },
      timestamps: {
        ...(league.timestamps && typeof league.timestamps === 'object' ? league.timestamps : {}),
        updatedAt: updatedAt || null,
      },
    },
    season: nextSeason,
  }
}

export const buildLeagueSeasonDeleteApprovedState = ({
  leagueId,
  seasonId,
  existingLeague = null,
  existingTeamSeasons = [],
  updatedAt = null,
} = {}) => {
  const resolvedLeagueId = requireLeagueId(leagueId)
  const resolvedSeasonId = requireSeasonId(seasonId)
  const { league, seasonsById, hasLeagueDocument } = readLeagueState(existingLeague)
  const existingSeason = seasonsById[resolvedSeasonId]
  const table = existingSeason && typeof existingSeason === 'object' && existingSeason.table && typeof existingSeason.table === 'object'
    ? existingSeason.table
    : {}
  const teamsById = table.teamsById && typeof table.teamsById === 'object'
    ? table.teamsById
    : {}

  assertLeagueIdentity({ league, leagueId: resolvedLeagueId })

  const affectedTeamIds = collectAffectedTeamIds({
    teamsById,
    existingTeamSeasons,
    leagueId: resolvedLeagueId,
    seasonId: resolvedSeasonId,
  })
  if (!hasLeagueDocument || !existingSeason || typeof existingSeason !== 'object') {
    return {
      leagueId: resolvedLeagueId,
      seasonId: resolvedSeasonId,
      affectedTeamIds,
      canonicalWriteRequired: false,
      document: null,
    }
  }

  const nextSeasonsById = { ...seasonsById }
  delete nextSeasonsById[resolvedSeasonId]

  return {
    leagueId: resolvedLeagueId,
    seasonId: resolvedSeasonId,
    affectedTeamIds,
    canonicalWriteRequired: true,
    document: {
      ...league,
      leagueId: resolvedLeagueId,
      seasonsById: nextSeasonsById,
      timestamps: {
        ...(league.timestamps && typeof league.timestamps === 'object' ? league.timestamps : {}),
        updatedAt: updatedAt || null,
      },
    },
  }
}
