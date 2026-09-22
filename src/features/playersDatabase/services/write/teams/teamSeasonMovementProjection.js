// Shared post-counterpart projection boundary. Only a real counterpart Team
// Season mutation may refresh its Club and Clubs Master projections.

import { getLeagueById } from '../../read/entities/league.js'
import {
  buildLeagueTeamPerformanceProjection,
  resolveLeagueTeamPoints,
} from '../../../domain/projections/teamPerformance.projection.js'
import { syncClubProjectionFromTeamSeason } from '../clubs/index.js'
import { reconcileTeamSeasonMovementCounterparts } from './teamSeasonMovement.js'

const clean = value => String(value === undefined || value === null ? '' : value).trim()

const refreshChangedCounterpartClubProjection = async result => {
  if (!result?.changed || !result?.teamSeason) return { skipped: true, reason: 'counterpartUnchanged' }

  const teamSeason = result.teamSeason
  const leagueId = clean(teamSeason.leagueId)
  const seasonKey = clean(teamSeason.seasonKey || teamSeason.seasonId)
  if (!leagueId || !seasonKey) return { skipped: true, reason: 'counterpartContextMissing' }

  const league = await getLeagueById(leagueId)
  if (!league) return { skipped: true, reason: 'counterpartLeagueMissing' }

  const season = {
    seasonId: clean(teamSeason.seasonId || seasonKey),
    seasonKey,
    seasonStatus: clean(teamSeason.seasonStatus),
    leagueId,
    ageGroupId: clean(teamSeason.ageGroupId),
    birthYear: Number(teamSeason.birthYear) || 0,
    leagueTotalRound: Number(teamSeason.leagueTotalRound) || 0,
  }
  const team = {
    ...teamSeason,
    teamId: clean(teamSeason.birthTeamId || teamSeason.teamId || teamSeason.birthTeamDocumentId),
    birthTeamDocumentId: clean(teamSeason.birthTeamDocumentId || teamSeason.teamDocumentId),
  }
  const target = season.seasonStatus === 'completed' ? 'history' : 'current'
  const performance = buildLeagueTeamPerformanceProjection({ league, season, target, team })
  const points = resolveLeagueTeamPoints({ league, season, target, team })

  return syncClubProjectionFromTeamSeason({
    league,
    season,
    team,
    teamSeason,
    performance,
    points,
    canonicalCommitted: true,
    lastWriteAction: 'RECONCILE_MOVEMENT_COUNTERPART',
  })
}

export async function reconcileTeamSeasonMovementCounterpartsWithClubRefresh({ requests = [] } = {}) {
  const reconciliation = await reconcileTeamSeasonMovementCounterparts({ requests })
  const projectionResults = []

  for (const result of reconciliation.results || []) {
    if (!result?.changed) continue
    try {
      projectionResults.push({
        teamSeasonDocumentId: result.teamSeasonDocumentId,
        result: await refreshChangedCounterpartClubProjection(result),
      })
    } catch (error) {
      // Projection failure must never invalidate the already committed local
      // movement fact or the counterpart fact. It remains observable here.
      projectionResults.push({
        teamSeasonDocumentId: result.teamSeasonDocumentId,
        error: String(error?.message || 'Counterpart Club projection failed'),
      })
    }
  }

  return { ...reconciliation, projectionResults }
}