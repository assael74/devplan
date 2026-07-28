// src/features/playersDatabase/ui/pages/searchPage/logic/search.model.js

import { buildTeamDisplayName } from '../../../../catalog/teamDisplay.js'
import { PLAYERS_DATABASE_LEAGUES_CATALOG } from '../../../../catalog/leagues.catalog.js'

const clean = value => String(value ?? '').trim()

const LEAGUE_BY_ID = PLAYERS_DATABASE_LEAGUES_CATALOG.reduce((map, league) => {
  map[clean(league.id)] = league
  return map
}, {})

const resolveLeagueName = leagueId => clean(
  LEAGUE_BY_ID[clean(leagueId)]?.name || leagueId
)

const resolveTeamName = team => clean(
  team?.displayName ||
  buildTeamDisplayName({
    clubId: clean(team?.clubId),
    teamId: clean(team?.teamId),
    teamSlot: team?.birthTeamSlot,
  })
)

const normalizePlayerSearchRow = playerSeason => {
  const scout = playerSeason.scout || {}
  const display = scout.display || {}
  const primaryProfile = scout.primaryProfile || null
  const actual = playerSeason.stats?.actual || {}
  const team = playerSeason.team || {}
  const season = playerSeason.season || {}
  const identity = playerSeason.identity || {}
  const metadata = playerSeason.metadata || {}

  return {
    ...playerSeason,
    id: clean(identity.playerDocumentId || identity.playerId || playerSeason.id),
    entityType: 'playerSeason',
    playerName: clean(identity.displayName) || 'שחקן ללא שם',
    teamName: resolveTeamName(team) || '-',
    leagueName: resolveLeagueName(team.leagueId) || '-',
    leagueLevel: team.leagueLevel ?? '-',
    birthYear: season.birthYear ?? '-',
    seasonKey: clean(season.seasonKey || season.seasonId) || '-',
    minutes: Number(actual.minutes || 0),
    appearances: Number(actual.games || 0),
    starts: Number(actual.starts || 0),
    goals: Number(actual.goals || 0),
    primaryProfile: clean(primaryProfile?.label || display.label) || '-',
    scoutProfiles: Array.isArray(scout.profiles) ? scout.profiles : [],
    scoutProfileDisplay: display,
    score: Number(display.score ?? primaryProfile?.score ?? 0),
    reliability: clean(display.reliability?.level),
    avatarUrl: clean(metadata.avatarUrl),
    favorite: Boolean(metadata.favorite),
    notes: clean(metadata.notes),
  }
}

const normalizeTeamSearchRow = teamSeason => {
  const identity = teamSeason.identity || {}
  const season = teamSeason.season || {}
  const league = teamSeason.league || {}
  const actual = teamSeason.stats?.actual || {}
  const offense = teamSeason.performance?.offense || {}
  const defense = teamSeason.performance?.defense || {}
  const ranking = teamSeason.ranking || {}
  const primarySide = Number(offense.scoutPriorityRate || 0) >= Number(defense.scoutPriorityRate || 0)
    ? offense
    : defense

  return {
    ...teamSeason,
    id: clean(identity.teamDocumentId || identity.teamId || teamSeason.id),
    entityType: 'birthTeamSeason',
    playerName: clean(identity.displayName) || 'קבוצה ללא שם',
    teamName: clean(identity.displayName) || '-',
    leagueName: resolveLeagueName(league.leagueId) || '-',
    leagueLevel: league.leagueLevel ?? '-',
    birthYear: season.birthYear ?? '-',
    seasonKey: clean(season.seasonKey || season.seasonId) || '-',
    minutes: 0,
    appearances: Number(actual.gamesPlayed || 0),
    tableRank: Number(ranking.tableRank || 0),
    tableAttackRank: Number(ranking.attackRank || 0),
    tableDefenseRank: Number(ranking.defenseRank || 0),
    goalsFor: Number(actual.goalsFor || 0),
    goalsAgainst: Number(actual.goalsAgainst || 0),
    playersCount: Number(teamSeason.playersCount || 0),
    starts: 0,
    goals: Number(actual.goalsFor || 0),
    primaryProfile: clean(primarySide.priorityLevel) || '-',
    scoutProfileDisplay: {
      type: 'teamPerformance',
      id: clean(primarySide.side),
      label: clean(primarySide.priorityLevel),
      score: primarySide.scoutPriorityRate ?? null,
      reliability: { level: '' },
      baseProfiles: [],
    },
    score: Number(primarySide.scoutPriorityRate || 0),
    offense,
    defense,
  }
}

export function normalizeSearchRow(row = {}) {
  if (row?.entityType === 'birthTeamSeason' || row?.performance) {
    return normalizeTeamSearchRow(row)
  }

  return normalizePlayerSearchRow(row)
}

export function normalizeSearchRows(rows = []) {
  return (Array.isArray(rows) ? rows : [])
    .filter(Boolean)
    .map(normalizeSearchRow)
}
