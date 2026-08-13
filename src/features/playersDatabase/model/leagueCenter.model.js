// src/features/playersDatabase/model/leagueCenter.model.js

import { PLAYERS_DATABASE_AGE_GROUPS_CATALOG } from '../catalog/ageGroups.catalog.js'
import { PLAYERS_DATABASE_LEAGUES_CATALOG } from '../catalog/leagues.catalog.js'
import {
  isSameSeason,
  normalizeSeasonIdentity,
  normalizeSeasonLookupKey,
  resolveSeasonLookupKey,
} from './season.model.js'
import { normalizeTeamStats } from './teamStats.model.js'
import {
  cleanValue,
  toNumberOrZero,
  pickDefinedValue,
} from './value.model.js'
import {
  buildTeamScoutLeagueModel,
  TEAM_SCOUT_NORMALIZATION_MODE,
  TEAM_SCOUT_SORT_MODE,
} from '../../../shared/scouting/teams/index.js'
import { enrichTeamScoutInputRows } from '../domain/adapters/teamScoutInput.adapter.js'

export const LEAGUE_CENTER_ALL_SEASONS_KEY = 'all'
export const LEAGUE_CENTER_DEFAULT_SEASON_KEY = LEAGUE_CENTER_ALL_SEASONS_KEY
const DEFAULT_SEASON_OPTIONS = ['26/27', '25/26', '24/25', '23/24', '22/23']
const LEAGUE_CENTER_CURRENT_SEASON_KEY = DEFAULT_SEASON_OPTIONS[0]

const clean = cleanValue
const toNumber = toNumberOrZero

const toAgeGroupLabel = value => {
  const ageGroupId = clean(value)
  if (!ageGroupId) return ''

  return ageGroupId.toUpperCase()
}

const normalizeSeasonKey = normalizeSeasonLookupKey

const isSameSeasonKey = (left, right) => isSameSeason(
  {
    seasonId: left,
    seasonKey: left,
  },
  {
    seasonId: right,
    seasonKey: right,
  }
)

export const resolveLeagueCenterSeasonTarget = seasonKey =>
  normalizeSeasonKey(seasonKey) === LEAGUE_CENTER_ALL_SEASONS_KEY
    ? 'all'
    :
  normalizeSeasonKey(seasonKey) === '26/27' ? 'current' : 'history'

const getLeagueIds = league => [
  league?.catalogLeagueId,
  league?.leagueId,
  league?.id,
].map(clean).filter(Boolean)

const getCatalogLeague = league => {
  const ids = getLeagueIds(league)

  return PLAYERS_DATABASE_LEAGUES_CATALOG.find(item => ids.includes(item.id)) || null
}

const buildLeagueDocsMap = leagueDocs => {
  const map = new Map()

  leagueDocs.forEach(league => {
    getLeagueIds(league).forEach(id => {
      if (!map.has(id)) {
        map.set(id, league)
      }
    })
  })

  return map
}

const getLeagueSeasons = league => {
  const rows = []

  if (league?.current?.seasonId || league?.current?.seasonKey) {
    rows.push({
      target: 'current',
      season: league.current,
    })
  }

  const history = Array.isArray(league?.history) ? league.history : []
  history.forEach(season => {
    if (season?.seasonId || season?.seasonKey) {
      rows.push({
        target: 'history',
        season,
      })
    }
  })

  return rows
}

const getSelectedSeason = (league, selectedSeasonKey) => {
  const seasons = getLeagueSeasons(league)
  if (!seasons.length) {
    return {
      target: 'missing',
      season: null,
    }
  }

  const selected = seasons.find(row => (
    isSameSeasonKey(row.season?.seasonKey, selectedSeasonKey) ||
    isSameSeasonKey(row.season?.seasonId, selectedSeasonKey)
  ))

  if (selected) return selected

  return {
    target: 'missing',
    season: null,
  }
}

const getTableRows = season =>
  Array.isArray(season?.tableRank)
    ? season.tableRank.filter(row => row && (row.teamId || row.clubId || row.rank))
    : []

const resolveTableRowTeamName = row => clean(
  row?.teamName ||
  row?.name ||
  row?.displayName ||
  row?.clubName
)

const buildTableRowTeamNames = rows => (
  Array.from(new Set(
    rows
      .map(resolveTableRowTeamName)
      .filter(Boolean)
  ))
)

