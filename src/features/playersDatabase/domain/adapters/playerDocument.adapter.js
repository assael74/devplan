// src/features/playersDatabase/domain/adapters/playerDocument.adapter.js

import { normalizePlayerIdentity } from '../../model/playerIdentity.model.js'
import {
  normalizePlayerStats,
  normalizePlayerStatsStatus,
  PLAYER_STATS_STATUS,
} from '../../model/playerStats.model.js'
import { normalizeSeasonIdentity } from '../../model/season.model.js'
import { createLifecycle } from '../contracts/lifecycle.contract.js'
import { createEmptyPlayerSeason } from '../contracts/playerSeason.contract.js'
import { normalizePlayerScout } from '../contracts/playerScout.contract.js'
import {
  normalizePlayerEventsState,
  normalizePlayerTrackingState,
  normalizePlayerVerificationState,
} from '../contracts/playerDocumentState.contract.js'
import {
  cleanDomainValue,
  firstDomainValue,
  toDomainArray,
  toDomainNumber,
  toNullablePositiveNumber,
} from '../contracts/domainValue.contract.js'

const buildProjectedStats = seasonDocument => {
  const projected = seasonDocument.projectedStats || seasonDocument.normalizedStats || null
  if (!projected || typeof projected !== 'object') return null
  return {
    games: toDomainNumber(projected.games),
    starts: toDomainNumber(projected.starts),
    minutes: toDomainNumber(projected.minutes),
    goals: toDomainNumber(projected.goals),
    yellowCards: toDomainNumber(projected.yellowCards),
    substituteIn: toDomainNumber(projected.substituteIn),
    substitutedOut: toDomainNumber(projected.substitutedOut),
  }
}

