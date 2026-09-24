import { buildTeamLoadStatus } from '../../../../model/team/teamLoadStatus.model.js'
import { preparePlayerScoutProfileDocsPlan } from '../../players/playerScoutProfiles.js'
import { buildTeamSeasonPlayersScoutProjectionPlan } from '../../teams/teamSeasonPlayer.js'
import { prepareTeamSeasonMovementCounterpartPlans } from '../../teams/teamSeasonMovement.js'
import { prepareTeamSeasonMovementCounterpartProjectionPlans } from '../../teams/teamSeasonMovementProjection.js'
import { prepareStatsCanonicalPlan } from './prepareStatsCanonicalPlan.js'
import { buildStatsProjectionManifest } from '../../teamStatsProjectionJobs/teamStatsProjectionManifest.js'
import { preparePlayerSeasonSearchIndexStatsPlan } from '../../searchIndex/player/playerSeasonIndex.stats.plan.js'
import { prepareLeagueTeamMetadataStatsPlan } from '../../leagues/leagueTeamMetadata.stats.plan.js'
import { prepareTeamSeasonSearchIndexStatsPlan } from '../../searchIndex/team/teamSeasonIndex.stats.plan.js'
import { prepareMainClubStatsProjectionPlan } from '../../clubs/mainClubStats.plan.js'

const clean = value => String(value === undefined || value === null ? '' : value).trim()

const resolvePlayerProjectionKey = player => clean(
  player?.playerId ||
  player?.externalPlayerId ||
  player?.identityKey ||
  player?.playerDocumentId ||
  player?.fullName
)

const mergeScoutedPlayerProjections = ({ players = [], scoutedPlayers = [] } = {}) => {
  const scoutedLookup = new Map(
    (Array.isArray(scoutedPlayers) ? scoutedPlayers : [])
      .map(player => [resolvePlayerProjectionKey(player), player])
      .filter(([key]) => key)
  )

  return (Array.isArray(players) ? players : []).map(player => {
    const key = resolvePlayerProjectionKey(player)
    const scoutedPlayer = key ? scoutedLookup.get(key) : null

    return scoutedPlayer ? { ...player, ...scoutedPlayer } : player
  })
}

export async function prepareApprovedStatsPlan({
  league = {},
  season = {},
  team = {},
  players = [],
  teamPerformance = null,
  teamPoints = null,
  statsProjectionRevision = '',
  trackedAt = '',
} = {}) {
  const effectiveTrackedAt = clean(trackedAt)
  if (!effectiveTrackedAt) throw new Error('Missing approved stats trackedAt')

  const canonical = await prepareStatsCanonicalPlan({
    league,
    season,
    team,
    players,
    teamPerformance,
    teamPoints,
    statsProjectionRevision,
  })
  const canonicalCommit = canonical.canonicalCommit
  const canonicalPlayers = Array.isArray(canonicalCommit.players)
    ? canonicalCommit.players
    : []
  const plannedTeam = {
    ...(canonicalCommit.canonicalTeamContext || team || {}),
    birthTeamDocumentId: canonicalCommit.birthTeamDocumentId,
    teamDocumentId: canonicalCommit.teamDocumentId,
    ...buildTeamLoadStatus(canonicalPlayers),
  }
  const playerScout = await preparePlayerScoutProfileDocsPlan({
    season,
    team: plannedTeam,
    target: canonicalCommit.target,
    players: canonicalPlayers,
    teamSeasonDocument: canonicalCommit.seasonDocument || null,
    trackedAt: effectiveTrackedAt,
  })
  const teamScout = buildTeamSeasonPlayersScoutProjectionPlan({
    current: canonicalCommit.seasonDocument || {},
    season,
    team: plannedTeam,
    scoutedPlayers: playerScout.scoutedPlayers,
  })
  const counterparts = await prepareTeamSeasonMovementCounterpartPlans({
    requests: canonicalCommit.movementState?.counterpartRequests || [],
    movementProjectionRevision: statsProjectionRevision,
  })
  const playerSeasonIndexPlayers = mergeScoutedPlayerProjections({
    players: Array.isArray(teamScout.players) ? teamScout.players : canonicalPlayers,
    scoutedPlayers: playerScout.scoutedPlayers,
  })
  const playerSeasonIndexes = await preparePlayerSeasonSearchIndexStatsPlan({
    league,
    season,
    team: plannedTeam,
    target: canonicalCommit.target,
    players: playerSeasonIndexPlayers,
    sourceRevision: statsProjectionRevision,
  })
  const leagueMetadata = await prepareLeagueTeamMetadataStatsPlan({
    league,
    season,
    target: canonicalCommit.target,
    team: plannedTeam,
    scoutProfilesSummary: teamScout.scoutProfilesSummary || null,
    teamTaskSignals: canonicalCommit.seasonDocument?.teamBalance?.teamTaskSignals || null,
    sourceRevision: statsProjectionRevision,
    trackedAt: effectiveTrackedAt,
  })
  const teamSeasonIndex = await prepareTeamSeasonSearchIndexStatsPlan({
    league,
    season,
    team: plannedTeam,
    target: canonicalCommit.target,
    playersCount: canonicalCommit.playersCount,
    scoutProfilesSummary: teamScout.scoutProfilesSummary || null,
    teamBalance: canonicalCommit.teamBalance,
    teamPerformance,
    teamSeasonDocumentId: canonicalCommit.teamSeasonDocumentId,
    sourceRevision: statsProjectionRevision,
  })
  const mainClubProjection = await prepareMainClubStatsProjectionPlan({
    league,
    season,
    team: plannedTeam,
    teamSeason: canonicalCommit.seasonDocument || {},
    performance: teamPerformance,
    points: teamPoints,
    leagueScoutProfilesSummary: teamScout.scoutProfilesSummary || null,
    sourceRevision: statsProjectionRevision,
    trackedAt: effectiveTrackedAt,
  })
  const counterpartProjections = await prepareTeamSeasonMovementCounterpartProjectionPlans({
    counterpartPlan: counterparts,
    baseClubStates: mainClubProjection?.composedState?.club
      ? [mainClubProjection.composedState.club]
      : [],
    baseClubsMaster: mainClubProjection?.composedState?.clubsMaster || null,
  })

  const approvedStatsPlan = {
    planType: 'approvedStatsPlan',
    planVersion: 1,
    trackedAt: effectiveTrackedAt,
    statsProjectionRevision,
    teamPerformance,
    teamPoints,
    birthTeamDocumentId: canonicalCommit.birthTeamDocumentId,
    seasonKey: canonicalCommit.seasonKey,
    sourceFingerprints: canonical.sourceFingerprints,
    canonical,
    playerScout,
    teamScout,
    teamLoadStatus: buildTeamLoadStatus(canonicalPlayers),
    scoutProfilesSummary: teamScout.scoutProfilesSummary || null,
    counterparts,
    counterpartProjections,
    playerSeasonIndexes,
    leagueMetadata,
    teamSeasonIndex,
    mainClubProjection,
    approvedCounterpartRequests: Array.isArray(canonicalCommit.movementState?.counterpartRequests)
      ? canonicalCommit.movementState.counterpartRequests
      : [],
  }

  return {
    ...approvedStatsPlan,
    projectionManifest: buildStatsProjectionManifest({ approvedStatsPlan }),
  }
}
