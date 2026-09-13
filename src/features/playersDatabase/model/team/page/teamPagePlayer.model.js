import { adaptPlayerDocumentSeason } from '../../../domain/index.js'
import { PLAYER_STATS_STATUS } from '../../player/playerStats.model.js'

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
    manualTransferDirection: playerSeason.metadata?.manualTransferDirection || '',
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