export const adaptPlayerDocumentSeason = ({
  playerDocument = {},
  seasonDocument = {},
  target = 'current',
  team = {},
  teamScout = null,
} = {}) => {
  const identity = normalizePlayerIdentity({
    ...playerDocument,
    ...seasonDocument,
  })
  const seasonIdentity = normalizeSeasonIdentity({ season: seasonDocument })
  const stats = normalizePlayerStats(seasonDocument)
  const statsStatus = normalizePlayerStatsStatus(
    seasonDocument.statsStatus,
    PLAYER_STATS_STATUS.MISSING
  )
  const seasonStatus = cleanDomainValue(seasonDocument.seasonStatus)
  const lifecycle = createLifecycle(target, seasonStatus)
  const result = createEmptyPlayerSeason()
  const profiles = seasonDocument.scoutProfiles || seasonDocument.scoutSignals || []
  const tracking = normalizePlayerTrackingState(playerDocument)
  const verification = normalizePlayerVerificationState(playerDocument)
  const events = normalizePlayerEventsState(playerDocument)

  return {
    ...result,
    identity: {
      playerId: cleanDomainValue(identity.playerId),
      playerDocumentId: cleanDomainValue(identity.playerDocumentId),
      externalPlayerId: cleanDomainValue(identity.externalPlayerId),
      displayName: cleanDomainValue(identity.fullName),
      normalizedName: cleanDomainValue(identity.normalizedName),
      aliases: toDomainArray(playerDocument.aliases),
    },
    season: {
      seasonId: cleanDomainValue(seasonIdentity.seasonId),
      seasonKey: cleanDomainValue(seasonIdentity.seasonKey),
      seasonStatus: lifecycle.seasonStatus,
      birthYear: toDomainNumber(firstDomainValue(seasonDocument.birthYear, playerDocument.birthYear)),
    },
    lifecycle,
    tracking,
    verification,
    events,
    statsStatus,
    team: {
      teamId: cleanDomainValue(firstDomainValue(seasonDocument.birthTeamId, seasonDocument.teamId, team.birthTeamId, team.teamId)),
      teamDocumentId: cleanDomainValue(firstDomainValue(seasonDocument.birthTeamDocumentId, seasonDocument.teamDocumentId, team.birthTeamDocumentId, team.teamDocumentId)),
      clubId: cleanDomainValue(firstDomainValue(seasonDocument.clubId, team.clubId)),
      clubName: cleanDomainValue(firstDomainValue(seasonDocument.clubName, team.clubName)),
      clubLevel: toDomainNumber(firstDomainValue(
        seasonDocument.clubLevel,
        team.clubLevel,
        playerDocument.clubLevel
      )),
      clubStrengthLevel: toDomainNumber(firstDomainValue(
        seasonDocument.clubStrengthLevel,
        team.clubStrengthLevel,
        playerDocument.clubStrengthLevel,
        seasonDocument.clubLevel,
        team.clubLevel,
        playerDocument.clubLevel
      )),
      leagueId: cleanDomainValue(firstDomainValue(seasonDocument.leagueId, team.leagueId)),
      leagueName: cleanDomainValue(firstDomainValue(seasonDocument.leagueName, team.leagueName)),
      leagueLevel: toDomainNumber(firstDomainValue(seasonDocument.leagueLevel, team.leagueLevel, playerDocument.leagueLevel)),
      ageGroupId: cleanDomainValue(firstDomainValue(seasonDocument.ageGroupId, team.ageGroupId)),
      ageGroupLabel: cleanDomainValue(firstDomainValue(seasonDocument.ageGroupLabel, team.ageGroupLabel)),
      birthTeamSlot: toDomainNumber(firstDomainValue(seasonDocument.birthTeamSlot, team.birthTeamSlot)),
      displayName: cleanDomainValue(firstDomainValue(seasonDocument.teamDisplayName, team.displayName, team.teamName)),
    },
    position: {
      layer: cleanDomainValue(seasonDocument.positionLayer),
      primary: cleanDomainValue(seasonDocument.primaryPosition),
      shirtNumber: cleanDomainValue(firstDomainValue(seasonDocument.numShirt, seasonDocument.number)),
    },
    stats: {
      actual: {
        games: stats.games,
        starts: stats.starts,
        minutes: stats.minutes,
        goals: stats.goals,
        yellowCards: stats.yellowCards,
        substituteIn: stats.substituteIn,
        substitutedOut: stats.substitutedOut,
      },
      projected: lifecycle.usesProjection ? buildProjectedStats(seasonDocument) : null,
      context: {
        teamMinutes: toNullablePositiveNumber(stats.teamMinutes),
        teamGames: toNullablePositiveNumber(stats.teamGames),
        teamRank: toDomainNumber(stats.teamRank),
        teamGoalsFor: toDomainNumber(stats.teamGoalsFor),
        teamGoalsAgainst: toDomainNumber(stats.teamGoalsAgainst),
        teamAttackPerformance: stats.teamAttackPerformance || null,
        teamDefensePerformance: stats.teamDefensePerformance || null,
      },
      rates: {
        minutesPerGame: toDomainNumber(stats.minutesPerGame),
        goalsPer90: toDomainNumber(stats.goalsPer90),
      },
    },
    scout: normalizePlayerScout({
      profiles,
      combinations: seasonDocument.scoutCombinations || [],
      profileIds: seasonDocument.scoutProfileIds,
      combinationIds: seasonDocument.scoutCombinationIds,
      searchIds: seasonDocument.scoutProfileSearchIds,
      candidateSignals: seasonDocument.scoutCandidateSignals,
      evidence: seasonDocument.scoutEvidence,
      spotlights: seasonDocument.scoutSpotlights,
      opportunity: seasonDocument.scoutOpportunity,
      verification: seasonDocument.scoutVerification,
      profileProgression: seasonDocument.scoutProfileProgression,
      profileHierarchy: seasonDocument.scoutProfileHierarchy,
      profileCaseStrength: seasonDocument.scoutProfileCaseStrength,
      playerInterest: seasonDocument.scoutPlayerInterest,
      playerReview: playerDocument.playerReview || seasonDocument.playerReview || null,
      trajectory: seasonDocument.scoutTrajectory,
      transferContext: seasonDocument.scoutTransferContext,
      futureCompetitionPath: seasonDocument.futureCompetitionPath,
      engineVersion: seasonDocument.scoutEngineVersion,
      statsLoadMeasurementHistory: seasonDocument.scoutStatsLoadMeasurementHistory,
    }),
    teamPerformance: teamScout || result.teamPerformance,
    completeness: {
      ...result.completeness,
      hasStats: statsStatus === PLAYER_STATS_STATUS.LOADED,
      hasPerformance: Boolean(teamScout),
      hasScoutProfiles: profiles.length > 0,
    },
    metadata: {
      notes: cleanDomainValue(firstDomainValue(seasonDocument.notes, playerDocument.notes)),
      playerUrl: cleanDomainValue(firstDomainValue(seasonDocument.playerUrl, playerDocument.playerUrl)),
      teamUrl: cleanDomainValue(firstDomainValue(seasonDocument.teamUrl, team.teamUrl)),
      seasonUrl: cleanDomainValue(seasonDocument.seasonUrl),
      rosterStatus: cleanDomainValue(seasonDocument.rosterStatus),
      sourceCollection: 'players',
      sourceDocumentId: cleanDomainValue(identity.playerDocumentId),
      sourceTarget: lifecycle.type,
      updatedAt: seasonDocument.updatedAt || playerDocument.updatedAt || null,
    },
    calculation: {
      mode: lifecycle.usesProjection ? 'projected' : 'final',
      engineVersion: cleanDomainValue(seasonDocument.engineVersion),
      calculatedAt: seasonDocument.calculatedAt || seasonDocument.updatedAt || null,
    },
  }
}
