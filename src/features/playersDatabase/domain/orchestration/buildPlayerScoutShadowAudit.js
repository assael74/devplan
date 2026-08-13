// src/features/playersDatabase/domain/orchestration/buildPlayerScoutShadowAudit.js

import { buildPlayerScoutResult } from '../../../../shared/scouting/players/index.js'
import { normalizePlayerStats } from '../../model/playerStats.model.js'
import { buildPlayerScoutCalculationContract } from '../contracts/playerScoutInput.contract.js'

const clean = value => String(value || '').trim()

const isScoutExcludedRosterStatus = player => [
  'retired',
  'transferredOut',
].includes(clean(player?.rosterStatus))

const uniqueValues = values => Array.from(new Set(
  (Array.isArray(values) ? values : [])
    .map(clean)
    .filter(Boolean)
))

const buildScoutPlayer = player => {
  const playerStats = normalizePlayerStats(player)

  return {
    ...player,
    position: player.primaryPosition || player.position || '',
    games: playerStats.games,
    goals: playerStats.goals,
    yellowCards: playerStats.yellowCards,
    minutes: playerStats.minutes,
    starts: playerStats.starts,
    subIn: playerStats.substituteIn,
    subOut: playerStats.substitutedOut,
    playerStats,
  }
}

const buildProfileIds = signals => uniqueValues(
  (Array.isArray(signals) ? signals : [])
    .map(signal => signal?.profileId || signal?.id)
)

const buildSpotlightIds = spotlights => uniqueValues(
  (Array.isArray(spotlights) ? spotlights : [])
    .map(spotlight => spotlight?.id)
)

const difference = (left, right) => left.filter(value => !right.includes(value))

const resolvePlayerId = player => clean(
  player.playerId ||
  player.externalPlayerId ||
  player.identityKey
)

const resolveDisplayName = player => clean(
  player.matchedPlayerName ||
  player.fullName ||
  player.displayName
)

const buildProfileDistanceMap = progression => Object.fromEntries(
  (Array.isArray(progression?.distances) ? progression.distances : [])
    .filter(item => item?.profileId && Number.isFinite(Number(item?.distance)))
    .map(item => [item.profileId, Number(item.distance)])
)

const buildPreviousProfileDistances = ({
  player,
  league,
  team,
  season,
  snapshot,
}) => {
  if (!snapshot) return null

  const leagueLevel = league?.level || team?.leagueLevel || season?.leagueLevel || null
  const previousPlayer = buildScoutPlayer({
    ...player,
    games: snapshot.games,
    goals: snapshot.goals,
    minutes: snapshot.minutes,
    starts: snapshot.starts,
    substituteIn: snapshot.substituteIn,
    substitutedOut: snapshot.substitutedOut,
    playerStats: {
      games: snapshot.games,
      goals: snapshot.goals,
      minutes: snapshot.minutes,
      starts: snapshot.starts,
      substituteIn: snapshot.substituteIn,
      substitutedOut: snapshot.substitutedOut,
      teamGames: snapshot.teamGamePlayed,
    },
  })
  const previousContract = buildPlayerScoutCalculationContract({
    player: previousPlayer,
    team: {
      ...team,
      teamGamePlayed: snapshot.teamGamePlayed,
      leagueLevel,
    },
    season: {
      ...season,
      leagueLevel,
    },
  })
  const previousResult = buildPlayerScoutResult({
    player: previousContract.player,
    team: previousContract.team,
    season: previousContract.season,
    perspective: 'players_database_shadow_snapshot',
  })

  return buildProfileDistanceMap(previousResult.profileProgression)
}