const PRIORITY_TARGET_LEVELS = new Set(['positive', 'high', 'elite'])

const isPlayerStatsComplete = row => (
  Boolean(row?.hasPlayers) && Boolean(row?.statsComplete)
)

const getCoverageStatus = ({ completeCount = 0, targetCount = 0 } = {}) => {
  if (!targetCount) return 'full'
  if (completeCount >= targetCount) return 'full'
  if (completeCount > 0) return 'partial'
  return 'missing'
}

const getTableStatus = rows => (rows.length ? 'full' : 'missing')

const getProfiledPlayersCount = rows => (
  rows.reduce((total, row) => (
    total + toNumber(row?.scoutProfilesSummary?.total)
  ), 0)
)

const buildPriorityCoverage = ({
  tableRows = [],
  leagueLevel,
  leagueNumGames,
} = {}) => {
  if (!tableRows.length) {
    return {
      combined: { completeCount: 0, targetCount: 0, status: 'missing' },
      offense: { completeCount: 0, targetCount: 0, status: 'missing' },
      defense: { completeCount: 0, targetCount: 0, status: 'missing' },
    }
  }

  const result = buildTeamScoutLeagueModel({
    leagueLevel,
    leagueNumGames: leagueNumGames || 30,
    rows: enrichTeamScoutInputRows(tableRows),
    normalizationMode: TEAM_SCOUT_NORMALIZATION_MODE.AUTO,
    sortMode: TEAM_SCOUT_SORT_MODE.TABLE,
  })
  const scoutRows = Array.isArray(result?.rows) ? result.rows : []
  const combinedTargets = new Set()
  let offenseTargetCount = 0
  let offenseCompleteCount = 0
  let defenseTargetCount = 0
  let defenseCompleteCount = 0

  scoutRows.forEach((row, index) => {
    const source = row?.source || {}
    const rowKey = clean(
      source?.birthTeamId ||
      source?.teamId ||
      row?.teamId ||
      source?.clubId ||
      `${source?.rank || row?.position || index}`
    )
    const complete = isPlayerStatsComplete(source)
    const offenseTarget = PRIORITY_TARGET_LEVELS.has(clean(row?.offense?.priorityLevel))
    const defenseTarget = PRIORITY_TARGET_LEVELS.has(clean(row?.defense?.priorityLevel))

    if (offenseTarget) {
      offenseTargetCount += 1
      if (complete) offenseCompleteCount += 1
      if (rowKey) combinedTargets.add(rowKey)
    }

    if (defenseTarget) {
      defenseTargetCount += 1
      if (complete) defenseCompleteCount += 1
      if (rowKey) combinedTargets.add(rowKey)
    }
  })

  const combinedTargetCount = combinedTargets.size
  const completeTargetKeys = new Set(
    tableRows
      .filter(isPlayerStatsComplete)
      .map((row, index) => clean(
        row?.birthTeamId ||
        row?.teamId ||
        row?.clubId ||
        `${row?.rank || index}`
      ))
      .filter(Boolean)
  )
  const combinedCompleteCount = Array.from(combinedTargets).filter(
    key => completeTargetKeys.has(key)
  ).length

  return {
    combined: {
      completeCount: combinedCompleteCount,
      targetCount: combinedTargetCount,
      status: getCoverageStatus({
        completeCount: combinedCompleteCount,
        targetCount: combinedTargetCount,
      }),
    },
    offense: {
      completeCount: offenseCompleteCount,
      targetCount: offenseTargetCount,
      status: getCoverageStatus({
        completeCount: offenseCompleteCount,
        targetCount: offenseTargetCount,
      }),
    },
    defense: {
      completeCount: defenseCompleteCount,
      targetCount: defenseTargetCount,
      status: getCoverageStatus({
        completeCount: defenseCompleteCount,
        targetCount: defenseTargetCount,
      }),
    },
  }
}

const buildLeagueName = ({ league, catalog }) => {
  const ageLabel = clean(league?.ageGroupLabel || catalog?.ageGroupLabel)
  const name = clean(league?.name || league?.leagueName || catalog?.name)

  return [ageLabel, name].filter(Boolean).join(' ')
}

const buildCleanLeagueName = ({ league, catalog }) =>
  clean(league?.name || league?.leagueName || catalog?.name)

