// src/features/playersDatabase/model/clubsPage.model.js

import { cleanValue, pickDefinedValue, toNumberOrZero } from '../shared/value.model.js'
import { buildTeamPerformanceViewModel } from '../team/teamPerformance.viewModel.js'
import { PLAYERS_DATABASE_CLUBS_CATALOG } from '../../catalog/clubs.catalog.js'
import {
  CLUB_SPOTLIGHT_TYPE,
} from '../../domain/clubIntelligence/index.js'

const clean = cleanValue
const CATALOG_ORDER_BY_CLUB_ID = new Map(
  PLAYERS_DATABASE_CLUBS_CATALOG.map((club, index) => [clean(club?.id), index])
)
const catalogOrderOf = club => pickDefinedValue(
  CATALOG_ORDER_BY_CLUB_ID.get(clean(club?.clubId)),
  Number.MAX_SAFE_INTEGER
)

const getClubLevel = club => Number(club?.clubStrengthLevel || club?.clubLevel) || 0

const positiveTeamSlotOrNull = value => {
  const slot = Number(value)
  return Number.isInteger(slot) && slot > 0 ? slot : null
}

const isPrimaryTeam = teamSlot => positiveTeamSlotOrNull(teamSlot) === 1

const getSeasonEntries = (club, seasonView) => (
  (Array.isArray(club?.ageGroups) ? club.ageGroups : []).flatMap(ageGroup => {
    const entries = Array.isArray(ageGroup?.[seasonView]) ? ageGroup[seasonView] : []

    return entries.map(team => ({
      clubId: clean(club?.clubId),
      clubName: clean(club?.name),
      clubShortName: clean(club?.shortName),
      clubLevel: toNumberOrZero(club?.clubLevel),
      clubStrengthLevel: getClubLevel(club),
      ageGroupId: clean(ageGroup?.ageGroupId),
      ageGroupLabel: clean(ageGroup?.ageGroupLabel),
      teamId: clean(team?.teamId),
      teamSlot: positiveTeamSlotOrNull(team?.teamSlot || team?.birthTeamSlot),
      slot: positiveTeamSlotOrNull(team?.teamSlot || team?.birthTeamSlot),
      seasonKey: clean(team?.seasonKey),
      seasonStatus: clean(team?.seasonStatus),
      birthYear: toNumberOrZero(team?.birthYear),
      leagueId: clean(team?.league?.leagueId),
      leagueName: clean(team?.league?.leagueName),
      leagueLevel: Number(team?.league?.leagueLevel) || null,
      tableRank: pickDefinedValue(team?.performance?.tableRank, null),
      tableAttackRank: pickDefinedValue(team?.performance?.tableAttackRank, null),
      tableDefenseRank: pickDefinedValue(team?.performance?.tableDefenseRank, null),
      goalsForPerGame: pickDefinedValue(team?.performance?.goalsForPerGame, null),
      goalsAgainstPerGame: pickDefinedValue(team?.performance?.goalsAgainstPerGame, null),
      performanceView: buildTeamPerformanceViewModel(team?.performance || {}),
      points: toNumberOrZero(team?.performance?.points),
      teamGamePlayed: toNumberOrZero(team?.performance?.teamGamePlayed),
      goalsFor: toNumberOrZero(team?.performance?.goalsFor),
      goalsAgainst: toNumberOrZero(team?.performance?.goalsAgainst),
      playersCount: toNumberOrZero(team?.playersCount),
      scoutProfilesCount: toNumberOrZero(team?.scoutProfilesSummary?.total),
      performance: team?.performance || {},
      transfers: team?.transfers || null,
      mismatch: team?.mismatch === true,
    }))
  })
)

export const buildClubsPageRows = ({
  clubsMasterDoc,
  seasonView = 'current',
  intelligencesByClubId = new Map(),
} = {}) => {
  const clubs = Array.isArray(clubsMasterDoc?.clubs) ? clubsMasterDoc.clubs : []

  return clubs
    .map(club => ({
      club,
      intelligence: intelligencesByClubId.get(clean(club?.clubId)) || null,
      teams: getSeasonEntries(club, seasonView),
      previousTeams: seasonView === 'current'
        ? getSeasonEntries(club, 'previous')
        : [],
    }))
    .filter(group => clean(group?.club?.clubId))
    .sort((left, right) => (
      catalogOrderOf(left.club) - catalogOrderOf(right.club) ||
      clean(left?.club?.name).localeCompare(clean(right?.club?.name), 'he')
    ))
}

