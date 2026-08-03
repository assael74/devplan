import { devPlanColors } from '../../../../ui/core/theme/Colors.js'
// src/features/reports/dbSearch/presentation/buildDbSearchViewModel.js

import { buildDbSearchPlayerColumns } from './dbSearchPlayers.columns.js'
import { buildDbSearchTeamColumns } from './dbSearchTeams.columns.js'

const unique = values => [
  ...new Set(
    values.filter(
      value => value !== '' && value !== null && value !== undefined
    )
  ),
]

const hasField = (availableFields, field) => availableFields.includes(field)

const collectAvailableFields = rows => {
  const fields = new Set()

  rows.forEach(row => {
    Object.entries(row || {}).forEach(([key, value]) => {
      fields.add(key)

      if (value && typeof value === 'object' && !Array.isArray(value)) {
        Object.keys(value).forEach(childKey => fields.add(`${key}.${childKey}`))
      }
    })
  })

  return [...fields]
}

const normalizeMetaText = value => String(value || '').trim()

const splitQueryLabel = rawLabel => {
  const label = normalizeMetaText(rawLabel)
  if (!label) return null

  const colonIndex = label.indexOf(':')
  if (colonIndex > 0) {
    return {
      label: normalizeMetaText(label.slice(0, colonIndex)),
      value: normalizeMetaText(label.slice(colonIndex + 1)),
    }
  }

  const knownPrefixes = [
    ['עונה ', 'עונה'],
    ['שנתון ', 'שנתון'],
    ['רמת ליגה ', 'רמת ליגה'],
  ]

  const prefixMatch = knownPrefixes.find(([prefix]) => label.startsWith(prefix))
  if (prefixMatch) {
    return {
      label: prefixMatch[1],
      value: normalizeMetaText(label.slice(prefixMatch[0].length)),
    }
  }

  if (label === 'קבוצה' || label === 'שחקן') {
    return {
      label: 'סוג חיפוש',
      value: label,
    }
  }

  return {
    label: 'תנאי חיפוש',
    value: label,
  }
}


