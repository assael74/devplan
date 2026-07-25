// src/features/playersDatabase/domain/adapters/teamSearchIndex.adapter.js

import { createLifecycle } from '../contracts/lifecycle.contract.js'
import { createEmptyTeamSeason } from '../contracts/teamSeason.contract.js'
import { normalizeTeamScout } from '../contracts/teamScout.contract.js'
import { cleanDomainValue, firstDomainValue, hasDomainValue, toDomainNumber, toDomainNumberOrZero } from '../contracts/domainValue.contract.js'

export const adaptTeamSearchIndexDocument = document => {
  const source = document && typeof document === 'object' ? document : {}
  const result = createEmptyTeamSeason()
  const lifecycle = createLifecycle(source.sourceTarget === 'history' || source.seasonDataStatus === 'historical' ? 'history' : 'current')
  const performance = normalizeTeamScout({
    offense: { performance: source.attackPerformance, performanceRate: source.attackPerformanceRate, rankingRate: source.attackRankingRate, combinedRate: source.attackCombinedRate, qualityRate: source.attackQualityRate, scoutPriorityRate: source.attackScoutPriorityRate, priorityRate: firstDomainValue(source.attackPriorityRate, source.attackPerformance), priorityLevel: source.attackPriorityLevel, anomalyLevel: source.attackAnomalyLevel, rank: source.tableAttackRank },
    defense: { performance: source.defensePerformance, performanceRate: source.defensePerformanceRate, rankingRate: source.defenseRankingRate, combinedRate: source.defenseCombinedRate, qualityRate: source.defenseQualityRate, scoutPriorityRate: source.defenseScoutPriorityRate, priorityRate: firstDomainValue(source.defensePriorityRate, source.defensePerformance), priorityLevel: source.defensePriorityLevel, anomalyLevel: source.defenseAnomalyLevel, rank: source.tableDefenseRank },
    context: { leagueLevel: source.leagueLevel, leagueGames: source.leagueTotalRound, tableRank: source.tableRank },
    source: { engineVersion: source.engineVersion, calculatedAt: source.calculatedAt || source.updatedAt },
  })

  return {
    ...result,
    identity: { teamId: cleanDomainValue(firstDomainValue(source.birthTeamId, source.teamId)), teamDocumentId: cleanDomainValue(firstDomainValue(source.birthTeamDocumentId, source.teamDocumentId)), clubId: cleanDomainValue(source.clubId), displayName: cleanDomainValue(source.displayName) },
    season: { seasonId: cleanDomainValue(source.seasonId), seasonKey: cleanDomainValue(source.seasonKey), birthYear: toDomainNumber(source.birthYear) },
    lifecycle,
    league: { leagueId: cleanDomainValue(source.leagueId), leagueLevel: toDomainNumber(source.leagueLevel), ageGroupId: cleanDomainValue(source.ageGroupId), ageGroupLabel: cleanDomainValue(source.ageGroupLabel), region: cleanDomainValue(source.region), leagueGames: toDomainNumber(source.leagueTotalRound) },
    stats: { actual: { gamesPlayed: toDomainNumberOrZero(source.teamGamePlayed), points: toDomainNumberOrZero(source.points), goalsFor: toDomainNumberOrZero(source.goalsFor), goalsAgainst: toDomainNumberOrZero(source.goalsAgainst), goalsForPerGame: toDomainNumber(source.goalsForPerGame), goalsAgainstPerGame: toDomainNumber(source.goalsAgainstPerGame) }, projected: null },
    ranking: { tableRank: toDomainNumber(source.tableRank), attackRank: toDomainNumber(source.tableAttackRank), defenseRank: toDomainNumber(source.tableDefenseRank) },
    performance,
    completeness: { ...result.completeness, hasStats: true, hasRanking: hasDomainValue(source.tableRank), hasPerformance: hasDomainValue(source.attackPriorityRate) || hasDomainValue(source.defensePriorityRate) },
    metadata: { teamUrl: cleanDomainValue(source.teamUrl), seasonUrl: cleanDomainValue(source.seasonUrl), sourceCollection: cleanDomainValue(source.sourceCollection) || 'leagues', sourceDocumentId: cleanDomainValue(source.sourceDocumentId), sourceTarget: lifecycle.type, updatedAt: source.updatedAt || null },
    calculation: { mode: lifecycle.usesProjection ? 'projected' : 'final', engineVersion: cleanDomainValue(source.engineVersion), calculatedAt: source.calculatedAt || source.updatedAt || null },
  }
}