export const filterClubsPageRows = ({
  groups = [],
  query = '',
  ageGroupId = 'all',
  leagueLevel = 'all',
  clubLevel = 'all',
  withScoutProfiles = false,
  leaguePathDirections = [],
  leagueLevelDirections = [],
} = {}) => {
  const normalizedQuery = clean(query).toLocaleLowerCase('he')
  const selectedClubLevels = Array.isArray(clubLevel)
    ? clubLevel.map(value => String(value))
    : clubLevel === 'all' ? [] : [String(clubLevel)]
  const selectedLeaguePathDirections = Array.isArray(leaguePathDirections)
    ? leaguePathDirections.filter(direction => ['up', 'down'].includes(direction))
    : []
  const selectedLeagueLevelDirections = Array.isArray(leagueLevelDirections)
    ? leagueLevelDirections.filter(direction => ['above', 'below'].includes(direction))
    : []

  return groups.reduce((result, group) => {
    if (selectedClubLevels.length && !selectedClubLevels.includes(String(getClubLevel(group.club)))) {
      return result
    }

    if (selectedLeaguePathDirections.length && !selectedLeaguePathDirections.every(direction => (
      (Array.isArray(group?.intelligence?.spotlights) ? group.intelligence.spotlights : [])
        .some(spotlight => (
          direction === 'up'
            ? spotlight?.type === CLUB_SPOTLIGHT_TYPE.FUTURE_LEAGUE_PATH_RISE
            : spotlight?.type === CLUB_SPOTLIGHT_TYPE.FUTURE_LEAGUE_PATH_DROP
        ))
    ))) {
      return result
    }

    if (selectedLeagueLevelDirections.length && !selectedLeagueLevelDirections.every(direction => (
      (Array.isArray(group?.intelligence?.spotlights) ? group.intelligence.spotlights : [])
        .some(spotlight => (
          direction === 'above'
            ? spotlight?.type === CLUB_SPOTLIGHT_TYPE.LEAGUE_ABOVE_CLUB_LEVEL
            : spotlight?.type === CLUB_SPOTLIGHT_TYPE.LEAGUE_BELOW_CLUB_LEVEL
        ))
    ))) {
      return result
    }

    const clubMatchesQuery = !normalizedQuery || [
      group?.club?.name,
      group?.club?.shortName,
    ].some(value => clean(value).toLocaleLowerCase('he').includes(normalizedQuery))

    const teams = group.teams.filter(team => {
      if (ageGroupId !== 'all' && clean(team.ageGroupId) !== clean(ageGroupId)) return false
      if (leagueLevel !== 'all' && (
        !isPrimaryTeam(team.teamSlot) ||
        String(team.leagueLevel || '') !== String(leagueLevel)
      )) return false
      if (withScoutProfiles && team.scoutProfilesCount <= 0) return false

      if (clubMatchesQuery) return true

      return [
        team.ageGroupLabel,
        team.leagueName,
      ].some(value => clean(value).toLocaleLowerCase('he').includes(normalizedQuery))
    })

    const isBaseClubWithoutTeams = !group.teams.length &&
      clubMatchesQuery &&
      ageGroupId === 'all' &&
      leagueLevel === 'all' &&
      !withScoutProfiles &&
      !selectedLeaguePathDirections.length &&
      !selectedLeagueLevelDirections.length

    if (!teams.length && !isBaseClubWithoutTeams) return result

    result.push({ ...group, teams })
    return result
  }, [])
}

export const buildClubsPageSummary = groups => {
  const teams = groups.flatMap(group => group.teams || [])

  return {
    clubsCount: groups.length,
    teamsCount: teams.length,
    playersCount: teams.reduce((sum, team) => sum + team.playersCount, 0),
    scoutProfilesCount: teams.reduce((sum, team) => sum + team.scoutProfilesCount, 0),
    clubsWithScoutProfilesCount: groups.filter(group => (group.teams || []).some(team => team.scoutProfilesCount > 0)).length,
  }
}