const buildLeagueCenterRow = ({
  league,
  catalog,
  hasLeagueDoc,
  selectedSeasonKey,
}) => {
  const { target, season } = getSelectedSeason(league, selectedSeasonKey)
  const tableRows = getTableRows(season)
  const tableRankCount = toNumber(season?.tableRankCount)
  const expectedTeamsCount = toNumber(
    league?.clubsCount ||
    league?.teamsCount ||
    season?.clubsCount ||
    season?.teamsCount ||
    season?.tableRankCount
  )
  const teamsCount = expectedTeamsCount || tableRows.length
  const leagueLevel = toNumber(
    league?.level !== undefined && league?.level !== null
      ? league.level
      : catalog?.level
  ) || ''
  const priorityCoverage = buildPriorityCoverage({
    tableRows,
    leagueLevel,
    leagueNumGames: toNumber(season?.leagueTotalRound),
  })
  const tableStatus = getTableStatus(tableRows)
  const ageGroupId = clean(league?.ageGroupId || catalog?.ageGroupId)
  const birthYear = toNumber(season?.birthYear)
  const seasonIdentity = normalizeSeasonIdentity({ season: season || {} })
  const playersCount = toNumber(season?.playersCount)
  const playersWithScoutProfileCount = toNumber(season?.playersWithScoutProfileCount)
  const scoutProfilesCount = toNumber(season?.scoutProfilesCount)
  const teamNames = buildTableRowTeamNames(tableRows)

  return {
    id: clean(league?.id || league?.leagueId || catalog?.id),
    leagueId: clean(league?.leagueId || league?.id || catalog?.id),
    catalogLeagueId: clean(catalog?.id || league?.catalogLeagueId),
    name: buildLeagueName({
      league,
      catalog,
    }),
    leagueName: buildCleanLeagueName({
      league,
      catalog,
    }),
    ageGroup: toAgeGroupLabel(ageGroupId),
    ageGroupId,
    ageGroupLabel: clean(league?.ageGroupLabel || catalog?.ageGroupLabel),
    level: leagueLevel,
    region: clean(league?.region || catalog?.region),
    order: toNumber(catalog?.order),
    birthYear: birthYear || '',
    seasonKey: resolveSeasonLookupKey(seasonIdentity) || selectedSeasonKey,
    seasonId: seasonIdentity.seasonId,
    selectedTarget: target,
    teamsCount,
    tableStatus,
    playersStatsStatus: priorityCoverage.combined.status,
    playersStatsCompleteCount: priorityCoverage.combined.completeCount,
    playersStatsTargetCount: priorityCoverage.combined.targetCount,
    offensePriorityStatus: priorityCoverage.offense.status,
    offensePriorityCompleteCount: priorityCoverage.offense.completeCount,
    offensePriorityTargetCount: priorityCoverage.offense.targetCount,
    defensePriorityStatus: priorityCoverage.defense.status,
    defensePriorityCompleteCount: priorityCoverage.defense.completeCount,
    defensePriorityTargetCount: priorityCoverage.defense.targetCount,
    dataStatus: (() => {
      const statuses = [
        tableStatus,
        priorityCoverage.combined.status,
        priorityCoverage.offense.status,
        priorityCoverage.defense.status,
      ]

      if (statuses.every(status => status === 'full')) return 'full'
      if (tableStatus === 'missing') return 'missing'
      return 'partial'
    })(),
    playersWithProfiles: tableRows.length
      ? getProfiledPlayersCount(tableRows)
      : playersWithScoutProfileCount,
    teamNames,
    teamSearchText: teamNames.join(' '),
    hasLeagueDoc,
    hasSelectedSeason: Boolean(season),
    catalog,
    sourceLeague: league,
  }
}

const buildMasterLeagueSeasonRows = league => {
  const seasons = Array.isArray(league?.seasons) ? league.seasons : []
  const currentSeason =
    seasons.find(season => clean(season?.currentDocRef)) ||
    seasons.find(season => normalizeSeasonKey(season?.seasonKey) === LEAGUE_CENTER_CURRENT_SEASON_KEY) ||
    seasons[0] ||
    null

  return {
    current: currentSeason ? { ...currentSeason } : null,
    history: seasons.filter(season => season !== currentSeason).map(season => ({ ...season })),
  }
}

