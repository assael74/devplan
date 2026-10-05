// features/playersDatabase/ui/pages/searchPage/logic/search.model.js

import { buildTeamDisplayName } from '../../../../catalog/teamDisplay.js'
import { PLAYERS_DATABASE_LEAGUES_CATALOG } from '../../../../catalog/leagues.catalog.js'

import { pickDefinedValue } from '../../../../model/shared/value.model.js'
const clean = value => String(value === null || value === undefined ? '' : value).trim()

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
  const primaryProfile = scout.primary || null
  const actual = playerSeason.stats?.actual || {}
  const team = playerSeason.team || {}
  const season = playerSeason.season || {}
  const identity = playerSeason.identity || {}
  const player = playerSeason.player || {}

  return {
    ...playerSeason,
    id: clean(playerSeason.id),
    playerId: clean(playerSeason.playerId),
    entityType: 'playerSeason',
    playerName: clean(identity.displayName) || 'שחקן ללא שם',
    teamId: clean(team.teamId),
    teamSeasonDocumentId: clean(playerSeason.references?.teamSeasonDocumentId),
    teamName: resolveTeamName({
      ...team,
      displayName: team.teamDisplayName,
      birthTeamSlot: team.teamSlot,
    }) || '-',
    leagueId: clean(playerSeason.leagueId),
    leagueName: resolveLeagueName(playerSeason.leagueId) || '-',
    leagueLevel: pickDefinedValue(playerSeason.leagueLevel, '-'),
    birthYear: pickDefinedValue(playerSeason.birthYear, '-'),
    ageGroupLabel: clean(team.ageGroupLabel) || '-',
    seasonId: clean(playerSeason.seasonId),
    seasonKey: clean(season.seasonKey || playerSeason.seasonId) || '-',
    minutes: Number(actual.minutes || 0),
    appearances: Number(actual.games || 0),
    starts: Number(actual.starts || 0),
    goals: Number(actual.goals || 0),
    primaryProfile: clean(primaryProfile?.profileId) || '-',
    scoutProfiles: (Array.isArray(playerSeason.scoutProfileIds)
      ? playerSeason.scoutProfileIds
      : []).map(profileId => ({ profileId, label: profileId })),
    scoutCombinations: Array.isArray(playerSeason.scoutCombinationIds)
      ? playerSeason.scoutCombinationIds
      : [],
    scoutProfileDisplay: {
      id: clean(primaryProfile?.profileId),
      label: clean(primaryProfile?.profileId),
      score: pickDefinedValue(primaryProfile?.score, null),
      profileStrength: pickDefinedValue(primaryProfile?.strengthDepthPct, null),
    },
    profileStrength: pickDefinedValue(primaryProfile?.strengthDepthPct, null),
    score: Number(pickDefinedValue(primaryProfile?.score, 0)),
    playerUrl: clean(player.playerUrl),
    notes: clean(player.notes),
    positionLayer: clean(player.positionLayer),
    primaryPosition: clean(player.primaryPosition),
    numShirt: clean(player.numShirt),
  }
}

export function normalizeSearchRow(row = {}) {
  return normalizePlayerSearchRow(row)
}

export function normalizeSearchRows(rows = []) {
  return (Array.isArray(rows) ? rows : [])
    .filter(Boolean)
    .map(normalizeSearchRow)
}
