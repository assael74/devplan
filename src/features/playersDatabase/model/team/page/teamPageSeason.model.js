// src/features/playersDatabase/model/team/page/teamPageSeason.model.js

import { PLAYERS_DATABASE_LEAGUES_CATALOG } from '../../../catalog/leagues.catalog.js'
import { resolveAgeGroupLabel } from '../../../catalog/ageGroups.catalog.js'
import { isSameSeason, normalizeSeasonIdentity, normalizeSeasonLookupKey } from '../../shared/season.model.js'
import { normalizeTeamIdentity } from '../teamIdentity.model.js'
import { cleanValue } from '../../shared/value.model.js'

const resolveSeasonStartYear = seasonKey => {
  const match = cleanValue(seasonKey).match(/^(\d{2})[/_-](\d{2})$/)
  return match ? 2000 + Number(match[1]) : null
}

const resolveSeasonAgeGroupLabel = ({ seasonKey = '', birthYear = null, ageGroupId = '', ageGroupLabel = '' } = {}) => {
  const startYear = resolveSeasonStartYear(seasonKey)
  const ageGroupNumber = startYear && birthYear
    ? startYear - Number(birthYear) + 1
    : null

  if (ageGroupNumber) {
    return resolveAgeGroupLabel({
      ageGroupId: `u${ageGroupNumber}`,
    })
  }

  return resolveAgeGroupLabel({
    ageGroupId,
    ageGroupLabel,
  })
}


const resolveLeagueOptionLabel = ({ season = {}, leagueId = '' } = {}) => {
  const directLabel = cleanValue(
    season?.leagueName ||
    season?.leagueLabel
  )
  if (directLabel) return directLabel

  const catalogLeague = PLAYERS_DATABASE_LEAGUES_CATALOG.find(item => (
    cleanValue(item?.id) === cleanValue(leagueId)
  ))

  return cleanValue(catalogLeague?.name || catalogLeague?.leagueName || leagueId)
}

const resolveSeasonSortValue = seasonKey => {
  const match = cleanValue(seasonKey).match(/^(\d{2})[/_-](\d{2})$/)
  return match ? Number(match[1]) : 0
}

const resolveExpectedBirthYear = ({ teamDoc = {}, teamId = '' } = {}) => {
  const direct = Number(
    teamDoc?.birthYear ||
    teamDoc?.identity?.birthYear ||
    teamDoc?.metadata?.birthYear ||
    0
  )
  if (direct) return direct

  const match = cleanValue(teamId).match(/(?:^|_)(19|20)\d{2}(?:_|$)/)
  return match ? Number(match[0].replace(/_/g, '')) : null
}

const resolveOptionTeamName = ({ season = {}, teamDoc = {} } = {}) => cleanValue(
  season?.displayName ||
  season?.teamName ||
  teamDoc?.displayName ||
  teamDoc?.teamName ||
  teamDoc?.name ||
  'קבוצה'
)

const getSeasonIdentity = season => normalizeSeasonIdentity({
  season: {
    seasonId: season?.identity?.seasonId || season?.seasonId,
    seasonKey: season?.identity?.seasonKey || season?.seasonKey,
  },
})

const buildSeasonOption = ({ season, target, leagueId = '', teamDoc = {} }) => {
  const identity = getSeasonIdentity(season)
  const seasonKey = normalizeSeasonLookupKey(identity.seasonKey || identity.seasonId)
  const birthYear = Number(
    season?.identity?.birthYear ||
    season?.birthYear ||
    teamDoc?.identity?.birthYear ||
    teamDoc?.birthYear ||
    0
  ) || null
  const resolvedLeagueId = cleanValue(season?.identity?.leagueId || season?.leagueId || leagueId)
  const ageGroupId = cleanValue(
    season?.identity?.ageGroupId ||
    season?.ageGroupId
  )
  const leagueName = resolveLeagueOptionLabel({
    season,
    leagueId: resolvedLeagueId,
  })
  const ageGroupLabel = resolveSeasonAgeGroupLabel({
    seasonKey,
    birthYear,
    ageGroupId,
    ageGroupLabel: season?.ageGroupLabel,
  })
  const teamName = resolveOptionTeamName({
    season,
    teamDoc,
  })
  const optionKey = [
    seasonKey,
    birthYear || '',
    resolvedLeagueId,
    target,
  ].join('|')

  return {
    optionKey,
    target,
    season,
    seasonId: identity.seasonId,
    seasonKey,
    birthYear,
    leagueId: resolvedLeagueId,
    leagueName,
    ageGroupId,
    ageGroupLabel,
    teamName,
    primaryLabel: [
      teamName,
      birthYear ? `שנתון ${birthYear}` : '',
      seasonKey,
    ].filter(Boolean).join(' · '),
    secondaryLabel: [
      leagueName,
      ageGroupLabel && ageGroupLabel !== '-' ? ageGroupLabel : '',
    ].filter(Boolean).join(' · '),
  }
}

const buildTeamPageTableRow = ([teamId, row]) => {
  const key = cleanValue(teamId)
  const officialTable = row.officialTable && typeof row.officialTable === 'object'
    ? row.officialTable
    : {}
  const roster = row.roster && typeof row.roster === 'object'
    ? row.roster
    : {}
  const stats = row.stats && typeof row.stats === 'object'
    ? row.stats
    : {}

  return {
    ...row,
    teamId: key,
    birthTeamId: key,
    teamDocumentId: key,
    birthTeamDocumentId: key,
    rank: officialTable.rank,
    teamStats: {
      teamGamePlayed: officialTable.teamGamePlayed,
      points: officialTable.points,
      goalsFor: officialTable.goalsFor,
      goalsAgainst: officialTable.goalsAgainst,
    },
    playersCount: roster.playersCount,
    hasPlayers: Boolean(roster.hasPlayers),
    hasStats: Boolean(stats.hasStats),
    statsComplete: Boolean(stats.statsComplete),
  }
}