const buildPlayerShadowRow = ({
  player,
  league,
  team,
  season,
  snapshotRow,
}) => {
  if (isScoutExcludedRosterStatus(player)) {
    const v1ProfileIds = buildProfileIds(
      Array.isArray(player.scoutSignals)
        ? player.scoutSignals
        : player.scoutProfiles
    )

    return {
      playerId: resolvePlayerId(player),
      displayName: resolveDisplayName(player),
      v1ProfileIds,
      v2ProfileIds: [],
      addedProfileIds: [],
      removedProfileIds: v1ProfileIds,
      sameProfiles: v1ProfileIds.length === 0,
      opportunityStatus: 'excluded',
      spotlightIds: [],
      contractValid: true,
      contractIssues: [],
    }
  }
  const leagueLevel = league?.level || team?.leagueLevel || season?.leagueLevel || null
  const contract = buildPlayerScoutCalculationContract({
    player: buildScoutPlayer(player),
    team: {
      ...team,
      leagueLevel,
    },
    season: {
      ...season,
      leagueLevel,
    },
  })
  const previousProfileDistances = buildPreviousProfileDistances({
    player,
    league,
    team,
    season,
    snapshot: snapshotRow?.previous,
  })
  const v2Result = buildPlayerScoutResult({
    player: contract.player,
    team: contract.team,
    season: contract.season,
    perspective: 'players_database_shadow',
    previousProfileDistances,
    verificationAnswers:
      player?.verification?.answers ||
      player?.verificationAnswers ||
      [],
  })
  const v1ProfileIds = buildProfileIds(
    Array.isArray(player.scoutSignals)
      ? player.scoutSignals
      : player.scoutProfiles
  )
  const v2ProfileIds = buildProfileIds(v2Result.signals)
  const addedProfileIds = difference(v2ProfileIds, v1ProfileIds)
  const removedProfileIds = difference(v1ProfileIds, v2ProfileIds)
  const primarySignal = v2Result.profileHierarchy?.primarySignal || null
  const teamGate = primarySignal?.scoutContext?.teamGate || null

  return {
    playerId: resolvePlayerId(player),
    displayName: resolveDisplayName(player),
    v1ProfileIds,
    v2ProfileIds,
    addedProfileIds,
    removedProfileIds,
    sameProfiles: addedProfileIds.length === 0 && removedProfileIds.length === 0,
    opportunityStatus: clean(v2Result.opportunity?.actionStatus),
    teamGateMode: clean(teamGate?.mode),
    teamGateReason: clean(teamGate?.reason),
    primaryProfileId: clean(v2Result.profileHierarchy?.primaryProfileId),
    primaryProfileDepthPct: Number.isFinite(
      Number(v2Result.profileHierarchy?.primarySignal?.profileDepth?.depthPct)
    )
      ? Number(v2Result.profileHierarchy.primarySignal.profileDepth.depthPct)
      : null,
    supportingProfileIds: Array.isArray(v2Result.profileHierarchy?.supportingProfileIds)
      ? v2Result.profileHierarchy.supportingProfileIds
      : [],
    spotlightIds: buildSpotlightIds(v2Result.spotlights),
    candidateSignals: Array.isArray(v2Result.candidateSignals)
      ? v2Result.candidateSignals
      : [],
    nearestProfile: v2Result.profileProgression?.nearestProfile || null,
    verification: v2Result.verification || null,
    nextBestCheckId: clean(v2Result.verification?.nextBestCheck?.questionId),
    missingCheckIds: Array.isArray(v2Result.verification?.missingChecks)
      ? v2Result.verification.missingChecks.map(check => check.questionId)
      : [],
    snapshotChanged: snapshotRow?.changed === true,
    contractValid: contract.valid,
    contractIssues: Array.isArray(contract.issues) ? contract.issues : [],
  }
}

const buildStatusCounts = rows => rows.reduce((counts, row) => {
  const status = row.opportunityStatus || 'unavailable'

  return {
    ...counts,
    [status]: (counts[status] || 0) + 1,
  }
}, {})

export const buildPlayerScoutShadowAudit = ({
  players = [],
  league = {},
  team = {},
  season = {},
  snapshotRows = [],
} = {}) => {
  const safePlayers = Array.isArray(players) ? players : []
  const snapshotLookup = new Map(
    (Array.isArray(snapshotRows) ? snapshotRows : [])
      .map(row => [clean(row?.playerId || row?.displayName), row])
      .filter(([key]) => key)
  )
  const rows = safePlayers.map((player) => {
    const playerKey = resolvePlayerId(player) || resolveDisplayName(player)

    return buildPlayerShadowRow({
      player,
      league,
      team,
      season,
      snapshotRow: snapshotLookup.get(playerKey) || null,
    })
  })

  return {
    engineVersion: 'scouting-v2-shadow',
    mode: 'shadow',
    status: 'complete',
    totalPlayers: rows.length,
    v1ProfiledPlayers: rows.filter(row => row.v1ProfileIds.length > 0).length,
    v2ProfiledPlayers: rows.filter(row => row.v2ProfileIds.length > 0).length,
    sameProfilePlayers: rows.filter(row => row.sameProfiles).length,
    changedProfilePlayers: rows.filter(row => !row.sameProfiles).length,
    v2AddedProfilePlayers: rows.filter(row => row.addedProfileIds.length > 0).length,
    v2RemovedProfilePlayers: rows.filter(row => row.removedProfileIds.length > 0).length,
    nearProfilePlayers: rows.filter(row => row.candidateSignals?.length > 0).length,
    closingProfilePlayers: rows.filter(row => row.candidateSignals?.some(signal => [
      'closing',
      'closing_fast',
    ].includes(clean(signal?.trend)))).length,
    playersWithMissingChecks: rows.filter(row => row.missingCheckIds?.length > 0).length,
    playersWithNextBestCheck: rows.filter(row => Boolean(row.nextBestCheckId)).length,
    opportunityStatusCounts: buildStatusCounts(rows),
    teamGateModeCounts: rows.reduce((counts, row) => {
      const mode = row.teamGateMode || 'unavailable'

      return {
        ...counts,
        [mode]: (counts[mode] || 0) + 1,
      }
    }, {}),
    rows,
  }
}
