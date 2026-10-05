// src/features/playersDatabase/domain/league/clubsCenterTeam.builder.js

import { buildTeamSeasonDocumentId, requireSeasonId } from '../identity/index.js'
import {
  buildCompetitionProjection,
  buildEffectiveCompetitionProjection as buildEffectiveClubCompetitionProjection,
} from '../projections/club/clubCompetition.projection.js'
import { requireLeagueId } from './leagueIdentity.js'

const clean = value => String(value === null || value === undefined ? '' : value).trim()

const object = value => (
  value && typeof value === 'object' && !Array.isArray(value) ? value : {}
)

const toNullableNumber = value => {
  if (value === null || value === undefined || value === '') return null
  const numberValue = Number(value)
  return Number.isFinite(numberValue) ? numberValue : null
}

const rosterPlayerCount = teamSeason => Object.keys(
  object(teamSeason && teamSeason.roster && teamSeason.roster.playersById)
).length

const hasRosterImport = teamSeason => Boolean(clean(
  teamSeason
  && teamSeason.roster
  && teamSeason.roster.rosterImport
  && teamSeason.roster.rosterImport.sourceSnapshotKey
))

const resolveNextDocumentationState = ({ teamSeason, seasonStatus }) => {
  if (!teamSeason || rosterPlayerCount(teamSeason) === 0) return 'NO_ROSTER'

  const statsLoadState = object(teamSeason.stats && teamSeason.stats.statsLoadState)
  if (clean(statsLoadState.status).toLowerCase() !== 'loaded') return 'ROSTER_ONLY'

  return clean(seasonStatus).toLowerCase() === 'completed' ? 'STATS_FINAL' : 'STATS_LOADED'
}

const resolveDocumentationEventAt = ({ teamSeason, nextState }) => {
  if (nextState === 'NO_ROSTER') {
    if (!teamSeason) return null
    return teamSeason.roster && teamSeason.roster.updatedAt
      ? teamSeason.roster.updatedAt
      : null
  }

  if (nextState === 'ROSTER_ONLY') {
    return teamSeason && teamSeason.roster && teamSeason.roster.updatedAt
      ? teamSeason.roster.updatedAt
      : null
  }

  const statsLoadState = object(teamSeason && teamSeason.stats && teamSeason.stats.statsLoadState)
  return statsLoadState.updatedAt || null
}

const resolveDocumentation = ({ teamSeason, seasonStatus, previousTeamProjection }) => {
  const previous = object(previousTeamProjection)
  const previousState = clean(previous.documentationState)
  const previousUpdatedAt = previous.documentationStateUpdatedAt || null
  const nextState = resolveNextDocumentationState({ teamSeason, seasonStatus })

  if (previousState && nextState === previousState) {
    return {
      state: nextState,
      updatedAt: previousUpdatedAt,
    }
  }

  if (!previousState && nextState === 'NO_ROSTER') {
    return {
      state: nextState,
      updatedAt: null,
    }
  }

  return {
    state: nextState,
    updatedAt: resolveDocumentationEventAt({ teamSeason, nextState }),
  }
}

const buildTaskSignals = teamSeason => ({
  offense: Boolean(teamSeason && teamSeason.teamTaskSignals && teamSeason.teamTaskSignals.offense),
  defense: Boolean(teamSeason && teamSeason.teamTaskSignals && teamSeason.teamTaskSignals.defense),
  updatedAt: teamSeason && teamSeason.teamTaskSignals
    ? teamSeason.teamTaskSignals.updatedAt || null
    : null,
})

export const buildCenterTeamStateProjection = ({
  teamSeason = null,
  seasonStatus = '',
  previousTeamProjection = null,
} = {}) => {
  const documentation = resolveDocumentation({
    teamSeason,
    seasonStatus,
    previousTeamProjection,
  })

  return {
    documentationState: documentation.state,
    documentationStateUpdatedAt: documentation.updatedAt,
    teamTaskSignals: buildTaskSignals(teamSeason),
  }
}

const emptyDirectionMaps = key => ({
  up: { [key]: {} },
  lateral: { [key]: {} },
  down: { [key]: {} },
  unknown: { [key]: {} },
})

const increment = ({ container, direction, key, id }) => {
  if (!id) return
  const bucket = container[direction] && container[direction][key]
  if (!bucket) return
  bucket[id] = (Number(bucket[id]) || 0) + 1
}

