// src/features/playersDatabase/domain/adapters/playerSearchIndex.adapter.js

import {
  normalizePlayerStatsStatus,
  PLAYER_STATS_STATUS,
} from '../../model/playerStats.model.js'
import { createLifecycle } from '../contracts/lifecycle.contract.js'
import { createEmptyPlayerSeason } from '../contracts/playerSeason.contract.js'
import { normalizePlayerScout } from '../contracts/playerScout.contract.js'
import {
  cleanDomainValue,
  firstDomainValue,
  toDomainArray,
  toDomainNumber,
  toDomainNumberOrZero,
  toNullablePositiveNumber,
} from '../contracts/domainValue.contract.js'

const buildIndexProfiles = document => [
  {
    profileId: document.primaryScoutProfileId,
    profileScore: document.primaryScoutScore,
    interestLevel: document.primaryScoutInterestLevel,
    profileStrength: document.primaryScoutProfileStrengthDepthPct !== null &&
      document.primaryScoutProfileStrengthDepthPct !== undefined
      ? {
          depthPct: toDomainNumber(document.primaryScoutProfileStrengthDepthPct),
        }
      : null,
    warnings: toDomainArray(document.primaryScoutWarnings),
  },
  {
    profileId: document.secondaryScoutProfileId,
    profileScore: document.secondaryScoutScore,
    profileStrength: document.secondaryScoutProfileStrengthDepthPct !== null &&
      document.secondaryScoutProfileStrengthDepthPct !== undefined
      ? {
          depthPct: toDomainNumber(document.secondaryScoutProfileStrengthDepthPct),
        }
      : null,
    warnings: toDomainArray(document.secondaryScoutWarnings),
  },
].filter(profile => cleanDomainValue(profile.profileId))

