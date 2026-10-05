// src/features/playersDatabase/model/team/page/teamPagePlayer.model.js

import { adaptPlayerDocumentSeason } from '../../../domain/index.js'
import { PLAYER_STATS_STATUS } from '../../player/playerStats.model.js'

const clean = value => String(value === undefined || value === null ? '' : value).trim()
const object = value => (
  value && typeof value === 'object' && !Array.isArray(value) ? value : {}
)
const list = value => (Array.isArray(value) ? value : [])
const numberOrNull = value => {
  if (value === null || value === undefined || value === '') return null
  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

const buildScoutProfiles = scout => {
  const primary = object(scout.primary)
  const secondary = object(scout.secondary)
  const profileDepthsById = object(scout.profileDepthsById)
  const ids = [
    clean(primary.profileId),
    clean(secondary.profileId),
    ...list(scout.professionalProfileIds).map(clean),
    ...list(scout.preliminaryProfileIds).map(clean),
  ].filter(Boolean)

  return [...new Set(ids)].map(profileId => {
    const depthPct = [
      profileDepthsById[profileId],
      clean(primary.profileId) === profileId ? primary.strengthDepthPct : null,
      clean(secondary.profileId) === profileId ? secondary.strengthDepthPct : null,
    ].map(numberOrNull).find(value => value !== null)

    return depthPct === undefined
      ? { profileId }
      : { profileId, depthPct }
  })
}

const buildCanonicalTeamPagePlayerRow = ({
  playerId,
  rosterPlayer,
  statsPlayer,
  scoutPlayer,
  manualPlayer,
  index,
}) => {
  const playerStats = object(statsPlayer.playerStats)
  const primaryScout = object(scoutPlayer.primary)
  const scoutProfiles = buildScoutProfiles(scoutPlayer)
  const rosterStatus = clean(rosterPlayer.rosterStatus) || 'regular'

  return {
    ...rosterPlayer,
    id: playerId,
    playerId,
    playerDocumentId: playerId,
    externalPlayerId: clean(rosterPlayer.externalPlayerId),
    playerUrl: clean(manualPlayer.playerUrl),
    rosterStatus,
    statsStatus: clean(statsPlayer.statsStatus) || PLAYER_STATS_STATUS.MISSING,
    isYoungerAgeGroup: rosterStatus === 'youngerAgeGroup',
    number: rosterPlayer.numShirt || `${index + 1}`,
    numShirt: rosterPlayer.numShirt || '',
    fullName: clean(rosterPlayer.fullName),
    normalizedName: clean(rosterPlayer.normalizedName),
    primaryPosition: clean(scoutPlayer.primaryPosition),
    positionLayer: clean(scoutPlayer.positionLayer),
    lineClassification: statsPlayer.lineClassification || null,
    playerStats: {
      ...playerStats,
      teamGames: playerStats.teamGames === undefined
        ? playerStats.teamGamePlayed
        : playerStats.teamGames,
    },
    games: Number(playerStats.games || 0),
    goals: Number(playerStats.goals || 0),
    starts: Number(playerStats.starts || 0),
    yellowCards: Number(playerStats.yellowCards || 0),
    minutes: Number(playerStats.minutes || 0),
    primaryScoutProfileId: clean(primaryScout.profileId),
    professionalScoutProfileIds: list(scoutPlayer.professionalProfileIds),
    preliminaryScoutProfileIds: list(scoutPlayer.preliminaryProfileIds),
    scoutProfiles,
    scoutCombinations: list(scoutPlayer.combinationIds),
    scoutSeasonProjection: Object.keys(scoutPlayer).length ? scoutPlayer : null,
    scoutEffectiveImmediacyStatus: clean(scoutPlayer.scoutEffectiveImmediacyStatus),
    scoutPlayerInterestLevel: clean(scoutPlayer.scoutPlayerInterestLevel),
    scoutProfileDisplay: {
      label: clean(primaryScout.profileId) || '-',
      profileStrength: primaryScout.strengthDepthPct,
    },
    profile: clean(primaryScout.profileId) || '-',
    profileStrength: primaryScout.strengthDepthPct,
    isTeamScoutProjection: true,
  }
}

export const buildTeamPagePlayerRows = ({
  teamSeason = null,
  selectedSeasonOption = null,
} = {}) => {
  const rosterPlayersById = object(teamSeason?.roster?.playersById)

  if (Object.keys(rosterPlayersById).length) {
    const statsPlayersById = object(teamSeason?.stats?.playersById)
    const scoutingPlayersById = object(teamSeason?.scouting?.playersById)
    const manualPlayersById = object(teamSeason?.manual?.playersById)

    return Object.entries(rosterPlayersById).map(([playerId, rosterPlayer], index) => (
      buildCanonicalTeamPagePlayerRow({
        playerId,
        rosterPlayer: object(rosterPlayer),
        statsPlayer: object(statsPlayersById[playerId]),
        scoutPlayer: object(scoutingPlayersById[playerId]),
        manualPlayer: object(manualPlayersById[playerId]),
        index,
      })
    ))
  }

  return (Array.isArray(teamSeason?.teamPlayers) ? teamSeason.teamPlayers : [])
    .map((player, index) => adaptTeamPagePlayerRow({
      player,
      index,
      selectedSeasonOption,
      teamSeason,
    }))
}

export const buildTeamPageSeasonView = ({
  teamSeason = null,
  selectedSeasonOption = null,
} = {}) => {
  if (!teamSeason) return null

  const identity = object(teamSeason.identity)
  const competition = object(teamSeason.competitionSnapshot)
  const officialTable = object(competition.officialTable)
  const roster = object(teamSeason.roster)
  const stats = object(teamSeason.stats)
  const scouting = object(teamSeason.scouting)
  const movement = object(teamSeason.movement)
  const teamPlayers = buildTeamPagePlayerRows({
    teamSeason,
    selectedSeasonOption,
  })

  return {
    ...teamSeason,
    seasonId: clean(identity.seasonId),
    seasonKey: clean(identity.seasonKey),
    seasonStatus: clean(identity.seasonStatus),
    leagueId: clean(identity.leagueId),
    ageGroupId: clean(identity.ageGroupId),
    birthYear: Number(identity.birthYear) || null,
    teamUrl: clean(competition.teamUrl),
    tableRank: officialTable.rank,
    teamStats: {
      teamGamePlayed: officialTable.teamGamePlayed,
      points: officialTable.points,
      goalsFor: officialTable.goalsFor,
      goalsAgainst: officialTable.goalsAgainst,
    },
    playersCount: teamPlayers.filter(player => player.rosterStatus === 'regular').length,
    teamPlayers,
    teamBalance: stats.teamBalance || null,
    scoutProfilesSummary: scouting.scoutProfilesSummary || null,
    transfersIn: Object.values(object(movement.transfersInById)),
    transfersOut: Object.values(object(movement.transfersOutById)),
    pendingPlayers: Object.values(object(roster.pendingById)),
  }
}

export const normalizeTeamPagePlayerRow = ({
  playerSeason = {},
  index = 0,
  isTeamScoutProjection = false,
} = {}) => {
  const actual = playerSeason.stats?.actual || {}
  const scout = playerSeason.scout || {}
  const display = scout.display || {}

  return {
    ...playerSeason,
    id: playerSeason.identity?.playerId || playerSeason.identity?.playerDocumentId || `${index}`,
    playerId: playerSeason.identity?.playerId || '',
    playerDocumentId: playerSeason.identity?.playerDocumentId || '',
    externalPlayerId: playerSeason.identity?.externalPlayerId || '',
    playerUrl: playerSeason.metadata?.playerUrl || '',
    rosterStatus: playerSeason.metadata?.rosterStatus || 'regular',
    statsStatus: playerSeason.statsStatus || PLAYER_STATS_STATUS.MISSING,
    isYoungerAgeGroup: (
      playerSeason.metadata?.rosterStatus === 'youngerAgeGroup'
    ),
    number: playerSeason.position?.shirtNumber || `${index + 1}`,
    numShirt: playerSeason.position?.shirtNumber || '',
    fullName: playerSeason.identity?.displayName || '',
    normalizedName: playerSeason.identity?.normalizedName || '',
    positionLayer: playerSeason.position?.layer || '',
    primaryPosition: playerSeason.position?.primary || '',
    lineClassification: playerSeason.lineClassification || null,
    playerStats: {
      ...actual,
      teamMinutes: playerSeason.stats?.context?.teamMinutes,
      teamGames: playerSeason.stats?.context?.teamGames,
      teamRank: playerSeason.stats?.context?.teamRank,
      teamGoalsFor: playerSeason.stats?.context?.teamGoalsFor,
      teamGoalsAgainst: playerSeason.stats?.context?.teamGoalsAgainst,
    },
    games: actual.games || 0,
    goals: actual.goals || 0,
    starts: actual.starts || 0,
    yellowCards: actual.yellowCards || 0,
    minutes: actual.minutes || 0,
    profile: display.label || '-',
    profileStrength: display.profileStrength || null,
    scoutProfiles: scout.profiles || [],
    // Team rows receive only the persisted Scout Projection. Rich fields are
    // intentionally exposed only for non-projection callers (Player views).
    ...(isTeamScoutProjection
      ? {}
      : {
          scoutCombinations: scout.combinations || [],
          scoutCandidateSignals: scout.candidateSignals || [],
          scoutSpotlights: scout.spotlights || [],
          scoutOpportunity: scout.opportunity || null,
          scoutVerification: scout.verification || null,
          scoutProfileProgression: scout.profileProgression || null,
          scoutProfileHierarchy: scout.profileHierarchy || null,
          scoutTrajectory: scout.trajectory || null,
          scoutTransferContext: scout.transferContext || null,
          scoutStatsLoadMeasurements: scout.statsLoadMeasurements || {
            previous: null,
            current: null,
          },
          scoutStatsLoadMeasurementHistory: scout.statsLoadMeasurementHistory || [],
          scoutStatsLoadMeasurementHistoryEvents:
            scout.statsLoadMeasurementHistoryEvents || [],
        }),
    scoutEngineVersion: scout.engineVersion || '',
    scoutEffectiveImmediacyStatus: scout.opportunity?.effectiveActionStatus || '',
    scoutPlayerInterestLevel: scout.playerInterest?.interestLevel || '',
    isTeamScoutProjection,
    scoutProfileDisplay: display,
  }
}

export const adaptTeamPagePlayerRow = ({ player = {}, index = 0, selectedSeasonOption = null, teamSeason = null } = {}) => {
  const playerSeason = adaptPlayerDocumentSeason({
    playerDocument: player,
    seasonDocument: player,
    target: selectedSeasonOption?.target || 'current',
    team: {
      birthTeamId: teamSeason?.identity?.teamId,
      birthTeamDocumentId: teamSeason?.identity?.teamDocumentId,
      clubId: teamSeason?.identity?.clubId,
      leagueId: teamSeason?.league?.leagueId,
      leagueLevel: teamSeason?.league?.leagueLevel,
      ageGroupId: teamSeason?.league?.ageGroupId,
      ageGroupLabel: teamSeason?.league?.ageGroupLabel,
      birthTeamSlot: player.birthTeamSlot,
      displayName: teamSeason?.identity?.displayName,
      teamUrl: teamSeason?.metadata?.teamUrl,
    },
    teamScout: teamSeason?.performance || null,
  })

  return normalizeTeamPagePlayerRow({
    playerSeason,
    index,
    isTeamScoutProjection: Object.prototype.hasOwnProperty.call(
      player,
      'primaryScoutProfileId'
    ),
  })
}

