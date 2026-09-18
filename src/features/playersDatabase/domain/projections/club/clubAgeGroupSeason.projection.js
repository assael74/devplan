// League + Team Season facts -> one Club age-group season projection. Pure builder.

import { cleanValue, pickDefinedValue, toNumberOrZero } from '../../../model/shared/value.model.js'
import { normalizeSeasonStatus } from '../../../model/shared/season.model.js'
import { resolveAgeGroupLabel } from '../../../catalog/ageGroups.catalog.js'
import { resolveTeamLookupKey } from '../../../model/team/teamIdentity.model.js'
import { buildClubTransferSummary } from './clubTransfers.projection.js'
import { CLUB_TRANSFER_COVERAGE_STATUS } from '../../contracts/club.contract.js'

const normalizeScoutProfilesSummary = value => ({
  total: toNumberOrZero(value?.total),
  profileCounts: value?.profileCounts && typeof value.profileCounts === 'object'
    ? { ...value.profileCounts }
    : {},
})

const normalizeTeamTaskSignals = value => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return undefined

  const signals = {}

  if (typeof value.offense === 'boolean') {
    signals.offense = value.offense
  }

  if (typeof value.defense === 'boolean') {
    signals.defense = value.defense
  }

  return Object.keys(signals).length ? signals : undefined
}

const normalizeTeamTaskAvailability = value => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return undefined

  return {
    availability: cleanValue(value.availability),
    reason: cleanValue(value.availabilityReason) || null,
  }
}

const normalizeLineStructure = value => {
  const lines = value?.lines
  if (!lines || typeof lines !== 'object' || Array.isArray(lines)) return undefined

  return {
    lines: {
      attack: { playersCount: toNumberOrZero(lines?.attack?.playersCount) },
      defense: { playersCount: toNumberOrZero(lines?.defense?.playersCount) },
      midfield: { playersCount: toNumberOrZero(lines?.midfield?.playersCount) },
    },
  }
}

const teamSlotOf = ({ team = {}, teamSeason = {} } = {}) => {
  const value = [
    team?.birthTeamSlot,
    team?.teamSlot,
    team?.identity?.birthTeamSlot,
    team?.identity?.teamSlot,
    teamSeason?.birthTeamSlot,
    teamSeason?.teamSlot,
    teamSeason?.identity?.birthTeamSlot,
    teamSeason?.identity?.teamSlot,
  ].find(candidate => Number.isInteger(Number(candidate)) && Number(candidate) > 0)

  return value ? Number(value) : null
}

// Scouting priority is projected from the League table row. Keeping its shape
// explicit prevents a Team Season update from becoming a competing source.
export const normalizeClubScoutPerformanceSide = value => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return undefined

  const priorityLevel = cleanValue(value.priorityLevel)
  return priorityLevel ? { priorityLevel } : undefined
}

const normalizePerformance = ({ performance = {}, points } = {}) => ({
  tableRank: pickDefinedValue(performance?.tableRank, null),
  tableAttackRank: pickDefinedValue(performance?.tableAttackRank, null),
  tableDefenseRank: pickDefinedValue(performance?.tableDefenseRank, null),
  points: toNumberOrZero(points),
  teamGamePlayed: toNumberOrZero(performance?.teamGamePlayed),
  goalsFor: toNumberOrZero(performance?.goalsFor),
  goalsAgainst: toNumberOrZero(performance?.goalsAgainst),
  goalsForPerGame: pickDefinedValue(performance?.goalsForPerGame, null),
  goalsAgainstPerGame: pickDefinedValue(performance?.goalsAgainstPerGame, null),
})

