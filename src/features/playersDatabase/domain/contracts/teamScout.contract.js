// src/features/playersDatabase/domain/contracts/teamScout.contract.js

import {
  resolveTeamScoutAnomalyLevel,
  resolveTeamScoutPriorityLevel,
  resolveTeamScoutPriorityScoreLevel,
} from '../../../../shared/teams/scout/index.js'
import {
  cleanDomainValue,
  toDomainNumber,
} from './domainValue.contract.js'

export const createEmptyTeamScoutSide = side => ({
  side,
  targetRate: null,
  targetNormalized: null,
  targetLevel: 'unavailable',
  rankingRate: null,
  rankingNormalized: null,
  rankingLevel: 'unavailable',
  anomalyRate: null,
  anomalyLevel: 'unavailable',
  qualityRate: null,
  scoutPriorityRate: null,
  priorityLevel: 'unavailable',
  opportunityType: 'unavailable',
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

const firstDefined = (...values) => values.find(value => (
  value !== undefined && value !== null && value !== ''
))

export const normalizeTeamScoutSide = (side, value = {}) => {
  const source = value && typeof value === 'object' ? value : {}
  const targetRate = toDomainNumber(source.targetRate)
  const targetNormalized = toDomainNumber(source.targetNormalized)
  const rankingRate = toDomainNumber(source.rankingRate)
  const rankingNormalized = toDomainNumber(source.rankingNormalized)
  const anomalyRate = toDomainNumber(source.anomalyRate)
  const qualityRate = toDomainNumber(source.qualityRate)
  const scoutPriorityRate = toDomainNumber(source.scoutPriorityRate)

  return {
    ...createEmptyTeamScoutSide(side),
    targetRate,
    targetNormalized,
    targetLevel: cleanDomainValue(source.targetLevel) ||
      resolveTeamScoutPriorityLevel(targetRate),
    rankingRate,
    rankingNormalized,
    rankingLevel: cleanDomainValue(source.rankingLevel) ||
      resolveTeamScoutPriorityLevel(rankingRate),
    anomalyRate,
    anomalyLevel: cleanDomainValue(source.anomalyLevel) ||
      resolveTeamScoutAnomalyLevel(anomalyRate),
    qualityRate,
    scoutPriorityRate,
    priorityLevel: cleanDomainValue(source.priorityLevel) ||
      resolveTeamScoutPriorityScoreLevel(scoutPriorityRate),
    opportunityType: cleanDomainValue(source.opportunityType) || 'unavailable',
    rank: toDomainNumber(source.rank),
    benchmark: {
      expectedValue: toDomainNumber(firstDefined(
        source.expectedValue,
        source.benchmark?.expectedValue
      )),
      actualValue: toDomainNumber(firstDefined(
        source.actualValue,
        source.benchmark?.actualValue
      )),
      projectedValue: toDomainNumber(firstDefined(
        source.projectedValue,
        source.benchmark?.projectedValue
      )),
      gap: toDomainNumber(firstDefined(
        source.gap,
        source.benchmark?.gap
      )),
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
