// src/features/playersDatabase/model/team/page/teamPageSeasonSnapshots.model.js

import { adaptLeagueTableTeam } from '../../../domain/adapters/leagueTableTeam.adapter.js'
import { roundPerGameRate } from '../../shared/rate.model.js'
import { cleanValue } from '../../shared/value.model.js'
import { buildTeamPageSeasonView } from './teamPagePlayer.model.js'
import { findTeamPageTableRow } from './teamPageSeason.model.js'

const seasonKeyOf = season => cleanValue(
  season?.identity?.seasonKey ||
  season?.identity?.seasonId ||
  season?.seasonKey ||
  season?.seasonId ||
  season?.id
)

const numberOrNull = value => {
  if (value === null || value === undefined || value === '') return null
  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

const goalsPerGame = (goals, games) => (
  goals !== null && games !== null && games > 0
    ? roundPerGameRate(goals / games)
    : null
)

const getLeagueSeasonCandidates = ({ leagueDocuments = [], teamId = '' } = {}) => (
  (Array.isArray(leagueDocuments) ? leagueDocuments : []).flatMap(leagueDocument => {
    const seasonsById = leagueDocument?.seasonsById || {}

    return Object.entries(seasonsById).flatMap(([seasonId, season]) => {
      const tableRow = findTeamPageTableRow({ season, teamId })
      if (!tableRow) return []

      const games = numberOrNull(tableRow.officialTable?.teamGamePlayed)
      const goalsFor = numberOrNull(tableRow.officialTable?.goalsFor)
      const goalsAgainst = numberOrNull(tableRow.officialTable?.goalsAgainst)
      const normalizedRow = {
        ...tableRow,
        teamStats: {
          ...tableRow.teamStats,
          goalsForPerGame: goalsPerGame(goalsFor, games),
          goalsAgainstPerGame: goalsPerGame(goalsAgainst, games),
        },
      }
      const normalizedSeason = {
        ...season,
        seasonId: cleanValue(season?.seasonId || seasonId),
      }
      const target = cleanValue(season?.seasonStatus).toLowerCase() === 'completed'
        ? 'history'
        : 'current'
      const candidate = adaptLeagueTableTeam({
        leagueDocument,
        seasonDocument: normalizedSeason,
        tableRow: normalizedRow,
        target,
      })
      const performance = tableRow.performance || null

      return [{
        ...candidate,
        seasonKey: seasonKeyOf(candidate.season),
        seasonId: cleanValue(candidate.season.seasonId),
        leagueId: cleanValue(candidate.league.leagueId),
        leagueName: cleanValue(
          leagueDocument?.names?.display || leagueDocument?.names?.official ||
          leagueDocument?.leagueId || leagueDocument?.id
        ),
        ageGroupId: cleanValue(candidate.league.ageGroupId),
        ageGroupLabel: cleanValue(candidate.league.ageGroupLabel),
        leagueLevel: numberOrNull(candidate.league.leagueLevel),
        tableRank: numberOrNull(candidate.ranking.tableRank),
        games,
        goalsForPerGame: goalsPerGame(goalsFor, games),
        goalsAgainstPerGame: goalsPerGame(goalsAgainst, games),
        tableAttackRank: numberOrNull(performance?.offense?.rank),
        tableDefenseRank: numberOrNull(performance?.defense?.rank),
        teamStats: {
          teamGamePlayed: games,
          points: numberOrNull(tableRow.officialTable?.points),
          goalsFor,
          goalsAgainst,
        },
        performance,
        source: 'league',
        sourceDocumentId: cleanValue(candidate.metadata.sourceDocumentId),
      }]
    })
  })
)

const selectLeagueCandidate = ({ candidates = [], teamSeason = null } = {}) => {
  const teamLeagueId = cleanValue(teamSeason?.leagueId)
  return [...candidates].sort((left, right) => (
    Number(cleanValue(right.leagueId) === teamLeagueId) -
    Number(cleanValue(left.leagueId) === teamLeagueId) ||
    cleanValue(left.leagueId).localeCompare(cleanValue(right.leagueId))
  ))[0] || null
}

// A page-level record exists once per season, regardless of whether its data was
// loaded from a TeamSeason document, a league table, or both.
export const buildTeamPageSeasonSnapshots = ({
  teamId = '',
  teamSeasons = [],
  leagueDocuments = [],
} = {}) => {
  const teamSeasonsByKey = new Map(
    (Array.isArray(teamSeasons) ? teamSeasons : [])
      .filter(Boolean)
      .map(season => buildTeamPageSeasonView({ teamSeason: season }))
      .map(season => [seasonKeyOf(season), season])
      .filter(([seasonKey]) => Boolean(seasonKey))
  )
  const leagueCandidatesByKey = new Map()

  getLeagueSeasonCandidates({ leagueDocuments, teamId }).forEach(candidate => {
    if (!candidate.seasonKey) return
    const current = leagueCandidatesByKey.get(candidate.seasonKey) || []
    leagueCandidatesByKey.set(candidate.seasonKey, [...current, candidate])
  })

  const seasonKeys = new Set([
    ...teamSeasonsByKey.keys(),
    ...leagueCandidatesByKey.keys(),
  ])

  return [...seasonKeys].map(seasonKey => {
    const teamSeason = teamSeasonsByKey.get(seasonKey) || null
    const leagueSeason = selectLeagueCandidate({
      candidates: leagueCandidatesByKey.get(seasonKey) || [],
      teamSeason,
    })

    if (!leagueSeason) {
      return {
        ...teamSeason,
        seasonKey,
        source: 'teamSeason',
        sourceDocumentId: cleanValue(teamSeason?.id),
      }
    }

    // League data is official for results and ranking; TeamSeason enriches it
    // with roster, balance and derived scouting data when that document exists.
    return {
      ...leagueSeason,
      ...teamSeason,
      seasonKey,
      seasonId: cleanValue(teamSeason?.seasonId || leagueSeason.seasonId),
      leagueId: cleanValue(teamSeason?.leagueId || leagueSeason.leagueId),
      leagueName: cleanValue(teamSeason?.leagueName || leagueSeason.leagueName),
      ageGroupId: cleanValue(teamSeason?.ageGroupId || leagueSeason.ageGroupId),
      ageGroupLabel: cleanValue(teamSeason?.ageGroupLabel || leagueSeason.ageGroupLabel),
      tableRank: leagueSeason.tableRank ?? teamSeason?.tableRank ?? null,
      games: leagueSeason.games ?? teamSeason?.games ?? null,
      goalsForPerGame: leagueSeason.goalsForPerGame ?? teamSeason?.goalsForPerGame ?? null,
      goalsAgainstPerGame: leagueSeason.goalsAgainstPerGame ?? teamSeason?.goalsAgainstPerGame ?? null,
      tableAttackRank: leagueSeason.tableAttackRank ?? teamSeason?.tableAttackRank ?? null,
      tableDefenseRank: leagueSeason.tableDefenseRank ?? teamSeason?.tableDefenseRank ?? null,
      teamStats: {
        ...(teamSeason?.teamStats || {}),
        ...(leagueSeason.teamStats || {}),
      },
      performance: leagueSeason.performance || teamSeason?.performance || null,
      source: teamSeason ? 'teamSeason+league' : 'league',
      sourceDocumentId: leagueSeason.sourceDocumentId,
    }
  }).sort((left, right) => cleanValue(right.seasonKey).localeCompare(cleanValue(left.seasonKey)))
}