const buildTransfers = teamSeason => {
  const external = {
    in: emptyDirectionMaps('clubsById'),
    out: emptyDirectionMaps('clubsById'),
  }
  const internal = {
    in: emptyDirectionMaps('teamsById'),
    out: emptyDirectionMaps('teamsById'),
  }
  const movement = object(teamSeason && teamSeason.movement)

  const append = ({ fact, side }) => {
    const source = object(fact)
    const rawDirection = clean(source.levelDirection).toLowerCase()
    const direction = ['up', 'lateral', 'down'].includes(rawDirection)
      ? rawDirection
      : 'unknown'
    const scope = clean(source.scope).toLowerCase()

    if (scope === 'internal') {
      increment({
        container: internal[side],
        direction,
        key: 'teamsById',
        id: clean(side === 'in' ? source.fromTeamId : source.toTeamId),
      })
      return
    }

    increment({
      container: external[side],
      direction,
      key: 'clubsById',
      id: clean(side === 'in' ? source.fromClubId : source.toClubId),
    })
  }

  Object.values(object(movement.transfersInById)).forEach(fact => append({ fact, side: 'in' }))
  Object.values(object(movement.transfersOutById)).forEach(fact => append({ fact, side: 'out' }))

  return {
    coverageStatus: hasRosterImport(teamSeason) ? 'COMPLETE' : 'NOT_LOADED',
    external,
    internal,
    pending: {
      total: Object.keys(object(teamSeason && teamSeason.roster && teamSeason.roster.pendingById)).length,
    },
    updatedAt: movement.updatedAt || null,
  }
}

export const buildTeamCompetitionProjection = ({ league, season, teamId, teamRow }) => {
  const rows = Object.entries(object(season && season.table && season.table.teamsById))
    .map(([rowTeamId, row]) => {
      const officialTable = object(row && row.officialTable)
      return {
        teamId: rowTeamId,
        ...row,
        rank: officialTable.rank,
        points: officialTable.points,
        goalsFor: officialTable.goalsFor,
        goalsAgainst: officialTable.goalsAgainst,
        teamGamePlayed: officialTable.teamGamePlayed,
      }
    })
  const targetTeam = rows.find(row => row.teamId === teamId) || {
    teamId,
    ...teamRow,
  }
  const automatic = buildCompetitionProjection({
    rows,
    targetTeam,
    leagueLevel: league.level,
    competitionRules: season.competitionRules,
    expectedGamesPerTeam: season.leagueTotalRound,
  })
  const effective = buildEffectiveClubCompetitionProjection({
    automaticProjection: automatic,
    manualProjection: null,
    seasonStatus: season.seasonStatus,
  })

  return {
    effective: {
      projectedNextLeagueLevel: toNullableNumber(effective.projectedNextLeagueLevel),
      status: clean(effective.status) || 'UNKNOWN',
      source: clean(effective.source) || 'AUTOMATIC',
    },
  }
}

export const buildClubsCenterTeamProjection = ({
  league,
  season,
  seasonId,
  teamId,
  teamRow,
  teamSeason = null,
  previousTeamProjection = null,
  updatedAt = null,
} = {}) => {
  const resolvedLeagueId = requireLeagueId(league && league.leagueId)
  const resolvedSeasonId = requireSeasonId(seasonId)
  const resolvedTeamId = clean(teamId)
  if (!resolvedTeamId) throw new Error('Missing Team ID for ClubsCenter projection')

  const centerState = buildCenterTeamStateProjection({
    teamSeason,
    seasonStatus: season && season.seasonStatus,
    previousTeamProjection,
  })

  return {
    teamSeasonDocumentId: buildTeamSeasonDocumentId({
      teamId: resolvedTeamId,
      seasonId: resolvedSeasonId,
    }),
    birthYear: toNullableNumber(season && season.birthYear),
    ageGroupId: clean(league && league.ageGroupId),
    teamSlot: toNullableNumber(teamRow && teamRow.teamSlot),
    leagueId: resolvedLeagueId,
    ...centerState,
    performance: {
      tableRank: toNullableNumber(teamRow && teamRow.officialTable && teamRow.officialTable.rank),
      points: toNullableNumber(teamRow && teamRow.officialTable && teamRow.officialTable.points),
      teamGamePlayed: toNullableNumber(
        teamRow && teamRow.officialTable && teamRow.officialTable.teamGamePlayed
      ),
    },
    competitionProjection: buildTeamCompetitionProjection({
      league,
      season,
      teamId: resolvedTeamId,
      teamRow,
    }),
    transfers: buildTransfers(teamSeason),
    updatedAt: updatedAt || null,
  }
}

export default buildClubsCenterTeamProjection
