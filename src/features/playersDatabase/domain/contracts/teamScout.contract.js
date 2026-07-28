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
  performanceLevel: 'unavailable',
  rankingRate: null,
  rankingLevel: 'unavailable',
  combinedRate: null,
  combinedLevel: 'unavailable',
  qualityRate: null,
  anomalyRate: null,
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

const toRoundedDomainNumber = (value, fallback = null) => {
  const number = toDomainNumber(value, fallback)
  return Number.isFinite(number) ? Math.round(number) : fallback
}

const resolvePriorityRate = source => toRoundedDomainNumber(
  source.priorityRate !== undefined
    ? source.priorityRate
    : source.scoutPriorityRate
)

export const normalizeTeamScoutSide = (side, value = {}) => {
  const source = value && typeof value === 'object' ? value : {}
  const priorityRate = resolvePriorityRate(source)
  const performanceRate = toRoundedDomainNumber(source.performanceRate)
  const rankingRate = toRoundedDomainNumber(source.rankingRate)
  const combinedRate = toRoundedDomainNumber(source.combinedRate)
  const anomalyRate = toRoundedDomainNumber(
    source.anomalyRate !== undefined
      ? source.anomalyRate
      : source.performanceRate
  )

  return {
    ...createEmptyTeamScoutSide(side),
    performance: toRoundedDomainNumber(source.performance),
    performanceRate,
    performanceLevel: cleanDomainValue(source.performanceLevel) ||
      resolveTeamScoutPriorityLevel(performanceRate),
    rankingRate,
    rankingLevel: cleanDomainValue(source.rankingLevel) ||
      resolveTeamScoutPriorityLevel(rankingRate),
    combinedRate,
    combinedLevel: cleanDomainValue(source.combinedLevel) ||
      resolveTeamScoutPriorityLevel(combinedRate),
    qualityRate: toRoundedDomainNumber(source.qualityRate),
    anomalyRate,
    scoutPriorityRate: toRoundedDomainNumber(source.scoutPriorityRate),
    priorityRate,
    priorityLevel: cleanDomainValue(source.priorityLevel) ||
      resolveTeamScoutPriorityLevel(priorityRate),
    anomalyLevel: cleanDomainValue(source.anomalyLevel) ||
      resolveTeamScoutAnomalyLevel(combinedRate),
    rank: toRoundedDomainNumber(source.rank),
    benchmark: {
      expectedValue: toRoundedDomainNumber(
        source.expectedValue !== undefined
          ? source.expectedValue
          : source.benchmark?.expectedValue
      ),
      actualValue: toRoundedDomainNumber(
        source.actualValue !== undefined
          ? source.actualValue
          : source.benchmark?.actualValue
      ),
      projectedValue: toRoundedDomainNumber(
        source.projectedValue !== undefined
          ? source.projectedValue
          : source.benchmark?.projectedValue
      ),
      gap: toRoundedDomainNumber(
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
