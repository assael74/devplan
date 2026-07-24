// features/playersDatabase/services/write/searchIndex/team/teamSeasonIndex.model.js

import { serverTimestamp } from 'firebase/firestore'
import { PLAYERS_DATABASE_CLUBS_CATALOG } from '../../../../catalog/clubs.catalog.js'
import { buildTeamDisplayName } from '../../../../catalog/teamDisplay.js'
import { normalizeSeasonIdentity } from '../../../../model/season.model.js'
import { normalizeTeamIdentity, resolveTeamLookupKey } from '../../../../model/teamIdentity.model.js'
import { normalizeTeamStats } from '../../../../model/teamStats.model.js'
import { buildSeasonKey, clean, toNumberOrZero } from '../../leagues/leagueDoc.js'

export const normalizeText = value =>
  clean(value).toLowerCase()

export const resolveClubLevel = ({ clubId = '', clubLevel = null } = {}) => {
  const directClubLevel = Number(clubLevel)
  if (Number.isFinite(directClubLevel) && directClubLevel > 0) return directClubLevel

  const club = PLAYERS_DATABASE_CLUBS_CATALOG.find(item => item.id === clean(clubId))
  return toNumberOrZero(club?.clubLevel)
}

export const roundNumber = (value, digits = 3) => {
  const nextValue = Number(value)
  if (!Number.isFinite(nextValue)) return 0

  const factor = 10 ** digits
  return Math.round(nextValue * factor) / factor
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
  toNumberOrZero(row.position ?? row.rank ?? row.leaguePosition)

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
  const id = buildTeamSeasonIndexId({ leagueId, seasonKey, teamId, clubId })
  const games = getRowGames(row)
  const goalsFor = getRowGoalsFor(row)
  const goalsAgainst = getRowGoalsAgainst(row)
  const offense = scoutResult?.offense || null
  const defense = scoutResult?.defense || null
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
    clubLevel: resolveClubLevel({ clubId, clubLevel: row.clubLevel }),
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
    region: clean(league.region),
    seasonDataStatus: resolveSeasonDataStatus(target),
    seasonDataCompleteness: resolveSeasonDataCompleteness(target),

    tableRank: getRowTableRank(row),
    tableAttackRank: toNumberOrZero(tableAttackRank),
    tableDefenseRank: toNumberOrZero(tableDefenseRank),

    points: getRowPoints(row),
    goalsFor,
    goalsAgainst,
    goalsForPerGame: games ? roundNumber(goalsFor / games) : 0,
    goalsAgainstPerGame: games ? roundNumber(goalsAgainst / games) : 0,
    teamGamePlayed: games,
    attackPerformance: offense?.priorityRate ?? offense?.scoutPriorityRate ?? null,
    attackPerformanceRate: offense?.performanceRate ?? null,
    attackRankingRate: offense?.rankingRate ?? null,
    attackCombinedRate: offense?.combinedRate ?? null,
    attackQualityRate: offense?.qualityRate ?? null,
    attackScoutPriorityRate: offense?.scoutPriorityRate ?? null,
    attackPriorityRate: offense?.priorityRate ?? null,
    attackPriorityLevel: offense?.priorityLevel ?? '',
    attackAnomalyLevel: offense?.anomalyLevel ?? '',
    defensePerformance: defense?.priorityRate ?? defense?.scoutPriorityRate ?? null,
    defensePerformanceRate: defense?.performanceRate ?? null,
    defenseRankingRate: defense?.rankingRate ?? null,
    defenseCombinedRate: defense?.combinedRate ?? null,
    defenseQualityRate: defense?.qualityRate ?? null,
    defenseScoutPriorityRate: defense?.scoutPriorityRate ?? null,
    defensePriorityRate: defense?.priorityRate ?? null,
    defensePriorityLevel: defense?.priorityLevel ?? '',
    defenseAnomalyLevel: defense?.anomalyLevel ?? '',
    scoutProfiledPlayersCount: toNumberOrZero(
      row.scoutProfiledPlayersCount ?? row.scoutProfilesSummary?.total
    ),

    sourceCollection: 'leagues',
    sourceDocumentId: leagueId,
    sourceTarget: clean(target) === 'history' ? 'history' : 'current',

    updatedAt: serverTimestamp(),
  }
}