const buildMasterLeagueDoc = league => {
  const leagueDocumentId = clean(league?.leagueDocumentId || league?.leagueId)
  const leagueId = clean(league?.leagueId || leagueDocumentId)
  const { current, history } = buildMasterLeagueSeasonRows(league)

  return {
    id: leagueDocumentId || leagueId,
    leagueId: leagueDocumentId || leagueId,
    catalogLeagueId: leagueId,
    leagueDocumentId,
    name: clean(league?.leagueName || league?.name),
    leagueName: clean(league?.leagueName || league?.name),
    ageGroupId: clean(league?.ageGroupId),
    ageGroupLabel: clean(league?.ageGroupLabel),
    region: clean(league?.region),
    level: pickDefinedValue(league?.level, null),
    current,
    history,
    hasLeagueDoc: Boolean(leagueDocumentId),
  }
}

export const buildLeagueCenterLeagueDocsFromMasterDocument = ({
  leaguesMasterDoc = {},
} = {}) => (
  Array.isArray(leaguesMasterDoc?.leagues)
    ? leaguesMasterDoc.leagues.map(buildMasterLeagueDoc)
    : []
)

export const buildLeagueCenterLeagueDocuments = ({
  leaguesMasterDoc = {},
  leagueDocuments = [],
} = {}) => {
  const masterDocs = buildLeagueCenterLeagueDocsFromMasterDocument({
    leaguesMasterDoc,
  })
  const liveDocs = Array.isArray(leagueDocuments)
    ? leagueDocuments.filter(Boolean)
    : []
  const liveMap = buildLeagueDocsMap(liveDocs)

  const mergedDocs = masterDocs.map(masterDoc => {
    const liveDoc = getLeagueIds(masterDoc)
      .map(id => liveMap.get(id))
      .find(Boolean)

    if (!liveDoc) return masterDoc

    return {
      ...masterDoc,
      ...liveDoc,
      id: clean(liveDoc.id || masterDoc.id),
      leagueId: clean(liveDoc.leagueId || liveDoc.id || masterDoc.leagueId),
      catalogLeagueId: clean(masterDoc.catalogLeagueId || liveDoc.catalogLeagueId),
      hasLeagueDoc: true,
    }
  })

  const mergedIds = new Set(
    mergedDocs.flatMap(getLeagueIds)
  )
  const extraLiveDocs = liveDocs.filter(league => (
    !getLeagueIds(league).some(id => mergedIds.has(id))
  ))

  return [...mergedDocs, ...extraLiveDocs]
}

export const buildLeagueCenterRowsFromMasterDocument = ({
  leaguesMasterDoc = {},
  selectedSeasonKey,
} = {}) => {
  return buildLeagueCenterRows({
    leagueDocs: buildLeagueCenterLeagueDocsFromMasterDocument({ leaguesMasterDoc }),
    selectedSeasonKey,
  })
}

export const buildLeagueCenterRowsFromIndex = ({
  leagueIndexDoc = {},
} = {}) => {
  if (Array.isArray(leagueIndexDoc?.rows) && leagueIndexDoc.rows.length) {
    return leagueIndexDoc.rows.filter(row => row && row.id)
  }

  return buildLeagueCenterRows({
    leagueDocs: [],
  })
}

export const buildLeagueCenterRows = ({
  leagueDocs,
  selectedSeasonKey,
}) => {
  const leagueDocsMap = buildLeagueDocsMap(leagueDocs)
  const catalogIds = new Set(PLAYERS_DATABASE_LEAGUES_CATALOG.map(item => item.id))
  const shouldShowAllSeasons = normalizeSeasonKey(selectedSeasonKey) === LEAGUE_CENTER_ALL_SEASONS_KEY

  const buildRowsForLeague = ({ league, catalog, hasLeagueDoc }) => {
    if (!shouldShowAllSeasons) {
      return [buildLeagueCenterRow({
        league,
        catalog,
        hasLeagueDoc,
        selectedSeasonKey,
      })]
    }

    const seasons = getLeagueSeasons(league)
    if (!seasons.length) {
      return [buildLeagueCenterRow({
        league,
        catalog,
        hasLeagueDoc,
        selectedSeasonKey: '',
      })]
    }

    return seasons.map(({ season }) => (
      buildLeagueCenterRow({
        league,
        catalog,
        hasLeagueDoc,
        selectedSeasonKey: resolveSeasonLookupKey(season),
      })
    ))
  }

  const catalogRows = PLAYERS_DATABASE_LEAGUES_CATALOG.flatMap(catalog => {
    const league = leagueDocsMap.get(catalog.id) || catalog

    return buildRowsForLeague({
      league,
      catalog,
      hasLeagueDoc: pickDefinedValue(league?.hasLeagueDoc, league !== catalog),
    })
  })

  const extraRows = leagueDocs
    .filter(league => !getLeagueIds(league).some(id => catalogIds.has(id)))
    .flatMap(league => (
      buildRowsForLeague({
        league,
        catalog: getCatalogLeague(league),
        hasLeagueDoc: pickDefinedValue(league?.hasLeagueDoc, true),
      })
    ))

  return [...catalogRows, ...extraRows].filter(row => row.id)
}

