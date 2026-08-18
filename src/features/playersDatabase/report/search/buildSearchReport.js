// features/playersDatabase/report/search/buildSearchReport.js

import { pickDefinedValue } from '../../model/value.model.js'
import {
  REPORT_ENTITY_TYPES,
  REPORT_TYPES,
} from '../../../reports/publicApi.js'

function formatReportDate(value = new Date()) {
  return new Intl.DateTimeFormat('he-IL').format(value)
}

function createSearchReportId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }

  return `search-${Date.now()}`
}

const clean = value => String(value || '').trim()

const cloneValue = value => {
  if (Array.isArray(value)) return value.map(cloneValue)
  if (!value || typeof value !== 'object') return value

  return Object.entries(value).reduce((result, [key, item]) => {
    if (typeof item !== 'function' && item !== undefined) {
      result[key] = cloneValue(item)
    }
    return result
  }, {})
}

const RESULT_FILTER_LABELS = {
  teamSearch: 'חיפוש קבוצה',
  playerSearch: 'חיפוש שחקן',
  seasons: 'עונות בתצוגה',
  leagues: 'ליגות בתצוגה',
  teams: 'קבוצות בתצוגה',
  profiles: 'פרופילים בתצוגה',
  attackLevels: 'עדיפות התקפית בתצוגה',
  defenseLevels: 'עדיפות הגנתית בתצוגה',
}

const PRIORITY_LEVEL_LABELS = {
  elite: 'יעד מוביל',
  high: 'עדיפות גבוהה',
  positive: 'חיובי',
  neutral: 'רגיל',
  low: 'עדיפות נמוכה',
}

const buildResultFilterItems = (filters = {}) => Object.entries(filters)
  .flatMap(([field, rawValue]) => {
    const values = Array.isArray(rawValue)
      ? rawValue
      : clean(rawValue)
        ? [rawValue]
        : []

    return values.map((value, index) => ({
      id: `${field}-${index}-${clean(value)}`,
      label: RESULT_FILTER_LABELS[field] || field,
      value: field === 'attackLevels' || field === 'defenseLevels'
        ? PRIORITY_LEVEL_LABELS[value] || clean(value)
        : clean(value),
    }))
  })


const CANONICAL_RESULT_FILTER_FIELDS = [
  'teamSearch',
  'playerSearch',
  'seasons',
  'birthYears',
  'leagues',
  'leagueLevels',
  'teams',
  'profiles',
  'attackLevels',
  'defenseLevels',
  'combinedLevels',
  'expectedLevelDirections',
  'favoritesOnly',
]

const normalizeFilterValue = value => {
  if (Array.isArray(value)) {
    const values = [...new Set(value.map(item => clean(item)).filter(Boolean))]
    return values.length ? values : undefined
  }

  if (typeof value === 'boolean') return value ? true : undefined

  const normalized = clean(value)
  return normalized || undefined
}

const buildCanonicalResultFilters = (filters = {}) => (
  CANONICAL_RESULT_FILTER_FIELDS.reduce((result, field) => {
    const value = normalizeFilterValue(filters[field])
    if (value !== undefined) result[field] = value
    return result
  }, {})
)

const normalizeQueryItems = items => (Array.isArray(items) ? items : [])
  .map((item, index) => ({
    id: clean(item?.key || item?.id) || `query-item-${index + 1}`,
    label: clean(item?.label),
  }))
  .filter(item => item.label)

const SCOUT_SNAPSHOT_FIELDS = [
  'targetRate',
  'rankingRate',
  'anomalyRate',
  'qualityRate',
  'scoutPriorityScore',
  'priorityLevel',
  'opportunityType',
]

const compactObject = value => Object.entries(value || {}).reduce(
  (result, [key, item]) => {
    if (item !== undefined && item !== null && item !== '') {
      result[key] = item
    }
    return result
  },
  {}
)

const buildScoutDomainSnapshot = (row = {}, domain = '') => {
  const source = row[domain] || row.calculation?.[domain] || {}

  return compactObject(
    SCOUT_SNAPSHOT_FIELDS.reduce((result, field) => {
      result[field] = source[field]
      return result
    }, {})
  )
}

