// src/features/playersDatabase/model/league/center/leagueCenterRows.model.js

import {
  countTeamSignalFamilies,
  countTeamSignalStrengths,
  groupTeamsByResearchWork,
  groupTeamsByStrongSignalMinimum,
  hasActiveTeamSignals,
  mergeTeamSignalSummaries,
} from '../../../domain/signals/teamSignalSummary.js'

import { PLAYERS_DATABASE_LEAGUES_CATALOG } from '../../../catalog/leagues.catalog.js'
import {
  getSeasonCatalogOptions,
  PLAYERS_DATABASE_CURRENT_SEASON_KEY,
} from '../../../catalog/seasons.catalog.js'
import {
  normalizeSeasonLookupKey,
  resolveSeasonBirthYear,
  resolveSeasonLookupKey,
} from '../../shared/season.model.js'
import {
  cleanValue,
  toNumberOrZero,
} from '../../shared/value.model.js'

export const LEAGUE_CENTER_ALL_SEASONS_KEY = 'all'
export const LEAGUE_CENTER_DEFAULT_SEASON_KEY = LEAGUE_CENTER_ALL_SEASONS_KEY
export const LEAGUE_CENTER_CURRENT_SEASON_KEY = PLAYERS_DATABASE_CURRENT_SEASON_KEY

const clean = cleanValue
const toNumber = toNumberOrZero

const object = value => (
  value && typeof value === 'object' && !Array.isArray(value) ? value : {}
)

const toAgeGroupLabel = value => {
  const ageGroupId = clean(value)
  return ageGroupId ? ageGroupId.toUpperCase() : ''
}

const normalizeSeasonKey = normalizeSeasonLookupKey

export const resolveLeagueCenterSeasonTarget = seasonKey => (
  normalizeSeasonKey(seasonKey) === LEAGUE_CENTER_ALL_SEASONS_KEY
    ? 'all'
    : 'season'
)

const getCatalogLeague = leagueId => (
  PLAYERS_DATABASE_LEAGUES_CATALOG.find(item => clean(item.id) === clean(leagueId)) || null
)

const getLeagueIdentity = ({ leagueId, league = {}, catalog = null } = {}) => {
  const identity = object(league?.identity)

  return {
    leagueId: clean(leagueId || league?.leagueId || catalog?.id),
    leagueName: clean(identity.leagueName || catalog?.name),
    region: clean(identity.region || catalog?.region),
    ageGroupId: clean(identity.ageGroupId || catalog?.ageGroupId),
    ageGroupLabel: clean(identity.ageGroupLabel || catalog?.ageGroupLabel),
    level: toNumber(identity.level !== undefined && identity.level !== null
      ? identity.level
      : catalog?.level) || '',
  }
}

export const getLeagueSeasons = league => (
  Object.entries(object(league?.seasonsById))
    .map(([seasonId, season]) => ({
      seasonId: clean(seasonId),
      season: {
        ...object(season),
        seasonId: clean(seasonId),
      },
      target: clean(season?.seasonStatus).toLowerCase() || 'season',
    }))
    .sort((left, right) => clean(right.seasonId).localeCompare(clean(left.seasonId)))
)

const findSelectedSeason = ({ league, selectedSeasonKey }) => {
  const lookupKey = normalizeSeasonKey(selectedSeasonKey)
  const seasons = getLeagueSeasons(league)

  if (!lookupKey || lookupKey === LEAGUE_CENTER_ALL_SEASONS_KEY) return null

  return seasons.find(({ season }) => (
    resolveSeasonLookupKey(season) === lookupKey
  )) || null
}

const getBootstrapSeason = ({ selectedSeasonKey, ageGroupId }) => {
  const lookupKey = normalizeSeasonKey(selectedSeasonKey)
  if (!lookupKey || lookupKey === LEAGUE_CENTER_ALL_SEASONS_KEY) return null

  const catalogSeason = getSeasonCatalogOptions().find(option => (
    normalizeSeasonKey(option.seasonKey) === lookupKey
  ))

  const seasonId = clean(catalogSeason?.seasonId)
  if (!seasonId) return null

  return {
    seasonId,
    target: catalogSeason?.target || 'bootstrap',
    season: {
      seasonId,
      seasonKey: lookupKey,
      seasonStatus: '',
      birthYear: resolveSeasonBirthYear({ seasonKey: lookupKey, ageGroupId }),
      seasonUrl: '',
      tableState: 'NOT_LOADED',
      teamsById: {},
      updatedAt: null,
      bootstrap: true,
    },
  }
}

