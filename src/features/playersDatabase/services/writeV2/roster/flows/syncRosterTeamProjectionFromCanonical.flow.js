import { getLeagueById } from '../../../read/entities/league.js'
import { getTeamById } from '../../../read/entities/team.js'
import { getTeamSeason } from '../../../read/entities/teamSeason.js'
import { buildLeagueTeamPerformanceProjection, resolveLeagueSeasonStatus, resolveLeagueTeamPoints } from '../../../../domain/projections/teamPerformance.projection.js'
import { buildTeamSeasonRosterMetaSyncPlan } from '../../../../domain/rosterV2/support/searchIndex/team/teamSeasonRosterMeta.plan.js'
import { buildLeagueTeamRosterSyncPlan } from '../../../../domain/rosterV2/support/leagues/leagueTeamRoster.plan.js'
import { buildTeamLoadStatus } from '../../../../model/team/teamLoadStatus.model.js'
import { syncRosterTeamProjectionV2 } from './syncRosterTeamProjection.flow.js'

const clean = value => String(value === undefined || value === null ? '' : value).trim()

const findLeagueSeason = ({ league = {}, seasonKey = '' } = {}) => {
  const current = league.current || null
  if (clean(current?.seasonKey || current?.seasonId) === clean(seasonKey)) {
    return { season: current, target: 'current' }
  }

  const historySeason = (Array.isArray(league.history) ? league.history : [])
    .find(season => clean(season?.seasonKey || season?.seasonId) === clean(seasonKey))

  return historySeason ? { season: historySeason, target: 'history' } : null
}

// Temporary audit repair: rebuilds only Stage 4 from existing canonical data.
// It deliberately does not write Team Season, roster membership, Movement, or Pending.
export async function syncRosterTeamProjectionFromCanonicalV2({
  birthTeamDocumentId = '',
  seasonKey = '',
} = {}) {
  const teamId = clean(birthTeamDocumentId)
  const safeSeasonKey = clean(seasonKey)
  if (!teamId || !safeSeasonKey) throw new Error('Missing Team Season audit scope')

  const teamSeason = await getTeamSeason({
    birthTeamDocumentId: teamId,
    seasonKey: safeSeasonKey,
    bypassCache: true,
  })
  if (!teamSeason) throw new Error('Canonical Team Season was not found')

  const teamRoot = await getTeamById(teamId, { bypassCache: true })
  if (!teamRoot) throw new Error('Canonical Team Root was not found')

  const leagueId = clean(teamSeason.leagueId)
  const league = await getLeagueById(leagueId, { bypassCache: true })
  if (!league) throw new Error('Canonical League document was not found')

  const leagueSeason = findLeagueSeason({ league, seasonKey: safeSeasonKey })
  if (!leagueSeason) throw new Error('Canonical League season was not found')

  const season = {
    ...leagueSeason.season,
    seasonId: clean(leagueSeason.season.seasonId || leagueSeason.season.seasonKey),
    seasonKey: safeSeasonKey,
    seasonStatus: resolveLeagueSeasonStatus({ league, season: leagueSeason.season }),
    leagueId,
    birthYear: teamSeason.birthYear,
  }
  const team = {
    ...teamRoot,
    ...teamSeason,
    id: teamId,
    birthTeamId: clean(teamSeason.birthTeamId || teamId),
    birthTeamDocumentId: teamId,
    teamId,
    teamDocumentId: teamId,
  }
  const players = Array.isArray(teamSeason.teamPlayers) ? teamSeason.teamPlayers : []
  const loadStatus = buildTeamLoadStatus(players)
  const teamPerformance = buildLeagueTeamPerformanceProjection({
    league,
    season,
    target: leagueSeason.target,
    team,
  })
  if (!teamPerformance) throw new Error('Team row was not found in the canonical League season')
  const teamPoints = resolveLeagueTeamPoints({
    league,
    season,
    target: leagueSeason.target,
    team,
  })

  const teamIndexPlan = buildTeamSeasonRosterMetaSyncPlan({
    league,
    season,
    team,
    target: leagueSeason.target,
    playersCount: loadStatus.playersCount,
    playerSeasonIndexCount: loadStatus.playersCount,
    scoutProfilesSummary: teamSeason.scoutProfilesSummary || null,
    teamBalance: teamSeason.teamBalance || null,
    teamPerformance,
    points: teamPoints,
    teamSeasonDocumentId: teamSeason.id,
  })
  const leagueTeamPlan = buildLeagueTeamRosterSyncPlan({
    league,
    season,
    team: {
      ...team,
      ...loadStatus,
    },
  })
  if (!leagueTeamPlan.patch || !clean(leagueTeamPlan.target?.sourceTarget)) {
    throw new Error('Team row was not found in the canonical League season')
  }

  return syncRosterTeamProjectionV2({
    approvedTeamProjectionState: {
      searchIndex: { docId: teamIndexPlan.docId, fields: teamIndexPlan.patch },
      league: {
        leagueId,
        target: leagueTeamPlan.target,
        patch: leagueTeamPlan.patch,
      },
    },
  })
}