export const buildTeamPageTableRows = season => Object.entries(
  season?.table?.teamsById && typeof season.table.teamsById === 'object'
    ? season.table.teamsById
    : {}
).map(buildTeamPageTableRow)

export const findTeamPageTableRow = ({ season, teamId }) => {
  const key = cleanValue(teamId)

  return buildTeamPageTableRows(season).find(row => {
    const identity = normalizeTeamIdentity({ team: row })
    return [
      identity.teamId,
      identity.birthTeamId,
      identity.teamDocumentId,
      identity.birthTeamDocumentId,
      identity.teamSlotId,
    ].includes(key)
  }) || null
}

const toLeagueDocuments = leagueDocumentsOrLeague => (
  (Array.isArray(leagueDocumentsOrLeague)
    ? leagueDocumentsOrLeague
    : [leagueDocumentsOrLeague]
  ).filter(Boolean)
)

const getLeagueSeasonEntries = league => Object.entries(
  league?.seasonsById && typeof league.seasonsById === 'object'
    ? league.seasonsById
    : {}
).map(([seasonId, season]) => ({
  season: {
    ...season,
    seasonId: cleanValue(season?.seasonId || seasonId),
    leagueId: cleanValue(league?.leagueId || league?.id),
    leagueName: cleanValue(
      league?.names?.display ||
      league?.names?.official ||
      league?.leagueId ||
      league?.id
    ),
    ageGroupId: cleanValue(season?.ageGroupId || league?.ageGroupId),
    ageGroupLabel: cleanValue(season?.ageGroupLabel || league?.ageGroupLabel),
  },
  target: cleanValue(season?.seasonStatus).toLowerCase() === 'completed'
    ? 'history'
    : 'current',
}))

export const buildTeamPageSeasonOptions = (leagueDocumentsOrLeague, teamDoc = {}, teamSeasons = [], teamId = '') => {
  const options = []
  const seen = new Set()
  const expectedBirthYear = resolveExpectedBirthYear({
    teamDoc,
    teamId,
  })

  const pushOption = option => {
    if (!option.optionKey || seen.has(option.optionKey)) return
    if (
      expectedBirthYear &&
      option.birthYear &&
      Number(option.birthYear) !== Number(expectedBirthYear)
    ) return

    seen.add(option.optionKey)
    options.push(option)
  }

  ;(Array.isArray(teamSeasons) ? teamSeasons : []).forEach(season => {
    const identity = getSeasonIdentity(season)
    if (!identity.seasonId && !identity.seasonKey) return
    pushOption(buildSeasonOption({
      season,
      target: cleanValue(
        season?.identity?.seasonStatus || season?.seasonStatus
      ).toLowerCase() === 'completed' ? 'history' : 'current',
      teamDoc,
    }))
  })

  const pushLeagueOption = ({ league, season, target }) => {
    if (!season?.seasonId && !season?.seasonKey) return
    if (!findTeamPageTableRow({ season, teamId })) return

    pushOption(buildSeasonOption({
      season,
      target,
      leagueId: cleanValue(league?.leagueId || league?.id),
      teamDoc,
    }))
  }

  toLeagueDocuments(leagueDocumentsOrLeague).forEach(league => {
    getLeagueSeasonEntries(league).forEach(({ season, target }) => {
      pushLeagueOption({
        league,
        season,
        target,
      })
    })
  })

  return options
    .filter(option => option.seasonKey || option.seasonId)
    .sort((left, right) => {
      const seasonOrder = resolveSeasonSortValue(right.seasonKey) - resolveSeasonSortValue(left.seasonKey)
      if (seasonOrder) return seasonOrder

      return Number(right.birthYear || 0) - Number(left.birthYear || 0)
    })
}


export const findTeamPageSeasonDoc = ({ teamSeasons = [], selectedSeasonOption }) => {
  if (!selectedSeasonOption) return null

  const rows = Array.isArray(teamSeasons) ? teamSeasons : []
  return rows.find(row => isSameSeason(
    getSeasonIdentity(row),
    selectedSeasonOption
  )) || null
}

export const findTeamPageLeagueSeasonDoc = ({
  leagueDoc,
  leagueDocuments,
  selectedSeasonOption,
}) => {
  if (!selectedSeasonOption) return null

  const documents = toLeagueDocuments(
    leagueDocuments?.length ? leagueDocuments : leagueDoc
  ).sort((left, right) => (
    Number(cleanValue(right?.id || right?.leagueId) === cleanValue(selectedSeasonOption?.leagueId)) -
    Number(cleanValue(left?.id || left?.leagueId) === cleanValue(selectedSeasonOption?.leagueId))
  ))

  for (const document of documents) {
    const matchingEntry = getLeagueSeasonEntries(document).find(({ season }) => (
      isSameSeason(season, selectedSeasonOption)
    ))
    if (matchingEntry) {
      return {
        leagueDoc: document,
        season: matchingEntry.season,
        target: matchingEntry.target,
      }
    }
  }

  return null
}