export const buildClubScoutPerformanceProjection = ({
  leagueTeam,
  clearMissing = false,
} = {}) => {
  if (leagueTeam === undefined) return undefined

  const offense = normalizeClubScoutPerformanceSide(
    leagueTeam?.teamAttackPerformance ||
    leagueTeam?.offense ||
    leagueTeam?.performance?.offense
  )
  const defense = normalizeClubScoutPerformanceSide(
    leagueTeam?.teamDefensePerformance ||
    leagueTeam?.defense ||
    leagueTeam?.performance?.defense
  )

  return offense || defense
    ? {
        ...(offense ? { offense } : {}),
        ...(defense ? { defense } : {}),
      }
    : (clearMissing ? { offense: null, defense: null } : undefined)
}

export const buildClubAgeGroupSeasonProjection = ({
  season = {},
  league = {},
  team = {},
  performance,
  points,
  leagueTeam,
  leagueScoutProfilesSummary,
  teamSeason = {},
  transferCoverageStatus = CLUB_TRANSFER_COVERAGE_STATUS.NOT_LOADED,
  updatedAt = null,
} = {}) => {
  const ageGroupId = cleanValue(league?.ageGroupId || teamSeason?.ageGroupId)
  // Keep the Club projection keyed by the same birth-team identity used by
  // Team Season persistence.  Page models may expose this as birthTeamId.
  const teamId = cleanValue(
    resolveTeamLookupKey(team) || resolveTeamLookupKey(teamSeason)
  )
  const ageGroupLabel = resolveAgeGroupLabel({
    ageGroupId,
    ageGroupLabel: league?.ageGroupLabel,
  })

  const leaguePerformance = performance && typeof performance === 'object'
    ? normalizePerformance({ performance, points })
    : undefined
  const scoutPerformance = buildClubScoutPerformanceProjection({
    leagueTeam,
    clearMissing: leagueTeam !== undefined,
  })
  const teamTaskSignals = normalizeTeamTaskSignals(teamSeason?.teamTaskSignals)
  const teamTaskAvailability = normalizeTeamTaskAvailability(
    teamSeason?.teamBalance?.balanceAvailability
  )
  const lineStructure = normalizeLineStructure(
    teamSeason?.teamBalance?.lineStructure || teamSeason?.lineStructure
  )

  return {
    ageGroupId,
    ageGroupLabel,
    season: {
      teamId,
      teamSlot: teamSlotOf({ team, teamSeason }),
      seasonId: cleanValue(season?.seasonId || teamSeason?.seasonId),
      seasonKey: cleanValue(season?.seasonKey || teamSeason?.seasonKey),
      seasonStatus: normalizeSeasonStatus(
        season?.seasonStatus || teamSeason?.seasonStatus
      ),
      birthYear: toNumberOrZero(season?.birthYear || teamSeason?.birthYear),
      league: {
        leagueId: cleanValue(league?.leagueId || league?.id || teamSeason?.leagueId),
        leagueName: cleanValue(league?.leagueName || league?.name),
        region: cleanValue(league?.region),
        leagueLevel: toNumberOrZero(league?.level || teamSeason?.leagueLevel) || null,
      },
      ...(leaguePerformance || scoutPerformance
        ? { performance: { ...leaguePerformance, ...scoutPerformance } }
        : {}),
      playersCount: toNumberOrZero(teamSeason?.playersCount),
      ...(teamTaskSignals ? { teamTaskSignals } : {}),
      ...(teamTaskAvailability ? { teamTaskAvailability } : {}),
      ...(lineStructure ? { lineStructure } : {}),
      ...(leagueScoutProfilesSummary !== undefined
        ? { scoutProfilesSummary: normalizeScoutProfilesSummary(leagueScoutProfilesSummary) }
        : {}),
      ...(transferCoverageStatus === null
        ? {}
        : {
            transfers: buildClubTransferSummary({
              transfersIn: teamSeason?.transfersIn,
              transfersOut: teamSeason?.transfersOut,
              pendingPlayers: teamSeason?.pendingPlayers,
              clubId: team?.clubId || teamSeason?.clubId || teamSeason?.identity?.clubId,
              coverageStatus: transferCoverageStatus,
            }),
          }),
      updatedAt,
    },
  }
}