const buildExpectedLevelSnapshot = (row = {}) => {
  const source = row.expectedLeagueLevelChange ||
    row.calculation?.expectedLeagueLevelChange ||
    null

  if (!source || typeof source !== 'object') return null

  const snapshot = compactObject({
    direction: source.direction,
    levelGap: pickDefinedValue(source.levelGap, source.expectedLevelDelta),
  })

  return Object.keys(snapshot).length ? snapshot : null
}

const buildTeamSnapshotRow = ({
  row = {},
  index = 0,
  visibleDomains = [],
} = {}) => {
  const snapshot = compactObject({
    id: clean(row.id || row.birthTeamId) || `team-${index + 1}`,
    clubId: clean(row.clubId),
    clubLevel: Number(row.clubLevel || 0),
    birthTeamId: clean(row.birthTeamId),
    teamSlot: Number(row.teamSlot || row.birthTeamSlot || 1) || 1,
    teamName: clean(row.teamName || row.playerName) || 'קבוצה ללא שם',
    teamUrl: clean(row.teamUrl),
    favorite: row.favorite === true,
    seasonKey: clean(row.seasonKey),
    birthYear: pickDefinedValue(row.birthYear, ''),
    leagueId: clean(row.leagueId),
    leagueName: clean(row.leagueName),
    leagueLevel: pickDefinedValue(row.leagueLevel, ''),
    ageGroupLabel: clean(row.ageGroupLabel),
    appearances: Number(row.appearances || 0),
    tableRank: Number(row.tableRank || 0),
    tableAttackRank: Number(row.tableAttackRank || 0),
    tableDefenseRank: Number(row.tableDefenseRank || 0),
    goalsFor: Number(row.goalsFor || 0),
    goalsAgainst: Number(row.goalsAgainst || 0),
    expectedLeagueLevelChange: buildExpectedLevelSnapshot(row),
  })

  visibleDomains.forEach(domain => {
    const domainSnapshot = buildScoutDomainSnapshot(row, domain)
    if (Object.keys(domainSnapshot).length) {
      snapshot[domain] = domainSnapshot
    }
  })

  return snapshot
}
const buildPlayerSnapshotRow = (row = {}, index = 0) => ({
  id: clean(row.id || row.playerId) || `player-${index + 1}`,
  playerId: clean(row.playerId),
  playerName: clean(row.playerName) || 'שחקן ללא שם',
  playerUrl: clean(row.playerUrl),
  avatarUrl: clean(row.avatarUrl),
  favorite: row.favorite === true,
  seasonKey: clean(row.seasonKey),
  birthYear: pickDefinedValue(row.birthYear, ''),
  ageGroupLabel: clean(row.ageGroupLabel),
  teamName: clean(row.teamName),
  leagueName: clean(row.leagueName),
  leagueLevel: pickDefinedValue(row.leagueLevel, ''),
  positionLayer: clean(row.positionLayer),
  primaryPosition: clean(row.primaryPosition),
  numShirt: clean(row.numShirt),
  minutes: Number(row.minutes || 0),
  appearances: Number(row.appearances || 0),
  starts: Number(row.starts || 0),
  goals: Number(row.goals || 0),
  primaryProfile: clean(row.primaryProfile),
  scoutProfiles: cloneValue(row.scoutProfiles || []),
  scoutProfileDisplay: cloneValue(row.scoutProfileDisplay || {}),
  score: Number(row.score || 0),
  profileStrength: cloneValue(row.profileStrength || null),
  notes: clean(row.notes),
  metadata: cloneValue(row.metadata || {}),
  calculation: cloneValue(row.calculation || {}),
})

const collectRowFields = rows => {
  const fields = new Set()

  rows.forEach(row => {
    Object.entries(row || {}).forEach(([key, value]) => {
      fields.add(key)

      if (value && typeof value === 'object' && !Array.isArray(value)) {
        Object.keys(value).forEach(childKey => fields.add(`${key}.${childKey}`))
      }
    })
  })

  return fields
}

const collectTeamCapabilities = rows => {
  const fields = collectRowFields(rows)
  const domains = ['offense', 'defense'].filter(domain => (
    rows.some(row => row?.[domain] && Object.keys(row[domain]).length)
  ))

  return {
    schema: 'dbSearchTeams.v1',
    domains,
    supports: {
      localFiltering: true,
      favorites: fields.has('favorite'),
      expectedLevelChange: fields.has('expectedLeagueLevelChange.direction'),
    },
  }
}

