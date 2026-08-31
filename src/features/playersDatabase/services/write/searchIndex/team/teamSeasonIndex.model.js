// src/features/playersDatabase/services/write/searchIndex/team/teamSeasonIndex.model.js

import { serverTimestamp } from 'firebase/firestore'
import { adaptTeamScoutEngineRow } from '../../../../domain/index.js'
import { buildTeamDisplayName } from '../../../../catalog/teamDisplay.js'
import { normalizeSeasonIdentity } from '../../../../model/season.model.js'
import {
  normalizeTeamIdentity,
  resolveTeamLookupKey,
} from '../../../../model/teamIdentity.model.js'
import { normalizeTeamStats } from '../../../../model/teamStats.model.js'
import {
  buildSeasonKey,
  clean,
  toNumberOrZero,
} from '../../leagues/leagueDoc.js'
import { buildTeamSeasonSearchMetrics } from '../shared/searchIndexNormalization.model.js'
import {
  buildTeamPerformanceProjectionFromTableRows,
} from '../../shared/teamPerformanceProjection.js'
import {
  resolveClubLevel,
  resolveClubStrengthLevel,
} from '../../shared/teamClubContext.js'

import { pickDefinedValue } from '../../../../model/value.model.js'
export const normalizeText = value =>
  clean(value).toLowerCase()

export {
  resolveClubLevel,
  resolveClubStrengthLevel,
}

const resolveNeedLevel = ({ needs = [], id = '' } = {}) => {
  const need = (Array.isArray(needs) ? needs : []).find(item => item?.id === id)
  return clean(need?.level) || 'none'
}

export const roundNumber = (value, digits = 3) => {
  const nextValue = Number(value)
  if (!Number.isFinite(nextValue)) return 0

  const factor = 10 ** digits
  return Math.round(nextValue * factor) / factor
}

const roundOptionalWholeNumber = value => {
  const number = Number(value)
  return Number.isFinite(number) ? Math.round(number) : null
}

// These fields are a League-table Scout projection. They remain valid when
// the Team SearchIndex is League-only and must not be reset with roster state.
export const buildTeamSearchIndexLeagueScoutProjection = ({
  league = {},
  season = {},
  scoutResult = null,
} = {}) => {
  const scoutSource = scoutResult || {}
  const performance = adaptTeamScoutEngineRow({
    row: scoutSource,
    source: {
      engineVersion: 'scouting-v2',
      normalization: scoutSource.normalization || {},
      leagueLevel: league.level,
      leagueGames: season.leagueTotalRound,
      calculatedAt: season.updatedAt || null,
    },
  })
  const offense = performance.offense
  const defense = performance.defense

  return {
    attackScoutPriorityScore: roundOptionalWholeNumber(
      pickDefinedValue(offense?.scoutPriorityScore, offense?.scoutPriorityRate)
    ),
    attackPriorityLevel: pickDefinedValue(offense?.priorityLevel, ''),
    attackOpportunityType: pickDefinedValue(offense?.opportunityType, ''),
    defenseScoutPriorityScore: roundOptionalWholeNumber(
      pickDefinedValue(defense?.scoutPriorityScore, defense?.scoutPriorityRate)
    ),
    defensePriorityLevel: pickDefinedValue(defense?.priorityLevel, ''),
    defenseOpportunityType: pickDefinedValue(defense?.opportunityType, ''),
    teamScoutEngineVersion: 'scouting-v2',
    scoutCompetitionRelation: clean(scoutSource.scoutContext?.competition?.relation),
    scoutCompetitionGap: scoutSource.scoutContext?.competition?.gap === null ||
      scoutSource.scoutContext?.competition?.gap === undefined
      ? null
      : Number(scoutSource.scoutContext.competition.gap),
    attackingNeedLevel: resolveNeedLevel({
      needs: scoutSource.needs,
      id: 'attacking_need',
    }),
    defensiveNeedLevel: resolveNeedLevel({
      needs: scoutSource.needs,
      id: 'defensive_need',
    }),
    balanceProblemLevel: resolveNeedLevel({
      needs: scoutSource.needs,
      id: 'balance_problem',
    }),
    recruitmentWindow: clean(scoutSource.recruitmentOpportunity?.window) || 'none',
  }
}

export const buildTeamSeasonIndexId = ({
  leagueId = '',
  seasonKey = '',
  teamId = '',
  clubId = '',
} = {}) =>
  [
    'birthTeamSeason',
    clean(leagueId),
    buildSeasonKey(seasonKey),
    clean(teamId || clubId),
  ].filter(Boolean).join('__')

export const getRowTableRank = row =>
  toNumberOrZero(pickDefinedValue(row.position, row.rank, row.leaguePosition))

export const normalizeTableRowStats = row => normalizeTeamStats(row, {
  gamesCandidates: [row.games, row.teamGamePlayed, row.teamStats?.teamGamePlayed],
  goalsForCandidates: [row.goalsFor, row.teamStats?.goalsFor],
  goalsAgainstCandidates: [row.goalsAgainst, row.teamStats?.goalsAgainst],
  pointsCandidates: [row.points, row.teamStats?.points],
})

export const getRowGames = row => normalizeTableRowStats(row).gamesPlayed

export const getRowGoalsFor = row => normalizeTableRowStats(row).goalsFor

export const getRowGoalsAgainst = row => normalizeTableRowStats(row).goalsAgainst

export const getRowPoints = row => normalizeTableRowStats(row).points