const getTeamRows = season => Object.entries(object(season?.teamsById)).map(([teamId, team]) => ({
  teamId: clean(teamId),
  ...object(team),
}))

const DOCUMENTATION_STATES = [
  'NO_ROSTER',
  'ROSTER_ONLY',
  'STATS_LOADED',
  'STATS_FINAL',
]

const dateValue = value => {
  if (!value) return 0
  if (typeof value?.toDate === 'function') return value.toDate().getTime()
  if (Number.isFinite(Number(value?.seconds))) return Number(value.seconds) * 1000
  const timestamp = new Date(value).getTime()
  return Number.isFinite(timestamp) ? timestamp : 0
}

const buildDocumentationSummary = teamRows => {
  const counts = DOCUMENTATION_STATES.reduce((result, state) => ({
    ...result,
    [state]: 0,
  }), {})
  let latestUpdatedAt = null
  let latestUpdatedAtValue = 0

  teamRows.forEach(team => {
    const state = clean(team.documentationState).toUpperCase() || 'NO_ROSTER'
    if (counts[state] !== undefined) counts[state] += 1

    const updatedAtValue = dateValue(team.documentationStateUpdatedAt)
    if (updatedAtValue > latestUpdatedAtValue) {
      latestUpdatedAt = team.documentationStateUpdatedAt
      latestUpdatedAtValue = updatedAtValue
    }
  })

  return {
    counts,
    latestUpdatedAt,
  }
}

const coverageStatus = ({ completeCount, targetCount }) => {
  if (!targetCount) return 'full'
  if (completeCount >= targetCount) return 'full'
  if (completeCount > 0) return 'partial'
  return 'missing'
}

const tableStatusFromState = tableState => (
  ['LOADED', 'LOADED_EMPTY'].includes(clean(tableState).toUpperCase())
    ? 'full'
    : 'missing'
)