export const adaptPlayerSearchIndexDocument = document => {
  const source = document && typeof document === 'object' ? document : {}
  const result = createEmptyPlayerSeason()
  const target = source.sourceTarget === 'history' || source.seasonDataStatus === 'historical'
    ? 'history'
    : 'current'
  const lifecycle = createLifecycle(target, source.seasonStatus)
  const profiles = buildIndexProfiles(source)
  const statsStatus = normalizePlayerStatsStatus(
    source.statsStatus,
    PLAYER_STATS_STATUS.MISSING
  )

  return {
    ...result,
    identity: {
      playerId: cleanDomainValue(source.playerId),
      playerDocumentId: cleanDomainValue(source.playerDocumentId),
      externalPlayerId: cleanDomainValue(source.externalPlayerId),
      displayName: cleanDomainValue(source.displayName),
      normalizedName: cleanDomainValue(source.normalizedDisplayName),
      aliases: toDomainArray(source.aliases),
    },
    season: {
      seasonId: cleanDomainValue(source.seasonId),
      seasonKey: cleanDomainValue(source.seasonKey),
      seasonStatus: lifecycle.seasonStatus,
      birthYear: toDomainNumber(source.birthYear),
    },
    lifecycle,
    statsStatus,
    team: {
      teamId: cleanDomainValue(firstDomainValue(source.birthTeamId, source.teamId)),
      teamDocumentId: cleanDomainValue(firstDomainValue(source.birthTeamDocumentId, source.teamDocumentId)),
      clubId: cleanDomainValue(source.clubId),
      clubName: cleanDomainValue(source.clubName),
      clubLevel: toDomainNumber(source.clubLevel),
      clubStrengthLevel: toDomainNumber(firstDomainValue(
        source.clubStrengthLevel,
        source.clubLevel
      )),
      leagueId: cleanDomainValue(source.leagueId),
      leagueName: cleanDomainValue(source.leagueName),
      leagueLevel: toDomainNumber(source.leagueLevel),
      ageGroupId: cleanDomainValue(source.ageGroupId),
      ageGroupLabel: cleanDomainValue(source.ageGroupLabel),
      birthTeamSlot: toDomainNumber(source.birthTeamSlot),
      displayName: cleanDomainValue(firstDomainValue(source.teamDisplayName, source.teamName)),
    },
    position: {
      layer: cleanDomainValue(source.positionLayer),
      primary: cleanDomainValue(source.primaryPosition),
      shirtNumber: cleanDomainValue(source.numShirt),
    },
    stats: {
      actual: {
        games: toDomainNumberOrZero(source.games),
        starts: toDomainNumberOrZero(source.starts),
        minutes: toDomainNumberOrZero(source.minutes),
        goals: toDomainNumberOrZero(source.goals),
        yellowCards: toDomainNumberOrZero(source.yellowCards),
        substituteIn: toDomainNumberOrZero(source.substituteIn),
        substitutedOut: toDomainNumberOrZero(source.substitutedOut),
      },
      projected: null,
      context: {
        teamMinutes: toNullablePositiveNumber(source.teamMinutes),
        teamGames: toNullablePositiveNumber(source.teamGames),
        teamRank: toDomainNumber(source.teamTableRank),
        teamGoalsFor: toDomainNumber(source.teamGoalsFor),
        teamGoalsAgainst: toDomainNumber(source.teamGoalsAgainst),
      },
      rates: {
        minutesPerGame: toDomainNumber(source.minutesPerGame),
        goalsPer90: toDomainNumber(source.goalsPer90),
      },
    },
    scout: normalizePlayerScout({
      profiles,
      profileIds: source.scoutProfileIds,
      combinationIds: source.scoutCombinationIds,
      searchIds: source.scoutProfileSearchIds,
      profileProgression: cleanDomainValue(source.nearScoutProfileId)
        ? {
            distances: [],
            nearProfiles: [
              {
                profileId: cleanDomainValue(source.nearScoutProfileId),
                distancePct: toDomainNumber(source.nearScoutProfileDistancePct),
                trend: cleanDomainValue(source.nearScoutProfileTrend),
              },
            ],
            nearestProfile: {
              profileId: cleanDomainValue(source.nearScoutProfileId),
              distancePct: toDomainNumber(source.nearScoutProfileDistancePct),
              trend: cleanDomainValue(source.nearScoutProfileTrend),
            },
          }
        : null,
      opportunity: (
        cleanDomainValue(source.scoutEffectiveImmediacyStatus) ||
        cleanDomainValue(source.scoutAutomaticImmediacyStatus) ||
        cleanDomainValue(source.scoutManualImmediacyStatus)
      )
        ? {
            effectiveActionStatus: cleanDomainValue(source.scoutEffectiveImmediacyStatus),
            baseActionStatus: cleanDomainValue(source.scoutBaseImmediacyStatus) || 'watch',
            automaticActionStatus: cleanDomainValue(source.scoutAutomaticImmediacyStatus) || 'watch',
            manualActionStatus: cleanDomainValue(source.scoutManualImmediacyStatus),
            hasManualDecision: Boolean(source.scoutHasManualImmediacyDecision),
            boostScore: toDomainNumberOrZero(source.scoutImmediacyBoostScore),
            reductionScore: toDomainNumberOrZero(source.scoutImmediacyReductionScore),
            netScore: toDomainNumberOrZero(source.scoutImmediacyNetScore),
            boosts: toDomainArray(source.scoutImmediacyBoostIds).map(id => ({ id })),
            reductions: toDomainArray(source.scoutImmediacyReductionIds).map(id => ({ id })),
            signalPersistence: {
              profileRepeat: {
                seasons: toDomainNumberOrZero(source.scoutProfilePersistenceSeasons),
              },
              combinationRepeat: {
                seasons: toDomainNumberOrZero(source.scoutCombinationPersistenceSeasons),
              },
              decay: {
                seasonsWithoutSignal: toDomainNumberOrZero(source.scoutSignalDecaySeasons),
                lastSignalSeasonKey: cleanDomainValue(source.scoutSignalDecayLastSeasonKey),
              },
            },
            exposureLevel: cleanDomainValue(source.scoutExposureLevel),
          }
        : null,
      profileCaseStrength: (
        toDomainNumberOrZero(source.scoutProfileCaseStrengthProfileCount) > 0 ||
        Boolean(source.scoutProfileCaseHasCombination)
      )
        ? {
            profileCount: toDomainNumberOrZero(source.scoutProfileCaseStrengthProfileCount),
            hasDefinedCombination: Boolean(source.scoutProfileCaseHasCombination),
            combinationIds: toDomainArray(source.scoutProfileCaseCombinationIds),
            primaryProfileId: cleanDomainValue(source.primaryScoutProfileId),
          }
        : null,
      verification: cleanDomainValue(source.scoutNextBestCheckId)
        ? {
            nextBestCheck: {
              questionId: cleanDomainValue(source.scoutNextBestCheckId),
            },
          }
        : null,
      transferContext: (
        cleanDomainValue(source.scoutTransferMoveType) ||
        cleanDomainValue(source.scoutTransferDirection) ||
        cleanDomainValue(source.scoutTransferFromClubId) ||
        cleanDomainValue(source.scoutTransferToClubId)
      )
        ? {
            type: 'transfer',
            moveType: cleanDomainValue(source.scoutTransferMoveType),
            direction: cleanDomainValue(source.scoutTransferDirection),
            fromClubId: cleanDomainValue(source.scoutTransferFromClubId),
            toClubId: cleanDomainValue(source.scoutTransferToClubId),
            sameSeason: Boolean(source.scoutTransferSameSeason),
          }
        : null,
      engineVersion: cleanDomainValue(source.scoutEngineVersion),
    }),
    expectedLevelDelta: source.expectedLevelDelta === null || source.expectedLevelDelta === undefined ? null : toDomainNumber(source.expectedLevelDelta),
    completeness: {
      ...result.completeness,
      hasStats: statsStatus === PLAYER_STATS_STATUS.LOADED,
      hasRanking: source.teamTableRank !== null && source.teamTableRank !== undefined,
      hasScoutProfiles: (
        profiles.length > 0 ||
        toDomainArray(source.scoutProfileIds).length > 0
      ),
    },
    metadata: {
      notes: cleanDomainValue(firstDomainValue(source.notes, source.seasonNotes)),
      playerUrl: cleanDomainValue(source.playerUrl),
      teamUrl: cleanDomainValue(source.teamUrl),
      seasonUrl: cleanDomainValue(source.seasonUrl),
      rosterStatus: cleanDomainValue(source.rosterStatus),
      sourceCollection: cleanDomainValue(source.sourceCollection) || 'players',
      sourceDocumentId: cleanDomainValue(source.sourceDocumentId),
      sourceTarget: lifecycle.type,
      updatedAt: source.updatedAt || null,
    },
    calculation: {
      mode: lifecycle.usesProjection ? 'projected' : 'final',
      engineVersion: cleanDomainValue(source.engineVersion),
      calculatedAt: source.calculatedAt || source.updatedAt || null,
    },
  }
}
