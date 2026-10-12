// src/features/playersDatabase/ui/pages/DataOpsPage/logic/focusedAudit.model.js

import { PLAYERS_DATABASE_CLUBS_CATALOG } from '../../../../catalog/clubs.catalog.js'
import { PLAYERS_DATABASE_LEAGUES_CATALOG } from '../../../../catalog/leagues.catalog.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../../../constants/pdb.constants.js'

const clean = value => String(value === null || value === undefined ? '' : value).trim()
const object = value => (value && typeof value === 'object' && !Array.isArray(value) ? value : {})

const leagueCatalogById = new Map(
  PLAYERS_DATABASE_LEAGUES_CATALOG.map(item => [clean(item.id), item])
)
const clubCatalogById = new Map(
  PLAYERS_DATABASE_CLUBS_CATALOG.map(item => [clean(item.id), item])
)
const clubCatalogOrderById = new Map(
  PLAYERS_DATABASE_CLUBS_CATALOG.map((item, index) => [clean(item.id), index])
)

const leagueName = (leagueId, league) => {
  const catalog = leagueCatalogById.get(clean(leagueId))
  const identity = object(league?.identity)
  return clean(
    identity.leagueName
    || league?.displayName
    || league?.name
    || catalog?.name
  )
}

const leagueLabel = (leagueId, league) => {
  const catalog = leagueCatalogById.get(clean(leagueId))
  const identity = object(league?.identity)
  const ageGroup = clean(identity.ageGroupLabel || league?.ageGroupLabel || catalog?.ageGroupLabel)
  const name = leagueName(leagueId, league)

  return [ageGroup, name].filter(Boolean).join(' · ') || 'ליגה ללא שם'
}

const teamLabel = (teamId, team) => {
  const clubId = clean(team?.clubId || team?.identity?.clubId)
  const catalog = clubCatalogById.get(clubId)
  const name = clean(
    team?.displayName
    || team?.teamName
    || team?.clubName
    || catalog?.shortName
    || catalog?.name
  ) || 'קבוצה ללא שם'
  const slot = Number(team?.teamSlot || team?.birthTeamSlot || 1)

  return slot > 1 ? `${name} · קבוצה ${slot}` : name
}

const uniqueOptions = ({ items, valueOf, labelOf, sort = 'label' }) => {
  const optionsByValue = new Map()
  items.forEach(item => {
    const value = clean(valueOf(item))
    if (!value || optionsByValue.has(value)) return
    optionsByValue.set(value, {
      value,
      label: clean(labelOf(item)) || value,
    })
  })

  const options = [...optionsByValue.values()]
  if (sort === 'number-desc') {
    return options.sort((left, right) => Number(right.value) - Number(left.value))
  }
  if (sort === 'number-asc') {
    return options.sort((left, right) => Number(left.value) - Number(right.value))
  }
  return options.sort((left, right) => left.label.localeCompare(right.label, 'he'))
}

export const getFocusedAuditLeagueOptions = ({ leaguesCenterDoc = {}, seasonId = '' } = {}) => (
  Object.entries(object(leaguesCenterDoc?.leaguesById))
    .filter(([, league]) => (
      !clean(seasonId) || Boolean(object(league?.seasonsById)[clean(seasonId)])
    ))
    .map(([leagueId, league]) => ({
      value: clean(leagueId),
      label: leagueLabel(leagueId, league),
    }))
    .filter(option => option.value)
    .sort((left, right) => left.label.localeCompare(right.label, 'he'))
)