export const buildLeagueCenterSeasonOptions = leagueDocs => {
  const keys = new Set([LEAGUE_CENTER_ALL_SEASONS_KEY, ...DEFAULT_SEASON_OPTIONS])

  leagueDocs.forEach(league => {
    getLeagueSeasons(league).forEach(({ season }) => {
      const key = resolveSeasonLookupKey(season)
      if (key) keys.add(key)
    })
  })

  return Array.from(keys)
}

export const buildLeagueCenterBirthYearOptions = rows => {
  const years = rows
    .map(row => toNumber(row.birthYear))
    .filter(Boolean)
    .sort((a, b) => b - a)

  return Array.from(new Set(years))
}

export const buildLeagueCenterBirthYearOptionsFromMasterDocument = ({
  leaguesMasterDoc = {},
} = {}) => {
  const years = (Array.isArray(leaguesMasterDoc?.leagues) ? leaguesMasterDoc.leagues : [])
    .flatMap(league => getLeagueSeasons(buildMasterLeagueDoc(league)))
    .map(({ season }) => toNumber(season?.birthYear))
    .filter(Boolean)
    .sort((a, b) => b - a)

  return Array.from(new Set(years))
}

export const buildLeagueCenterAgeGroupOptions = rows => {
  const map = new Map()

  PLAYERS_DATABASE_AGE_GROUPS_CATALOG.forEach(ageGroup => {
    const value = clean(ageGroup.id)
    const label = clean(ageGroup.label)
    if (!value || !label) return

    map.set(value, {
      value,
      label,
    })
  })

  rows.forEach(row => {
    const label = clean(row.ageGroupLabel)
    const value = clean(row.ageGroupId || label)

    if (!value || map.has(value)) return

    map.set(value, {
      value,
      label: label || value,
    })
  })

  return Array.from(map.values())
}

export const buildLeagueCenterLevelOptions = rows => (
  Array.from(new Set(
    rows
      .map(row => toNumber(row.level))
      .filter(Boolean)
  ))
    .sort((left, right) => left - right)
    .map(level => ({
      value: String(level),
      label: `רמה ${level}`,
    }))
)

export const buildLeagueCenterLeagueOptions = rows => {
  const map = new Map()

  PLAYERS_DATABASE_LEAGUES_CATALOG.forEach(league => {
    const label = clean(league.name || league.leagueName)
    if (!label || map.has(label)) return

    map.set(label, {
      value: label,
      label,
    })
  })

  rows.forEach(row => {
    const label = clean(row.leagueName)
    if (!label || map.has(label)) return

    map.set(label, {
      value: label,
      label,
    })
  })

  return Array.from(map.values())
}

export const buildLeagueCenterSummary = rows => ({
  totalLeagues: rows.length,
  openedLeagues: rows.filter(row => row.hasLeagueDoc).length,
  unopenedCatalogLeagues: rows.filter(row => (
    row.catalogLeagueId && !row.hasLeagueDoc
  )).length,
  fullData: rows.filter(row => row.dataStatus === 'full').length,
  partialData: rows.filter(row => row.dataStatus === 'partial').length,
  missingData: rows.filter(row => row.dataStatus === 'missing').length,
  fullTables: rows.filter(row => row.tableStatus === 'full').length,
  missingTables: rows.filter(row => row.tableStatus !== 'full').length,
  partialTeams: rows.filter(row => row.playersStatsStatus !== 'full').length,
  partialStats: rows.filter(row => row.playersStatsStatus !== 'full').length,
  profiledPlayers: rows.reduce(
    (sum, row) => sum + toNumber(row.playersWithProfiles),
    0
  ),
  catalogLeagues: PLAYERS_DATABASE_LEAGUES_CATALOG.length,
})
