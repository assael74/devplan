// src/features/playersDatabase/domain/contracts/teamScout.contract.js

import {
  resolveTeamScoutAnomalyLevel,
  resolveTeamScoutPriorityScoreLevel,
} from '../../../../shared/scouting/teams/index.js'
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
  scoutPriorityScore: null,
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
    scout: {
      competition: null,
      performance: null,
      futureCompetition: null,
    },
  },
  needs: [],
  recruitmentOpportunity: {
    window: 'none',
    needs: [],
    reasons: [],
  },
  source: {
    engineVersion: '',
    calculatedAt: null,
  },
})

const firstDefined = (...values) => values.find(value => (
  value !== undefined && value !== null && value !== ''
))

const normalizeNeed = value => ({
  id: cleanDomainValue(value?.id),
  level: cleanDomainValue(value?.level),
  active: Boolean(value?.active),
  evidence: Array.isArray(value?.evidence)
    ? value.evidence.map(cleanDomainValue).filter(Boolean)
    : [],
})

export const normalizeTeamScoutSide = (side, value = {}) => {
  const source = value && typeof value === 'object' ? value : {}
  const targetRate = toDomainNumber(source.targetRate)
  const targetNormalized = toDomainNumber(source.targetNormalized)
  const rankingRate = toDomainNumber(source.rankingRate)
  const rankingNormalized = toDomainNumber(source.rankingNormalized)
  const anomalyRate = toDomainNumber(source.anomalyRate)
  const qualityRate = toDomainNumber(source.qualityRate)
  const scoutPriorityScore = toDomainNumber(source.scoutPriorityScore)

  return {
    ...createEmptyTeamScoutSide(side),
    targetRate,
    targetNormalized,
    targetLevel: cleanDomainValue(source.targetLevel) || 'unavailable',
    rankingRate,
    rankingNormalized,
    rankingLevel: cleanDomainValue(source.rankingLevel) || 'unavailable',
    anomalyRate,
    anomalyLevel: cleanDomainValue(source.anomalyLevel) ||
      resolveTeamScoutAnomalyLevel(anomalyRate),
    qualityRate,
    scoutPriorityScore,
    priorityLevel: cleanDomainValue(source.priorityLevel) ||
      resolveTeamScoutPriorityScoreLevel(scoutPriorityScore),
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
  scoutContext = null,
  needs = [],
  recruitmentOpportunity = {},
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
    scout: scoutContext && typeof scoutContext === 'object'
      ? scoutContext
      : {
        competition: null,
        performance: null,
        futureCompetition: null,
      },
  },
  needs: (Array.isArray(needs) ? needs : []).map(normalizeNeed),
  recruitmentOpportunity: {
    window: cleanDomainValue(recruitmentOpportunity.window) || 'none',
    needs: (Array.isArray(recruitmentOpportunity.needs)
      ? recruitmentOpportunity.needs
      : []).map(normalizeNeed),
    reasons: Array.isArray(recruitmentOpportunity.reasons)
      ? recruitmentOpportunity.reasons.map(cleanDomainValue).filter(Boolean)
      : [],
  },
  source: {
    engineVersion: cleanDomainValue(source.engineVersion),
    calculatedAt: source.calculatedAt || null,
  },
})
