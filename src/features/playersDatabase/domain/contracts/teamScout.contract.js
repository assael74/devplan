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
  targetRate: null,
  targetLevel: 'unavailable',
  rankingRate: null,
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

const toRoundedDomainNumber = (value, fallback = null) => {
  const number = toDomainNumber(value, fallback)
  return Number.isFinite(number) ? Math.round(number) : fallback
}

const firstDefined = (...values) => values.find(value => (
  value !== undefined && value !== null && value !== ''
))

export const normalizeTeamScoutSide = (side, value = {}) => {
  const source = value && typeof value === 'object' ? value : {}
  const targetRate = toRoundedDomainNumber(source.targetRate)
  const rankingRate = toRoundedDomainNumber(source.rankingRate)
  const anomalyRate = toRoundedDomainNumber(source.anomalyRate)
  const qualityRate = toRoundedDomainNumber(source.qualityRate)
  const scoutPriorityRate = toRoundedDomainNumber(source.scoutPriorityRate)

  return {
    ...createEmptyTeamScoutSide(side),
    targetRate,
    targetLevel: cleanDomainValue(source.targetLevel) ||
      resolveTeamScoutPriorityLevel(targetRate),
    rankingRate,
    rankingLevel: cleanDomainValue(source.rankingLevel) ||
      resolveTeamScoutPriorityLevel(rankingRate),
    anomalyRate,
    anomalyLevel: cleanDomainValue(source.anomalyLevel) ||
      resolveTeamScoutAnomalyLevel(anomalyRate),
    qualityRate,
    scoutPriorityRate,
    priorityLevel: cleanDomainValue(source.priorityLevel) ||
      resolveTeamScoutPriorityLevel(scoutPriorityRate),
    opportunityType: cleanDomainValue(source.opportunityType) || 'unavailable',
    rank: toRoundedDomainNumber(source.rank),
    benchmark: {
      expectedValue: toRoundedDomainNumber(firstDefined(
        source.expectedValue,
        source.benchmark?.expectedValue
      )),
      actualValue: toRoundedDomainNumber(firstDefined(
        source.actualValue,
        source.benchmark?.actualValue
      )),
      projectedValue: toRoundedDomainNumber(firstDefined(
        source.projectedValue,
        source.benchmark?.projectedValue
      )),
      gap: toRoundedDomainNumber(firstDefined(
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
