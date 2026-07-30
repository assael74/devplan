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

const resolveTeamName = team => {
  const displayName = clean(team?.displayName)
  const teamSlot = Number(team?.birthTeamSlot || team?.teamSlot || 1)

  if (displayName) {
    const slotSuffix = ` ${teamSlot}`
    return teamSlot > 1 && !displayName.endsWith(slotSuffix)
      ? `${displayName}${slotSuffix}`
      : displayName
  }

  return clean(buildTeamDisplayName({
    clubId: clean(team?.clubId),
    teamId: clean(team?.teamId),
    teamSlot,
  }))
}

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
    playerId: clean(identity.playerId),
    entityType: 'playerSeason',
    playerName: clean(identity.displayName) || 'שחקן ללא שם',
    teamName: resolveTeamName(team) || '-',
    leagueName: resolveLeagueName(team.leagueId) || '-',
    leagueLevel: team.leagueLevel ?? '-',
    birthYear: season.birthYear ?? '-',
    ageGroupLabel: clean(team.ageGroupLabel) || '-',
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
    playerUrl: clean(metadata.playerUrl),
    notes: clean(metadata.notes),
    positionLayer: clean(playerSeason.position?.layer),
    primaryPosition: clean(playerSeason.position?.primary),
    numShirt: clean(playerSeason.position?.shirtNumber),
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
  const offensePriorityScore = offense.scoutPriorityScore
  const defensePriorityScore = defense.scoutPriorityScore
  const primarySide = Number(offensePriorityScore || 0) >= Number(defensePriorityScore || 0)
    ? offense
    : defense
  const primaryScore = primarySide.scoutPriorityScore

  return {
    ...teamSeason,
    id: clean(identity.teamDocumentId || identity.teamId || teamSeason.id),
    birthTeamId: clean(identity.teamId),
    entityType: 'birthTeamSeason',
    playerName: resolveTeamName({
      displayName: identity.displayName,
      clubId: identity.clubId,
      teamId: identity.teamId,
      birthTeamSlot: identity.teamSlot,
    }) || 'קבוצה ללא שם',
    teamName: resolveTeamName({
      displayName: identity.displayName,
      clubId: identity.clubId,
      teamId: identity.teamId,
      birthTeamSlot: identity.teamSlot,
    }) || '-',
    leagueName: resolveLeagueName(league.leagueId) || '-',
    leagueLevel: league.leagueLevel ?? '-',
    birthYear: season.birthYear ?? '-',
    ageGroupLabel: clean(league.ageGroupLabel) || '-',
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
      score: primaryScore ?? null,
      reliability: { level: '' },
      baseProfiles: [],
    },
    score: Number(primaryScore || 0),
    offense,
    defense,
    teamUrl: clean(teamSeason.metadata?.teamUrl),
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
