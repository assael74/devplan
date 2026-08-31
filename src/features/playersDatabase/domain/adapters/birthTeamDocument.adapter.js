// features/playersDatabase/domain/adapters/birthTeamDocument.adapter.js

import {
  buildTeamSeasonDocumentId,
  normalizeTeamIdentity,
} from '../../model/teamIdentity.model.js'
import { normalizeTeamStats } from '../../model/teamStats.model.js'
import { normalizeSeasonIdentity } from '../../model/season.model.js'
import { createLifecycle } from '../contracts/lifecycle.contract.js'
import { createEmptyTeamSeason } from '../contracts/teamSeason.contract.js'
import {
  cleanDomainValue,
  firstDomainValue,
  toDomainNumber,
} from '../contracts/domainValue.contract.js'

const hasOwn = (source, key) => (
  Boolean(source) &&
  Object.prototype.hasOwnProperty.call(source, key)
)

const hasTeamStats = seasonDocument => {
  const stats = seasonDocument?.teamStats

  if (stats && typeof stats === 'object') {
    return [
      'teamGamePlayed',
      'gamesPlayed',
      'points',
      'goalsFor',
      'goalsAgainst',
    ].some(key => hasOwn(stats, key))
  }

  return [
    'teamGamePlayed',
    'gamesPlayed',
    'games',
    'points',
    'goalsFor',
    'goalsAgainst',
  ].some(key => hasOwn(seasonDocument, key))
}

const resolveTeamSeasonLifecycleTarget = seasonStatus => (
  cleanDomainValue(seasonStatus) === 'completed'
    ? 'history'
    : 'current'
)

export const adaptBirthTeamDocumentSeason = ({
  teamDocument = {},
  seasonDocument = {},
  league = {},
} = {}) => {
  const identity = normalizeTeamIdentity({
    team: seasonDocument,
    fallback: teamDocument,
  })
  const seasonIdentity = normalizeSeasonIdentity({
    season: seasonDocument,
  })
  const stats = normalizeTeamStats(
    seasonDocument.teamStats || seasonDocument
  )
  const lifecycle = createLifecycle(
    resolveTeamSeasonLifecycleTarget(seasonDocument.seasonStatus),
    seasonDocument.seasonStatus,
  )
  const result = createEmptyTeamSeason()

  return {
    ...result,
    identity: {
      teamId: cleanDomainValue(
        firstDomainValue(
          identity.birthTeamId,
          identity.teamId
        )
      ),
      teamDocumentId: cleanDomainValue(
        firstDomainValue(
          identity.birthTeamDocumentId,
          identity.teamDocumentId
        )
      ),
      clubId: cleanDomainValue(identity.clubId),
      displayName: cleanDomainValue(
        firstDomainValue(
          seasonDocument.displayName,
          teamDocument.displayName,
          seasonDocument.teamName
        )
      ),
    },
    season: {
      seasonId: cleanDomainValue(seasonIdentity.seasonId),
      seasonKey: cleanDomainValue(seasonIdentity.seasonKey),
      birthYear: toDomainNumber(
        firstDomainValue(
          seasonDocument.birthYear,
          teamDocument.birthYear
        )
      ),
    },
    lifecycle,
    league: {
      leagueId: cleanDomainValue(
        firstDomainValue(
          seasonDocument.leagueId,
          league.id
        )
      ),
      leagueLevel: toDomainNumber(
        firstDomainValue(
          seasonDocument.leagueLevel,
          league.level
        )
      ),
      ageGroupId: cleanDomainValue(
        firstDomainValue(
          seasonDocument.ageGroupId,
          league.ageGroupId
        )
      ),
      ageGroupLabel: cleanDomainValue(
        firstDomainValue(
          seasonDocument.ageGroupLabel,
          league.ageGroupLabel
        )
      ),
      region: cleanDomainValue(
        firstDomainValue(
          seasonDocument.region,
          league.region
        )
      ),
      leagueGames: toDomainNumber(
        firstDomainValue(
          seasonDocument.leagueTotalRound,
          league.leagueTotalRound
        )
      ),
    },
    stats: {
      actual: {
        gamesPlayed: toDomainNumber(stats.teamGamePlayed, 0),
        points: toDomainNumber(stats.points, 0),
        goalsFor: toDomainNumber(stats.goalsFor, 0),
        goalsAgainst: toDomainNumber(stats.goalsAgainst, 0),
        goalsForPerGame: toDomainNumber(stats.goalsForPerGame),
        goalsAgainstPerGame: toDomainNumber(stats.goalsAgainstPerGame),
      },
      projected: lifecycle.usesProjection && seasonDocument.projectedStats
        ? seasonDocument.projectedStats
        : null,
    },
    completeness: {
      ...result.completeness,
      hasStats: hasTeamStats(seasonDocument),
    },
    metadata: {
      teamUrl: cleanDomainValue(
        firstDomainValue(
          seasonDocument.teamUrl,
          teamDocument.teamUrl
        )
      ),
      seasonUrl: cleanDomainValue(seasonDocument.seasonUrl),
      sourceCollection: 'birthTeamSeasons',
      sourceDocumentId: cleanDomainValue(
        seasonDocument.id || buildTeamSeasonDocumentId(
          firstDomainValue(identity.birthTeamDocumentId, identity.teamDocumentId),
          seasonIdentity.seasonKey,
        )
      ),
      sourceTarget: lifecycle.type,
      updatedAt: seasonDocument.updatedAt || teamDocument.updatedAt || null,
    },
    calculation: {
      mode: lifecycle.usesProjection ? 'projected' : 'final',
      engineVersion: cleanDomainValue(seasonDocument.engineVersion),
      calculatedAt: seasonDocument.calculatedAt || seasonDocument.updatedAt || null,
    },
  }
}
