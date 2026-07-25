// src/features/playersDatabase/domain/contracts/teamScout.contract.js

import {
  resolveTeamScoutAnomalyLevel,
  resolveTeamScoutPriorityLevel,
} from '../../../../shared/teams/scout/index.js'
import {
  cleanDomainValue,
  toDomainNumber,
} from './domainValue.contract.js'

export const createEmptyTeamScoutSide = side => ({
  side,
  performance: null,
  performanceRate: null,
  rankingRate: null,
  combinedRate: null,
  qualityRate: null,
  scoutPriorityRate: null,
  priorityRate: null,
  priorityLevel: 'unavailable',
  anomalyLevel: 'unavailable',
  rank: null,
  benchmark: {
    expectedValue: null,
    actualValue: null,
    projectedValue: null,
    gap: null,
  },
})

export const createEmptyTeamScout = () => ({
  offense: createEmptyTeamScoutSide('offense'),
  defense: createEmptyTeamScoutSide('defense'),
  normalization: {
    mode: '',
    factor: 1,
    applied: false,
  },
  context: {
    leagueLevel: null,
    leagueGames: null,
    tableRank: null,
  },
  source: {
    engineVersion: '',
    calculatedAt: null,
  },
})

const resolvePriorityRate = source => toDomainNumber(
  source.priorityRate !== undefined
    ? source.priorityRate
    : source.scoutPriorityRate
)

export const normalizeTeamScoutSide = (side, value = {}) => {
  const source = value && typeof value === 'object' ? value : {}
  const priorityRate = resolvePriorityRate(source)
  const performanceRate = toDomainNumber(source.performanceRate)

  return {
    ...createEmptyTeamScoutSide(side),
    performance: toDomainNumber(source.performance),
    performanceRate,
    rankingRate: toDomainNumber(source.rankingRate),
    combinedRate: toDomainNumber(source.combinedRate),
    qualityRate: toDomainNumber(source.qualityRate),
    scoutPriorityRate: toDomainNumber(source.scoutPriorityRate),
    priorityRate,
    priorityLevel: cleanDomainValue(source.priorityLevel) ||
      resolveTeamScoutPriorityLevel(priorityRate),
    anomalyLevel: cleanDomainValue(source.anomalyLevel) ||
      resolveTeamScoutAnomalyLevel(performanceRate),
    rank: toDomainNumber(source.rank),
    benchmark: {
      expectedValue: toDomainNumber(
        source.expectedValue !== undefined
          ? source.expectedValue
          : source.benchmark?.expectedValue
      ),
      actualValue: toDomainNumber(
        source.actualValue !== undefined
          ? source.actualValue
          : source.benchmark?.actualValue
      ),
      projectedValue: toDomainNumber(
        source.projectedValue !== undefined
          ? source.projectedValue
          : source.benchmark?.projectedValue
      ),
      gap: toDomainNumber(
        source.gap !== undefined ? source.gap : source.benchmark?.gap
      ),
    },
  }
}

export const normalizeTeamScout = ({
  offense = {},
  defense = {},
  normalization = {},
  context = {},
  source = {},
} = {}) => ({
  offense: normalizeTeamScoutSide('offense', offense),
  defense: normalizeTeamScoutSide('defense', defense),
  normalization: {
    mode: cleanDomainValue(normalization.mode),
    factor: toDomainNumber(normalization.factor, 1),
    applied: Boolean(normalization.applied),
  },
  context: {
    leagueLevel: toDomainNumber(context.leagueLevel),
    leagueGames: toDomainNumber(context.leagueGames),
    tableRank: toDomainNumber(context.tableRank),
  },
  source: {
    engineVersion: cleanDomainValue(source.engineVersion),
    calculatedAt: source.calculatedAt || null,
  },
})
