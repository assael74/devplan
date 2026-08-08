// features/playersDatabase/domain/adapters/teamSearchIndex.adapter.js

import { createLifecycle } from '../contracts/lifecycle.contract.js'
import { createEmptyTeamSeason } from '../contracts/teamSeason.contract.js'
import { normalizeTeamScout } from '../contracts/teamScout.contract.js'
import {
  cleanDomainValue,
  firstDomainValue,
  hasDomainValue,
  toDomainNumber,
  toDomainNumberOrZero,
} from '../contracts/domainValue.contract.js'

const buildSearchIndexScoutSide = ({
  prefix,
  source,
  rank,
}) => ({
  targetRate: firstDomainValue(
    source[`${prefix}TargetRate`],
    source[`${prefix}PerformanceRate`]
  ),
  targetNormalized: source[`${prefix}TargetNormalized`],
  targetLevel: firstDomainValue(
    source[`${prefix}TargetLevel`],
    source[`${prefix}PerformanceLevel`]
  ),
  rankingRate: firstDomainValue(
    source[`${prefix}RankingRate`],
    source[`${prefix}PositionAnomalyRate`]
  ),
  rankingNormalized: source[`${prefix}RankingNormalized`],
  rankingLevel: firstDomainValue(
    source[`${prefix}RankingLevel`],
    source[`${prefix}PositionAnomalyLevel`]
  ),
  anomalyRate: firstDomainValue(
    source[`${prefix}AnomalyRate`],
    source[`${prefix}CombinedRate`]
  ),
  anomalyLevel: firstDomainValue(
    source[`${prefix}AnomalyLevel`],
    source[`${prefix}CombinedLevel`]
  ),
  qualityRate: source[`${prefix}QualityRate`],
  scoutPriorityScore: firstDomainValue(
    source[`${prefix}ScoutPriorityScore`],
    source[`${prefix}ScoutPriorityRate`],
    source[`${prefix}PriorityRate`]
  ),
  scoutPriorityRate: firstDomainValue(
    source[`${prefix}ScoutPriorityScore`],
    source[`${prefix}ScoutPriorityRate`],
    source[`${prefix}PriorityRate`]
  ),
  priorityLevel: source[`${prefix}PriorityLevel`],
  opportunityType: source[`${prefix}OpportunityType`],
  rank,
})

export const adaptTeamSearchIndexDocument = document => {
  const source = document && typeof document === 'object' ? document : {}
  const result = createEmptyTeamSeason()
  const lifecycle = createLifecycle(
    source.sourceTarget === 'history' ||
    source.seasonDataStatus === 'historical'
      ? 'history'
      : 'current'
  )
  const performance = normalizeTeamScout({
    offense: buildSearchIndexScoutSide({
      prefix: 'attack',
      source,
      rank: source.tableAttackRank,
    }),
    defense: buildSearchIndexScoutSide({
      prefix: 'defense',
      source,
      rank: source.tableDefenseRank,
    }),
    context: {
      leagueLevel: source.leagueLevel,
      leagueGames: source.leagueTotalRound,
      tableRank: source.tableRank,
    },
    source: {
      engineVersion: source.engineVersion,
      calculatedAt: source.calculatedAt || source.updatedAt,
    },
  })

  return {
    ...result,
    identity: {
      teamId: cleanDomainValue(
        firstDomainValue(source.birthTeamId, source.teamId)
      ),
      teamDocumentId: cleanDomainValue(
        firstDomainValue(
          source.birthTeamDocumentId,
          source.teamDocumentId
        )
      ),
      clubId: cleanDomainValue(source.clubId),
      displayName: cleanDomainValue(source.displayName),
      teamSlot: toDomainNumber(source.birthTeamSlot),
    },
    season: {
      seasonId: cleanDomainValue(source.seasonId),
      seasonKey: cleanDomainValue(source.seasonKey),
      birthYear: toDomainNumber(source.birthYear),
    },
    lifecycle,
    league: {
      leagueId: cleanDomainValue(source.leagueId),
      leagueLevel: toDomainNumber(source.leagueLevel),
      ageGroupId: cleanDomainValue(source.ageGroupId),
      ageGroupLabel: cleanDomainValue(source.ageGroupLabel),
      region: cleanDomainValue(source.region),
      leagueGames: toDomainNumber(source.leagueTotalRound),
    },
    stats: {
      actual: {
        gamesPlayed: toDomainNumberOrZero(source.teamGamePlayed),
        points: toDomainNumberOrZero(source.points),
        goalsFor: toDomainNumberOrZero(source.goalsFor),
        goalsAgainst: toDomainNumberOrZero(source.goalsAgainst),
        goalsForPerGame: toDomainNumber(source.goalsForPerGame),
        goalsAgainstPerGame: toDomainNumber(source.goalsAgainstPerGame),
      },
      projected: null,
    },
    ranking: {
      tableRank: toDomainNumber(source.tableRank),
      attackRank: toDomainNumber(source.tableAttackRank),
      defenseRank: toDomainNumber(source.tableDefenseRank),
    },
    performance,
    expectedLeagueLevelChange: (() => {
      const currentLevel = toDomainNumber(source.leagueLevel)
      const delta = source.expectedLevelDelta === null || source.expectedLevelDelta === undefined
        ? null
        : toDomainNumber(source.expectedLevelDelta)
      const direction = delta === null
        ? 'unknown'
        : delta > 0
          ? 'promotion'
          : delta < 0
            ? 'relegation'
            : 'unchanged'

      return {
        currentLevel,
        nextSeasonLevel: delta === null || currentLevel === null ? null : currentLevel - delta,
        levelGap: delta === null ? null : -delta,
        expectedLevelDelta: delta,
        direction,
      }
    })(),
    completeness: {
      ...result.completeness,
      hasStats: true,
      hasRanking: hasDomainValue(source.tableRank),
      hasPerformance:
        hasDomainValue(source.attackScoutPriorityRate) ||
        hasDomainValue(source.attackScoutPriorityScore) ||
        hasDomainValue(source.defenseScoutPriorityRate) ||
        hasDomainValue(source.defenseScoutPriorityScore) ||
        hasDomainValue(source.attackPriorityRate) ||
        hasDomainValue(source.defensePriorityRate) ||
        hasDomainValue(source.attackPerformanceRate) ||
        hasDomainValue(source.defensePerformanceRate),
    },
    metadata: {
      teamUrl: cleanDomainValue(source.teamUrl),
      seasonUrl: cleanDomainValue(source.seasonUrl),
      sourceCollection: cleanDomainValue(source.sourceCollection) || 'leagues',
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