const mergeMetaItems = (...collections) => {
  const seen = new Set()

  return collections
    .flat()
    .filter(item => {
      const label = normalizeMetaText(item?.label)
      const value = normalizeMetaText(item?.value)
      if (!label || !value) return false

      const key = `${label}:${value}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
    .map((item, index) => ({
      ...item,
      id: item?.id || `report-meta-${index + 1}`,
    }))
}

const buildQueryMetaItems = ({ queryItems = [], resultItems = [] } = {}) => {
  const groups = new Map()

  const append = ({ label, value }) => {
    const normalizedLabel = normalizeMetaText(label)
    const normalizedValue = normalizeMetaText(value)
    if (!normalizedLabel || !normalizedValue) return

    const values = groups.get(normalizedLabel) || []
    if (!values.includes(normalizedValue)) values.push(normalizedValue)
    groups.set(normalizedLabel, values)
  }

  queryItems.forEach(item => {
    const parsed = splitQueryLabel(item?.label)
    if (parsed) append(parsed)
  })

  resultItems.forEach(item => append({
    label: item?.label,
    value: item?.value,
  }))

  return [...groups.entries()].map(([label, values], index) => ({
    id: `query-meta-${index + 1}`,
    label,
    value: values.join(' · '),
  }))
}


const normalizePriorityMetaLabel = label => {
  const text = normalizeMetaText(label)

  if (text.includes('משולב')) return 'עדיפות משולבת'
  if (text.includes('התקפ')) return 'עדיפות התקפית'
  if (text.includes('הגנת')) return 'עדיפות הגנתית'

  return ''
}

const buildTeamSearchMetaItems = ({ rows = [], queryMetaItems = [] } = {}) => {
  const items = [
    {
      id: 'search-entity',
      label: 'ישות חיפוש',
      value: 'קבוצות',
    },
  ]

  const seasons = unique(rows.map(row => row.seasonKey))
  if (seasons.length) {
    items.push({
      id: 'search-seasons',
      label: seasons.length > 1 ? 'עונות' : 'עונה',
      value: seasons.join(', '),
    })
  }

  const birthYears = unique(rows.map(row => row.birthYear))
    .sort((first, second) => Number(first) - Number(second))
  if (birthYears.length) {
    items.push({
      id: 'search-birth-years',
      label: birthYears.length > 1 ? 'שנתונים' : 'שנתון',
      value: birthYears.join(', '),
    })
  }

  const priorityGroups = new Map()

  queryMetaItems.forEach(item => {
    const priorityLabel = normalizePriorityMetaLabel(item?.label)
    if (!priorityLabel) return

    const values = priorityGroups.get(priorityLabel) || []
    normalizeMetaText(item?.value)
      .split(/[·,]/)
      .map(value => normalizeMetaText(value))
      .filter(Boolean)
      .forEach(value => {
        if (!values.includes(value)) values.push(value)
      })

    priorityGroups.set(priorityLabel, values)
  })

  ;['עדיפות התקפית', 'עדיפות הגנתית', 'עדיפות משולבת'].forEach(label => {
    const values = priorityGroups.get(label) || []
    if (!values.length) return

    items.push({
      id: `search-priority-${items.length + 1}`,
      label,
      value: values.join(', '),
    })
  })

  return items
}

export function buildDbSearchViewModel(document = {}) {
  const meta = document.meta || {}
  const entity = document.entity || {}
  const reportName = String(meta.reportName || '').trim()
  const reportTypeLabel = String(meta.title || '').trim()
  const reportPurpose = String(meta.reportPurpose || '').trim()
  const reportDescription = String(meta.reportDescription || '').trim()
  const rows = Array.isArray(document.rows) ? document.rows : []
  const capabilities = document.dataCapabilities || {}
  const sourceQuery = document.sourceQuery || {}
  const sourceQueryItems = Array.isArray(sourceQuery.conditions)
    ? sourceQuery.conditions
    : Array.isArray(sourceQuery.queryItems)
      ? sourceQuery.queryItems
      : []
  const sourceFilters = sourceQuery.filters && typeof sourceQuery.filters === 'object'
    ? sourceQuery.filters
    : sourceQuery.resultFilters && typeof sourceQuery.resultFilters === 'object'
      ? sourceQuery.resultFilters
      : {}
  const sourceResultItems = Array.isArray(sourceQuery.resultItems)
    ? sourceQuery.resultItems
    : Object.entries(sourceFilters).flatMap(([field, rawValue]) => {
      const values = Array.isArray(rawValue) ? rawValue : [rawValue]
      const labels = {
        teamSearch: 'חיפוש קבוצה',
        playerSearch: 'חיפוש שחקן',
        seasons: 'עונות',
        birthYears: 'שנתונים',
        leagues: 'ליגות',
        leagueLevels: 'רמות ליגה',
        teams: 'קבוצות',
        profiles: 'פרופילים',
        attackLevels: 'עדיפות התקפית',
        defenseLevels: 'עדיפות הגנתית',
        combinedLevels: 'עדיפות משולבת',
        expectedLevelDirections: 'שינוי רמה צפוי',
        favoritesOnly: 'מועדפים בלבד',
      }

      return values
        .filter(value => value !== '' && value !== null && value !== undefined && value !== false)
        .map((value, index) => ({
          id: `${field}-${index}`,
          label: labels[field] || field,
          value: value === true ? 'כן' : String(value),
        }))
    })
  const summaryMetaItems = Array.isArray(meta.items) ? meta.items : []
  const queryMetaItems = buildQueryMetaItems({
    queryItems: sourceQueryItems,
    resultItems: sourceResultItems,
  })
  const availableDomains = Array.isArray(capabilities.domains)
    ? capabilities.domains
    : Array.isArray(capabilities.availableDomains)
      ? capabilities.availableDomains
      : ['offense', 'defense'].filter(domain => rows.some(row => row?.[domain]))
  const availableFields = Array.isArray(capabilities.availableFields) && capabilities.availableFields.length
    ? capabilities.availableFields
    : collectAvailableFields(rows)
  const entityType = entity.type || document.entityType || ''
  const isPlayersList = entityType === 'playersList'

  const filterCapabilities = isPlayersList
    ? {
      search: hasField(availableFields, 'playerName'),
      season: hasField(availableFields, 'seasonKey'),
      birthYear: hasField(availableFields, 'birthYear'),
      team: hasField(availableFields, 'teamName'),
      league: hasField(availableFields, 'leagueName'),
      leagueLevel: hasField(availableFields, 'leagueLevel'),
      profile: hasField(availableFields, 'primaryProfile'),
      favorites: hasField(availableFields, 'favorite'),
    }
    : {
      search: hasField(availableFields, 'teamName'),
      clubLevel: hasField(availableFields, 'clubLevel'),
      season: hasField(availableFields, 'seasonKey'),
      birthYear: hasField(availableFields, 'birthYear'),
      league: hasField(availableFields, 'leagueName'),
      leagueLevel: hasField(availableFields, 'leagueLevel'),
      favorites: hasField(availableFields, 'favorite'),
      expectedLevelChange: hasField(
        availableFields,
        'expectedLeagueLevelChange.direction'
      ),
    }

  return {
    ...document,
    entityId: entity.id || document.entityId || '',
    entityType,
    entity: {
      ...entity,
      type: entityType === 'playersList' ? 'players' : 'teams',
    },
    status: document.status || 'active',
    colors: { ...devPlanColors },
    title: reportName || reportTypeLabel || (isPlayersList ? 'צילום חיפוש שחקנים' : 'צילום חיפוש קבוצות'),
    reportName,
    reportTypeLabel,
    reportPurpose,
    reportDescription,
    subtitle: reportName
      ? [reportTypeLabel, meta.subtitle].filter(Boolean).join(' · ')
      : meta.subtitle || '',
    reportDate: meta.reportDate || document.snapshot?.capturedAt || '',
    metaItems: isPlayersList
      ? mergeMetaItems(queryMetaItems, summaryMetaItems)
      : buildTeamSearchMetaItems({ rows, queryMetaItems }),
    queryMetaItems,
    summaryMetaItems,
    sourceQueryItems,
    sourceResultItems,
    rows,
    totalRows: rows.length,
    hasContent: rows.length > 0,
    availableDomains,
    availableFields,
    filterCapabilities,
    columns: isPlayersList
      ? buildDbSearchPlayerColumns({ availableFields })
      : buildDbSearchTeamColumns({ availableDomains, availableFields }),
    defaultSort: isPlayersList
      ? document.presentation?.defaultSort || { field: 'minutes', direction: 'desc' }
      : { field: 'clubLevel', direction: 'asc', secondaryField: 'teamName', secondaryDirection: 'asc' },
    filterOptions: {
      clubLevels: filterCapabilities.clubLevel
        ? unique(rows.map(row => row.clubLevel)).sort(
          (a, b) => Number(a) - Number(b)
        )
        : [],
      seasons: filterCapabilities.season
        ? unique(rows.map(row => row.seasonKey))
        : [],
      birthYears: filterCapabilities.birthYear
        ? unique(rows.map(row => row.birthYear)).sort(
          (a, b) => Number(b) - Number(a)
        )
        : [],
      teams: filterCapabilities.team
        ? unique(rows.map(row => row.teamName)).sort((a, b) =>
          String(a).localeCompare(String(b), 'he')
        )
        : [],
      leagues: filterCapabilities.league
        ? unique(rows.map(row => row.leagueName)).sort((a, b) =>
          String(a).localeCompare(String(b), 'he')
        )
        : [],
      leagueLevels: filterCapabilities.leagueLevel
        ? unique(rows.map(row => row.leagueLevel)).sort(
          (a, b) => Number(a) - Number(b)
        )
        : [],
      profiles: filterCapabilities.profile
        ? unique(rows.map(row => row.primaryProfile)).sort((a, b) =>
          String(a).localeCompare(String(b), 'he')
        )
        : [],
      expectedLevelChanges: filterCapabilities.expectedLevelChange
        ? unique(
          rows
            .map(row => row.expectedLeagueLevelChange?.direction)
            .filter(direction => [
              'promotion',
              'unchanged',
              'relegation',
            ].includes(direction))
        )
        : [],
    },
  }
}
