import { buildTeamLoadStatus } from '../../../model/team/teamLoadStatus.model.js'
import { buildTeamSeasonDocumentId } from '../../../model/team/teamIdentity.model.js'
import { buildPlayerSeasonIndexSyncPlan } from '../../../domain/rosterV2/support/searchIndex/player/playerSeasonIndex.plan.js'
import { buildTeamSeasonRosterMetaSyncPlan } from '../../../domain/rosterV2/support/searchIndex/team/teamSeasonRosterMeta.plan.js'
import { buildLeagueTeamRosterSyncPlan } from '../../../domain/rosterV2/support/leagues/leagueTeamRoster.plan.js'
import { buildLeagueTeamPerformanceProjection, resolveLeagueTeamPoints } from '../../../domain/projections/teamPerformance.projection.js'
import { ROSTER_TEAM_INDEX_OWNED_FIELDS } from './contract.js'

const clean = value => String(value === undefined || value === null ? '' : value).trim()

const resolveLeagueSeason = ({ league = {}, seasonKey = '' } = {}) => {
  if (clean(league?.current?.seasonKey || league?.current?.seasonId) === clean(seasonKey)) {
    return { target: 'current', season: league.current }
  }

  const season = (Array.isArray(league?.history) ? league.history : [])
    .find(row => clean(row?.seasonKey || row?.seasonId) === clean(seasonKey))

  return season ? { target: 'history', season } : null
}

const pickFields = (value, fields) => fields.reduce(
  (result, field) => value?.[field] === undefined
    ? result
    : { ...result, [field]: value[field] },
  {}
)

export function buildExpectedRosterAuditV2({ canonical = {} } = {}) {
  const { teamRoot = {}, teamSeason = {}, league = {} } = canonical
  const resolved = resolveLeagueSeason({
    league,
    seasonKey: canonical.seasonKey,
  })
  if (!resolved) throw new Error('Roster canonical League season was not found')

  const season = {
    ...resolved.season,
    ...teamSeason,
    seasonKey: canonical.seasonKey,
    leagueId: canonical.leagueId,
  }
  const team = {
    ...teamRoot,
    ...teamSeason,
    birthTeamDocumentId: canonical.birthTeamDocumentId,
  }
  const players = Array.isArray(teamSeason.teamPlayers) ? teamSeason.teamPlayers : []
  const playerPlan = buildPlayerSeasonIndexSyncPlan({
    league,
    season,
    team,
    target: resolved.target,
    players,
    replaceScope: true,
    existingRows: [],
  })
  const expectedPlayerIndexes = playerPlan.operations
    .filter(operation => operation.type === 'upsert')
    .map(operation => ({
      id: operation.docId,
      fields: operation.patch || {},
    }))

  const performance = buildLeagueTeamPerformanceProjection({
    league,
    season,
    target: resolved.target,
    team,
  })
  const points = resolveLeagueTeamPoints({
    league,
    season,
    target: resolved.target,
    team,
  })
  const teamIndexPlan = buildTeamSeasonRosterMetaSyncPlan({
    league,
    season,
    team,
    target: resolved.target,
    playersCount: players.length,
    playerSeasonIndexCount: expectedPlayerIndexes.length,
    teamBalance: teamSeason.teamBalance || null,
    teamPerformance: performance,
    points,
    teamSeasonDocumentId: buildTeamSeasonDocumentId(
      canonical.birthTeamDocumentId,
      canonical.seasonKey
    ),
  })
  const leaguePlan = buildLeagueTeamRosterSyncPlan({
    league,
    season,
    team: {
      ...team,
      playersCount: players.length,
      ...buildTeamLoadStatus(players),
    },
  })

  if (!leaguePlan.patch || !clean(leaguePlan.target?.sourceTarget)) {
    throw new Error('Roster team row was not found in canonical League season')
  }

  return {
    playerSearchIndexes: expectedPlayerIndexes,
    teamSearchIndex: {
      id: teamIndexPlan.docId,
      fields: pickFields(teamIndexPlan.patch, ROSTER_TEAM_INDEX_OWNED_FIELDS),
    },
    leagueRosterMetadata: {
      leagueId: canonical.leagueId,
      target: leaguePlan.target,
      fields: leaguePlan.patch,
    },
  }
}