export const getFocusedAuditTeamOptions = ({
  leaguesCenterDoc = {},
  leagueId = '',
  seasonId = '',
} = {}) => {
  const leagues = object(leaguesCenterDoc?.leaguesById)
  const selectedLeagueId = clean(leagueId)
  const leagueEntries = selectedLeagueId
    ? [[selectedLeagueId, object(leagues[selectedLeagueId])]]
    : Object.entries(leagues)
  const optionsByContext = new Map()

  leagueEntries.forEach(([optionLeagueId, league]) => {
    const seasons = object(league.seasonsById)
    const seasonEntries = clean(seasonId)
      ? [[clean(seasonId), object(seasons[clean(seasonId)])]]
      : Object.entries(seasons)
    const catalog = leagueCatalogById.get(clean(optionLeagueId))
    const identity = object(league?.identity)
    const ageGroupLabel = clean(
      identity.ageGroupLabel
      || league?.ageGroupLabel
      || catalog?.ageGroupLabel
    )
    seasonEntries.forEach(([optionSeasonId, season]) => {
      Object.entries(object(season.teamsById)).forEach(([teamId, team]) => {
        const value = clean(teamId)
        const contextKey = `${clean(optionLeagueId)}::${clean(optionSeasonId)}::${value}`
        if (!value || optionsByContext.has(contextKey)) return
        const baseLabel = teamLabel(teamId, team)
        optionsByContext.set(contextKey, {
          value,
          label: baseLabel,
          leagueId: clean(optionLeagueId),
          seasonId: clean(optionSeasonId),
          leagueLabel: leagueLabel(optionLeagueId, league),
          leagueName: leagueName(optionLeagueId, league),
          clubId: clean(team?.clubId || team?.identity?.clubId),
          clubLabel: baseLabel.replace(/ · קבוצה \d+$/, ''),
          birthYear: Number(team?.birthYear || season?.birthYear || 0) || '',
          teamSlot: Number(team?.teamSlot || team?.birthTeamSlot || 1),
          ageGroupId: clean(identity.ageGroupId || league?.ageGroupId || catalog?.ageGroupId),
          ageGroupLabel,
          playersCount: Number(team?.playersCount || team?.roster?.playersCount || 0),
        })
      })
    })
  })

  return [...optionsByContext.values()]
    .sort((left, right) => left.label.localeCompare(right.label, 'he'))
}

export const getFocusedAuditClubOptions = ({
  teamOptions = [],
  clubsDirectoryDoc = {},
} = {}) => {
  const existingClubIds = new Set(teamOptions.map(item => clean(item.clubId)).filter(Boolean))
  const directoryClubs = object(clubsDirectoryDoc?.clubsById)
  const teamByClubId = new Map(teamOptions.map(item => [clean(item.clubId), item]))

  return [...existingClubIds].map(clubId => {
    const directoryClub = object(directoryClubs[clubId])
    const catalogClub = clubCatalogById.get(clubId)
    const team = teamByClubId.get(clubId)
    const label = clean(
      directoryClub?.names?.short
      || directoryClub?.names?.display
      || directoryClub?.names?.official
      || catalogClub?.shortName
      || catalogClub?.name
      || team?.clubLabel
      || clubId
    )

    return {
      value: clubId,
      label,
      displayLabel: label,
    }
  }).sort((left, right) => {
    const leftOrder = clubCatalogOrderById.get(left.value)
    const rightOrder = clubCatalogOrderById.get(right.value)
    const resolvedLeftOrder = Number.isInteger(leftOrder) ? leftOrder : Number.MAX_SAFE_INTEGER
    const resolvedRightOrder = Number.isInteger(rightOrder) ? rightOrder : Number.MAX_SAFE_INTEGER
    return resolvedLeftOrder - resolvedRightOrder || left.label.localeCompare(right.label, 'he')
  })
}

export const getFocusedAuditBirthYearOptions = ({
  teamOptions = [],
  clubId = '',
  teamSlot = '',
  seasonId = '',
} = {}) => (
  uniqueOptions({
    items: teamOptions.filter(item => (
      item.clubId === clean(clubId)
      && String(item.teamSlot) === clean(teamSlot)
      && item.seasonId === clean(seasonId)
    )),
    valueOf: item => item.birthYear,
    labelOf: item => item.birthYear,
    sort: 'number-desc',
  })
)

export const getFocusedAuditTeamSlotOptions = ({
  teamOptions = [],
  clubId = '',
} = {}) => uniqueOptions({
  items: teamOptions.filter(item => item.clubId === clean(clubId)),
  valueOf: item => item.teamSlot,
  labelOf: item => item.teamSlot,
  sort: 'number-asc',
})