export const buildRankMap = ({
  rows = [],
  valueGetter,
  direction = 'desc',
} = {}) => {
  const sortedRows = [...rows].sort((a, b) => {
    const valueA = valueGetter(a)
    const valueB = valueGetter(b)
    if (valueA !== valueB) return direction === 'asc' ? valueA - valueB : valueB - valueA

    return getRowTableRank(a) - getRowTableRank(b)
  })

  return sortedRows.reduce((acc, row, index) => {
    const key = clean(resolveTeamLookupKey(row) || row.clubId)
    if (!key) return acc

    acc[key] = index + 1
    return acc
  }, {})
}

export const resolveSeasonDataStatus = target =>
  clean(target) === 'history' ? 'historical' : 'current'

export const resolveSeasonDataCompleteness = target =>
  clean(target) === 'history' ? 'complete' : 'partial'

export const buildTeamSeasonIndexDoc = ({
  league = {},
  season = {},
  target = 'current',
  row = {},
  tableAttackRank = 0,
  tableDefenseRank = 0,
  teamPerformance = null,
  scoutResult = null,
} = {}) => {
  const leagueId = clean(league.id || season.leagueId || row.leagueId)
  const seasonIdentity = normalizeSeasonIdentity({ season })
  const seasonKey = seasonIdentity.seasonKey
  const seasonId = seasonIdentity.seasonId
  const teamIdentity = normalizeTeamIdentity({ team: row })
  const clubId = teamIdentity.clubId
  const teamId = clean(
    teamIdentity.birthTeamId ||
    teamIdentity.teamId ||
    teamIdentity.teamSlotId
  )
  const id = buildTeamSeasonIndexId({
    leagueId,
    seasonKey,
    teamId,
    clubId,
  })
  const performanceProjection = teamPerformance ||
    buildTeamPerformanceProjectionFromTableRows({
      rows: [row],
      team: row,
      tableAttackRank,
      tableDefenseRank,
    }) || {
      tableRank: getRowTableRank(row),
      tableAttackRank: toNumberOrZero(tableAttackRank),
      tableDefenseRank: toNumberOrZero(tableDefenseRank),
      teamGamePlayed: getRowGames(row),
      goalsFor: getRowGoalsFor(row),
      goalsAgainst: getRowGoalsAgainst(row),
      goalsForPerGame: 0,
      goalsAgainstPerGame: 0,
    }
  const games = performanceProjection.teamGamePlayed
  const goalsFor = performanceProjection.goalsFor
  const goalsAgainst = performanceProjection.goalsAgainst
  const scoutSource = scoutResult || {}
  const points = getRowPoints(row)
  const normalization = buildTeamSeasonSearchMetrics({
    target,
    seasonStatus: season.seasonStatus,
    leagueTotalRound: season.leagueTotalRound,
    teamGamePlayed: games,
    points,
    goalsFor,
    goalsAgainst,
  })
  const displayName = buildTeamDisplayName({
    clubName: row.clubName || row.displayName,
    clubId,
    teamId,
    teamSlot: row.birthTeamSlot || row.teamSlot,
  })

  return {
    id,
    entityType: 'birthTeamSeason',
    entityId: id,

    displayName,
    normalizedDisplayName: normalizeText(displayName),

    leagueId,
    seasonId,
    seasonKey,
    clubId,
    clubLevel: resolveClubLevel({
      clubId,
      clubLevel: row.clubLevel,
    }),
    clubStrengthLevel: resolveClubStrengthLevel({
      clubId,
      clubLevel: row.clubLevel,
      clubStrengthLevel: scoutSource.clubStrengthLevel || row.clubStrengthLevel,
    }),
    birthTeamId: teamId,
    birthTeamDocumentId: teamIdentity.birthTeamDocumentId || teamId,
    birthTeamSlot: teamIdentity.birthTeamSlot || 1,
    teamId,
    teamDocumentId: teamIdentity.birthTeamDocumentId || teamIdentity.teamDocumentId || teamId,
    teamUrl: clean(row.teamUrl),
    seasonUrl: clean(season.seasonUrl),

    ageGroupId: clean(row.ageGroupId || league.ageGroupId),
    ageGroupLabel: clean(row.ageGroupLabel || league.ageGroupLabel),
    birthYear: toNumberOrZero(season.birthYear),
    leagueTotalRound: toNumberOrZero(season.leagueTotalRound),
    leagueLevel: toNumberOrZero(league.level),
    expectedLevelDelta: row.expectedLevelDelta !== null
      && row.expectedLevelDelta !== undefined
      && Number.isFinite(Number(row.expectedLevelDelta))
      ? Number(row.expectedLevelDelta)
      : null,
    region: clean(league.region),
    seasonDataStatus: resolveSeasonDataStatus(target),
    seasonDataCompleteness: resolveSeasonDataCompleteness(target),

    tableRank: performanceProjection.tableRank,
    tableAttackRank: performanceProjection.tableAttackRank,
    tableDefenseRank: performanceProjection.tableDefenseRank,

    points,
    goalsFor,
    goalsAgainst,
    goalsForPerGame: performanceProjection.goalsForPerGame,
    goalsAgainstPerGame: performanceProjection.goalsAgainstPerGame,
    teamGamePlayed: games,
    ...normalization,
    teamPerformanceSchemaVersion: 5,

    ...buildTeamSearchIndexLeagueScoutProjection({
      league,
      season,
      scoutResult: scoutSource,
    }),

    playersCount: toNumberOrZero(row.playersCount),
    scoutProfilesSummary: {
      total: toNumberOrZero(row.scoutProfilesSummary?.total),
      profileCounts:
        row.scoutProfilesSummary?.profileCounts &&
        typeof row.scoutProfilesSummary.profileCounts === 'object'
          ? { ...row.scoutProfilesSummary.profileCounts }
          : {},
    },

    sourceCollection: 'leagues',
    sourceDocumentId: leagueId,
    sourceTarget: clean(target) === 'history' ? 'history' : 'current',

    updatedAt: serverTimestamp(),
  }
}