const collectPlayerCapabilities = rows => {
  const fields = collectRowFields(rows)

  return {
    schema: 'dbSearchPlayers.v1',
    domains: ['playerStats', 'scoutProfiles'],
    supports: {
      localFiltering: true,
      favorites: fields.has('favorite'),
      scoutProfiles: fields.has('scoutProfiles'),
    },
  }
}

export function buildSearchReport({
  searchReportId = '',
  reportName = '',
  reportPurpose = '',
  reportDescription = '',
  rows = [],
  queryActiveItems = [],
  resultFilters = {},
  summary = {},
  loadedEntityType = '',
} = {}) {
  const entityType = loadedEntityType === 'player'
    ? REPORT_ENTITY_TYPES.PLAYERS_LIST
    : REPORT_ENTITY_TYPES.TEAMS_LIST
  const isPlayersList = entityType === REPORT_ENTITY_TYPES.PLAYERS_LIST
  const reportId = searchReportId || createSearchReportId()
  const normalizedReportName = clean(reportName)
  const normalizedReportPurpose = clean(reportPurpose)
  const normalizedReportDescription = clean(reportDescription)
  const canonicalResultFilters = buildCanonicalResultFilters(resultFilters)
  const visibleDomains = isPlayersList
    ? []
    : ['offense', 'defense']
  const snapshotRows = (Array.isArray(rows) ? rows : []).map((row, index) => (
    isPlayersList
      ? buildPlayerSnapshotRow(row, index)
      : buildTeamSnapshotRow({
        row,
        index,
        visibleDomains,
      })
  ))
  const capabilities = isPlayersList
    ? collectPlayerCapabilities(snapshotRows)
    : collectTeamCapabilities(snapshotRows)

  const seasonsCount = new Set(snapshotRows.map(row => row.seasonKey).filter(Boolean)).size
  const birthYearsCount = new Set(snapshotRows.map(row => row.birthYear).filter(Boolean)).size
  const contextCount = new Set(
    snapshotRows
      .map(row => isPlayersList ? row.teamName : row.leagueName)
      .filter(Boolean)
  ).size

  return {
    sourceKey: `dbSearch:${reportId}`,
    reportType: REPORT_TYPES.DB_SEARCH,
    entityType,
    entityId: reportId,
    reportContent: {
      id: REPORT_TYPES.DB_SEARCH,
      type: REPORT_TYPES.DB_SEARCH,
      mode: REPORT_TYPES.DB_SEARCH,
      documentVersion: 1,
      meta: {
        reportName: normalizedReportName,
        reportPurpose: normalizedReportPurpose,
        reportDescription: normalizedReportDescription,
        title: isPlayersList ? 'צילום חיפוש שחקנים' : 'צילום חיפוש קבוצות',
        subtitle: 'מצב היסטורי של תוצאות החיפוש והנתונים שנשלפו',
        reportDate: formatReportDate(),
        columns: 4,
        items: [
          {
            id: 'results',
            label: isPlayersList ? 'שחקנים בצילום' : 'קבוצות בצילום',
            value: String(snapshotRows.length),
          },
          {
            id: 'seasons',
            label: 'עונות',
            value: String(seasonsCount),
          },
          {
            id: 'birthYears',
            label: 'שנתונים',
            value: String(birthYearsCount),
          },
          {
            id: 'context',
            label: isPlayersList ? 'קבוצות' : 'ליגות',
            value: String(contextCount),
          },
        ],
      },
      entity: {
        type: entityType,
        id: reportId,
        name: isPlayersList ? 'רשימת שחקנים' : 'רשימת קבוצות',
        avatarUrl: '',
      },
      snapshot: {
        capturedAt: new Date().toISOString(),
        sourceResultCount: Number(summary.total || snapshotRows.length),
        displayedResultCount: snapshotRows.length,
      },
      sourceQuery: {
        conditions: normalizeQueryItems(queryActiveItems),
        filters: canonicalResultFilters,
      },
      dataCapabilities: capabilities,
      rows: snapshotRows,
      presentation: {
        defaultSort: isPlayersList
          ? {
            field: 'minutes',
            direction: 'desc',
          }
          : {
            field: 'clubLevel',
            direction: 'asc',
            secondaryField: 'teamName',
            secondaryDirection: 'asc',
          },
        visibleDomains: capabilities.domains,
      },
    },
  }
}
