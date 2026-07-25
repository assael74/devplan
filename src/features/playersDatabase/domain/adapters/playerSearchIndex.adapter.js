// src/features/playersDatabase/domain/adapters/playerSearchIndex.adapter.js

import { createLifecycle } from '../contracts/lifecycle.contract.js'
import { createEmptyPlayerSeason } from '../contracts/playerSeason.contract.js'
import { normalizePlayerScout } from '../contracts/playerScout.contract.js'
import { cleanDomainValue, firstDomainValue, toDomainArray, toDomainNumber, toDomainNumberOrZero, toNullablePositiveNumber } from '../contracts/domainValue.contract.js'

const buildIndexProfiles = document => [
  { profileId: document.primaryScoutProfileId, profileScore: document.primaryScoutScore, profileReliability: document.primaryScoutReliabilityLevel },
  { profileId: document.secondaryScoutProfileId, profileScore: document.secondaryScoutScore, profileReliability: document.secondaryScoutReliabilityLevel },
].filter(profile => cleanDomainValue(profile.profileId))

export const adaptPlayerSearchIndexDocument = document => {
  const source = document && typeof document === 'object' ? document : {}
  const result = createEmptyPlayerSeason()
  const lifecycle = createLifecycle(source.sourceTarget === 'history' || source.seasonDataStatus === 'historical' ? 'history' : 'current')
  const profiles = buildIndexProfiles(source)

  return {
    ...result,
    identity: { playerId: cleanDomainValue(source.playerId), playerDocumentId: cleanDomainValue(source.playerDocumentId), externalPlayerId: cleanDomainValue(source.externalPlayerId), displayName: cleanDomainValue(source.displayName), normalizedName: cleanDomainValue(source.normalizedDisplayName), aliases: toDomainArray(source.aliases) },
    season: { seasonId: cleanDomainValue(source.seasonId), seasonKey: cleanDomainValue(source.seasonKey), birthYear: toDomainNumber(source.birthYear) },
    lifecycle,
    team: { teamId: cleanDomainValue(firstDomainValue(source.birthTeamId, source.teamId)), teamDocumentId: cleanDomainValue(firstDomainValue(source.birthTeamDocumentId, source.teamDocumentId)), clubId: cleanDomainValue(source.clubId), leagueId: cleanDomainValue(source.leagueId), leagueLevel: toDomainNumber(source.leagueLevel), ageGroupId: cleanDomainValue(source.ageGroupId), ageGroupLabel: cleanDomainValue(source.ageGroupLabel), birthTeamSlot: toDomainNumber(source.birthTeamSlot), displayName: cleanDomainValue(firstDomainValue(source.teamDisplayName, source.teamName)) },
    position: { layer: cleanDomainValue(source.positionLayer), primary: cleanDomainValue(source.primaryPosition), shirtNumber: cleanDomainValue(source.numShirt) },
    stats: {
      actual: { games: toDomainNumberOrZero(source.games), starts: toDomainNumberOrZero(source.starts), minutes: toDomainNumberOrZero(source.minutes), goals: toDomainNumberOrZero(source.goals), yellowCards: toDomainNumberOrZero(source.yellowCards), substituteIn: toDomainNumberOrZero(source.substituteIn), substitutedOut: toDomainNumberOrZero(source.substitutedOut) },
      projected: null,
      context: { teamMinutes: toNullablePositiveNumber(source.teamMinutes), teamGames: toNullablePositiveNumber(source.teamGames), teamRank: toDomainNumber(source.teamTableRank), teamGoalsFor: toDomainNumber(source.teamGoalsFor), teamGoalsAgainst: toDomainNumber(source.teamGoalsAgainst) },
      rates: { minutesPerGame: toDomainNumber(source.minutesPerGame), goalsPer90: toDomainNumber(source.goalsPer90) },
    },
    scout: normalizePlayerScout({ profiles, profileIds: source.scoutProfileIds, combinationIds: source.scoutCombinationIds, searchIds: source.scoutProfileSearchIds }),
    completeness: { ...result.completeness, hasStats: true, hasRanking: source.teamTableRank !== null && source.teamTableRank !== undefined, hasScoutProfiles: profiles.length > 0 || toDomainArray(source.scoutProfileIds).length > 0 },
    metadata: { favorite: Boolean(source.favorite), notes: cleanDomainValue(firstDomainValue(source.notes, source.seasonNotes)), playerUrl: cleanDomainValue(source.playerUrl), teamUrl: cleanDomainValue(source.teamUrl), seasonUrl: cleanDomainValue(source.seasonUrl), rosterStatus: cleanDomainValue(source.rosterStatus), sourceCollection: cleanDomainValue(source.sourceCollection) || 'players', sourceDocumentId: cleanDomainValue(source.sourceDocumentId), sourceTarget: lifecycle.type, updatedAt: source.updatedAt || null },
    calculation: { mode: lifecycle.usesProjection ? 'projected' : 'final', engineVersion: cleanDomainValue(source.engineVersion), calculatedAt: source.calculatedAt || source.updatedAt || null },
  }
}