export const getFocusedAuditAgeGroupOptions = ({
  teamOptions = [],
  clubId = '',
  seasonId = '',
  birthYear = '',
  teamSlot = '',
} = {}) => teamOptions
  .filter(item => (
    item.clubId === clean(clubId)
    && item.seasonId === clean(seasonId)
    && String(item.birthYear) === clean(birthYear)
    && String(item.teamSlot) === clean(teamSlot)
  ))
  .map(item => ({
    value: `${item.leagueId}::${item.value}`,
    label: [item.ageGroupLabel || item.ageGroupId, item.leagueName].filter(Boolean).join(' · '),
    teamId: item.value,
    leagueId: item.leagueId,
    ageGroupId: item.ageGroupId,
  }))
  .sort((left, right) => left.label.localeCompare(right.label, 'he'))

export const getFocusedAuditPlayerOptions = teamSeason => (
  Object.entries(object(teamSeason?.roster?.playersById))
    .map(([playerId, player]) => ({
      value: clean(playerId),
      label: clean(player?.fullName || player?.displayName || player?.name) || 'שחקן ללא שם',
    }))
    .filter(option => option.value)
    .sort((left, right) => left.label.localeCompare(right.label, 'he'))
)

const collection = (id, label, count) => ({
  id,
  label,
  collectionName: PLAYERS_DATABASE_COLLECTIONS[id] || id,
  count: Math.max(0, Number(count) || 0),
})

export const buildFocusedAuditPlan = ({
  type = 'team',
  leaguesCenterDoc = {},
  leagueId = '',
  seasonId = '',
  teamId = '',
  teamSeason = null,
} = {}) => {
  const league = object(object(leaguesCenterDoc?.leaguesById)[clean(leagueId)])
  const season = object(object(league.seasonsById)[clean(seasonId)])
  const teams = object(season.teamsById)

  if (!clean(leagueId) || !clean(seasonId)) return { ready: false, collections: [], total: 0 }

  if (type === 'league') {
    const teamRows = Object.values(teams)
    const clubCount = new Set(
      teamRows.map(team => clean(team?.clubId || team?.identity?.clubId)).filter(Boolean)
    ).size
    const collections = [
      collection('leagues', 'מסמך ליגה', 1),
      collection('clubProfiles', 'מסמכי מועדונים', clubCount),
      collection('teamSeasons', 'עונות קבוצה', teamRows.length),
      collection('leaguesCenter', 'מרכז ליגות', 1),
      collection('clubsCenter', 'מרכז מועדונים', 1),
    ]
    return {
      ready: true,
      collections,
      total: collections.reduce((sum, item) => sum + item.count, 0),
    }
  }

  if (!clean(teamId) || (type === 'player' && !teamSeason)) {
    return { ready: false, collections: [], total: 0 }
  }

  const selectedTeam = object(teams[clean(teamId)])
  const loadedRosterCount = Object.keys(object(teamSeason?.roster?.playersById)).length
  const rosterCount = teamSeason
    ? loadedRosterCount
    : Number(selectedTeam?.playersCount || selectedTeam?.roster?.playersCount || 0)
  const scopedPlayersCount = type === 'player' ? 1 : rosterCount
  const collections = [
    collection('teamRoots', 'מסמך קבוצה', 1),
    collection('teamSeasons', 'עונת קבוצה', 1),
    collection('leagues', 'מסמך ליגה', 1),
    collection('leaguesCenter', 'מרכז ליגות', 1),
    collection('clubsCenter', 'מרכז מועדונים', 1),
    collection('playerRoots', 'מסמכי שחקנים', scopedPlayersCount),
    collection('playerSeasons', 'עונות שחקן', scopedPlayersCount),
    collection('playerSearchIndexes', 'אינדקסי שחקנים', scopedPlayersCount),
  ]

  return {
    ready: true,
    collections,
    total: collections.reduce((sum, item) => sum + item.count, 0),
  }
}