const buildLeagueCenterRow = ({
  leagueId,
  league,
  catalog,
  selectedSeasonKey,
  seasonEntry = null,
}) => {
  const identity = getLeagueIdentity({ leagueId, league, catalog })
  const selected = seasonEntry || findSelectedSeason({ league, selectedSeasonKey }) || getBootstrapSeason({
    selectedSeasonKey,
    ageGroupId: identity.ageGroupId,
  })
  const season = selected?.season || null
  const teamRows = getTeamRows(season)
  const teamSignalSummary = mergeTeamSignalSummaries(teamRows.map(team => team.teamSignalSummary))
  const teamsCount = teamRows.length
  const documentationSummary = buildDocumentationSummary(teamRows)
  const statsCompleteCount = teamRows.filter(team => (
    ['STATS_LOADED', 'STATS_FINAL'].includes(clean(team.documentationState).toUpperCase())
  )).length
  const investigationCount = teamRows.filter(team => team?.showInvestigationIndicator === true).length
  const signalFamiliesById = countTeamSignalFamilies(teamRows.map(team => team.teamSignalSummary))
  const signalStrengthCounts = countTeamSignalStrengths(teamRows.map(team => team.teamSignalSummary))
  const researchWorkCounts = Object.fromEntries(Object.entries(groupTeamsByResearchWork(teamRows))
    .map(([key, teams]) => [key, teams.length]))
  const strongSignalWorkCounts = Object.fromEntries(Object.entries(groupTeamsByStrongSignalMinimum(teamRows))
    .map(([key, teams]) => [key, teams.length]))
  const tableStatus = tableStatusFromState(season?.tableState)
  const playersStatsStatus = coverageStatus({
    completeCount: statsCompleteCount,
    targetCount: teamsCount,
  })
  const hasSelectedSeason = Boolean(selected && !season?.bootstrap)
  const seasonKey = resolveSeasonLookupKey(season || {}) || normalizeSeasonKey(selectedSeasonKey)
  const teamNames = teamRows.map(team => team.teamId).filter(Boolean)

  return {
    id: identity.leagueId,
    leagueId: identity.leagueId,
    catalogLeagueId: clean(catalog?.id || identity.leagueId),
    name: [identity.ageGroupLabel, identity.leagueName].filter(Boolean).join(' '),
    leagueName: identity.leagueName,
    ageGroup: toAgeGroupLabel(identity.ageGroupId),
    ageGroupId: identity.ageGroupId,
    ageGroupLabel: identity.ageGroupLabel,
    level: identity.level,
    region: identity.region,
    order: toNumber(catalog?.order),
    birthYear: toNumber(season?.birthYear) || '',
    seasonKey: seasonKey || selectedSeasonKey,
    seasonId: clean(selected?.seasonId || season?.seasonId),
    seasonStatus: clean(season?.seasonStatus).toLowerCase(),
    seasonWorkStatus: teamsCount === 0
      ? 'no_teams'
      : clean(season?.seasonStatus).toLowerCase() || 'not_started',
    seasonUrl: clean(season?.seasonUrl),
    tableState: clean(season?.tableState).toUpperCase() || 'NOT_LOADED',
    tableImportedAt: season?.tableImportedAt || null,
    seasonUpdatedAt: season?.updatedAt || null,
    selectedTarget: selected?.target || 'missing',
    teamsCount,
    teamSignalSummary,
    tableStatus,
    playersStatsStatus,
    playersStatsCompleteCount: statsCompleteCount,
    playersStatsTargetCount: teamsCount,
    investigationCount,
    signalFamiliesById,
    signalStrengthCounts,
    researchWorkCounts,
    strongSignalWorkCounts,
    documentationCounts: documentationSummary.counts,
    latestDocumentationUpdatedAt: documentationSummary.latestUpdatedAt,
    requiresReview: teamsCount > 0 && documentationSummary.counts.NO_ROSTER > 0,
    hasTeamSignals: hasActiveTeamSignals(teamSignalSummary),
    dataStatus: tableStatus === 'full' && playersStatsStatus === 'full'
      ? 'full'
      : tableStatus === 'missing'
        ? 'missing'
        : 'partial',
    playersWithProfiles: 0,
    playersCount: 0,
    playersWithScoutProfileCount: 0,
    scoutProfilesCount: 0,
    teamNames,
    teamSearchText: teamNames.join(' '),
    hasLeagueDoc: Boolean(league),
    hasSelectedSeason,
    catalog,
    sourceLeague: league || null,
    sourceSeason: season,
  }
}

export const buildLeagueCenterLeagueDocuments = ({ leaguesCenterDoc = {} } = {}) => {
  const leaguesById = object(leaguesCenterDoc?.leaguesById)
  return Object.entries(leaguesById).map(([leagueId, projection]) => ({
    leagueId: clean(leagueId),
    catalog: getCatalogLeague(leagueId),
    projection: object(projection),
  }))
}

export const buildLeagueCenterRows = ({
  leagueDocs = [],
  selectedSeasonKey = LEAGUE_CENTER_ALL_SEASONS_KEY,
} = {}) => {
  const showAllSeasons = normalizeSeasonKey(selectedSeasonKey) === LEAGUE_CENTER_ALL_SEASONS_KEY

  return leagueDocs.flatMap(item => {
    const leagueId = clean(item?.leagueId)
    const league = item?.projection || null
    const catalog = item?.catalog || getCatalogLeague(leagueId)
    const seasons = getLeagueSeasons(league)

    if (!showAllSeasons) {
      return [buildLeagueCenterRow({
        leagueId,
        league,
        catalog,
        selectedSeasonKey,
      })]
    }

    if (!seasons.length) {
      return [buildLeagueCenterRow({
        leagueId,
        league,
        catalog,
        selectedSeasonKey: LEAGUE_CENTER_CURRENT_SEASON_KEY,
      })]
    }

    return seasons.map(seasonEntry => buildLeagueCenterRow({
      leagueId,
      league,
      catalog,
      selectedSeasonKey: resolveSeasonLookupKey(seasonEntry.season),
      seasonEntry,
    }))
  }).filter(row => row.id)
}
