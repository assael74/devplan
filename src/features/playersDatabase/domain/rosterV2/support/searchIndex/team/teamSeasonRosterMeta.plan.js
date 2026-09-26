import { normalizeTeamIdentity } from '../../../../../model/team/teamIdentity.model.js'
import { buildSeasonKey, clean, toNumberOrZero } from '../../leagues/leagueDoc.js'
import {
  buildTeamSeasonIndexId,
  resolveClubLevel,
  resolveClubStrengthLevel,
} from './teamSeasonIndex.model.js'
import { buildTeamBalanceSearchIndexProjection } from '../../../../projections/teamBalanceSearchIndex.projection.js'
import { buildTeamSearchIndexPerformanceProjection } from '../../../../projections/teamPerformance.projection.js'
import { normalizeScoutProfilesSummary } from '../../../../projections/teamScoutSummary.projection.js'
import { buildTeamSeasonSearchMetrics } from '../../../../projections/searchIndexNormalization.projection.js'

export const buildTeamSeasonRosterMetaSyncPlan = ({
  league = {}, season = {}, team = {}, target = 'current', playersCount = 0,
  playerSeasonIndexCount = 0, scoutProfilesSummary = null, teamBalance = null,
  teamPerformance = null, points = 0, teamSeasonDocumentId = '', resetStatsDerived = false,
} = {}) => {
  const leagueId = clean(league.id || season.leagueId || team.leagueId)
  const rawSeasonId = clean(season.seasonId)
  const seasonKey = clean(season.seasonKey) || buildSeasonKey(rawSeasonId)
  const seasonId = rawSeasonId || seasonKey
  const teamIdentity = normalizeTeamIdentity({ team })
  const teamId = clean(teamIdentity.birthTeamId || teamIdentity.teamId)
  const clubId = clean(team.clubId)
  const linkedTeamSeasonDocumentId = clean(teamSeasonDocumentId)
  const docId = buildTeamSeasonIndexId({ leagueId, seasonKey, teamId, clubId })
  if (!docId) throw new Error('Missing team season index id')

  const patch = {
    id: docId,
    entityType: 'birthTeamSeason',
    entityId: docId,
    leagueId,
    seasonId,
    seasonKey,
    seasonStatus: clean(season.seasonStatus) === 'completed' ? 'completed' : 'active',
    seasonDataStatus: clean(season.seasonStatus) === 'completed' ? 'historical' : 'current',
    clubId,
    clubLevel: resolveClubLevel({ clubId, clubLevel: team.clubLevel }),
    clubStrengthLevel: resolveClubStrengthLevel({
      clubId, clubLevel: team.clubLevel, clubStrengthLevel: team.clubStrengthLevel,
    }),
    birthTeamId: teamId,
    birthTeamDocumentId: teamIdentity.birthTeamDocumentId || teamId,
    birthTeamSlot: toNumberOrZero(team.birthTeamSlot || team.teamSlot) || 1,
    teamId,
    teamDocumentId: teamIdentity.birthTeamDocumentId || teamIdentity.teamDocumentId || teamId,
    ...(linkedTeamSeasonDocumentId ? { teamSeasonDocumentId: linkedTeamSeasonDocumentId } : {}),
    teamUrl: clean(team.teamUrl),
    seasonUrl: clean(season.seasonUrl),
    birthYear: toNumberOrZero(season.birthYear),
    leagueTotalRound: toNumberOrZero(season.leagueTotalRound),
    playersCount: toNumberOrZero(playersCount),
    playerSeasonIndexCount: toNumberOrZero(playerSeasonIndexCount),
    ...buildTeamSearchIndexPerformanceProjection(teamPerformance),
    ...buildTeamSeasonSearchMetrics({
      target,
      seasonStatus: season.seasonStatus,
      leagueTotalRound: season.leagueTotalRound,
      teamGamePlayed: teamPerformance?.teamGamePlayed,
      points,
      goalsFor: teamPerformance?.goalsFor,
      goalsAgainst: teamPerformance?.goalsAgainst,
    }),
    ...(scoutProfilesSummary !== null && scoutProfilesSummary !== undefined
      ? { scoutProfilesSummary: normalizeScoutProfilesSummary(scoutProfilesSummary) }
      : {}),
    ...buildTeamBalanceSearchIndexProjection(teamBalance),
    sourceTarget: clean(target) === 'history' ? 'history' : 'current',
  }

  return {
    docId,
    patch,
    expected: { entityType: 'birthTeamSeason', leagueId, seasonKey, birthTeamId: teamId },
    playersCount: toNumberOrZero(playersCount),
    playerSeasonIndexCount: toNumberOrZero(playerSeasonIndexCount),
    resetStatsDerived: Boolean(resetStatsDerived),
  }
}
