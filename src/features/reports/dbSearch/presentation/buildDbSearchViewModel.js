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

export function buildDbSearchViewModel(document = {}) {
  const meta = document.meta || {}
  const entity = document.entity || {}
  const reportName = String(meta.reportName || '').trim()
  const reportTypeLabel = String(meta.title || '').trim()
  const rows = Array.isArray(document.rows) ? document.rows : []
  const capabilities = document.dataCapabilities || {}
  const sourceQuery = document.sourceQuery || {}
  const availableDomains = Array.isArray(capabilities.availableDomains)
    ? capabilities.availableDomains
    : []
  const availableFields = Array.isArray(capabilities.availableFields)
    ? capabilities.availableFields
    : []
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
    title: reportName || reportTypeLabel || (isPlayersList ? 'צילום חיפוש שחקנים' : 'צילום חיפוש קבוצות'),
    reportName,
    reportTypeLabel,
    subtitle: reportName
      ? [reportTypeLabel, meta.subtitle].filter(Boolean).join(' · ')
      : meta.subtitle || '',
    reportDate: meta.reportDate || document.snapshot?.capturedAt || '',
    metaItems: Array.isArray(meta.items) ? meta.items : [],
    sourceQueryItems: Array.isArray(sourceQuery.queryItems)
      ? sourceQuery.queryItems
      : [],
    sourceResultItems: Array.isArray(sourceQuery.resultItems)
      ? sourceQuery.resultItems
      : [],
    rows,
    totalRows: rows.length,
    hasContent: rows.length > 0,
    availableDomains,
    availableFields,
    filterCapabilities,
    columns: isPlayersList
      ? buildDbSearchPlayerColumns({ availableFields })
      : buildDbSearchTeamColumns({ availableDomains, availableFields }),
    defaultSort: document.presentation?.defaultSort || (
      isPlayersList
        ? { field: 'minutes', direction: 'desc' }
        : { field: 'tableRank', direction: 'asc' }
    ),
    filterOptions: {
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
          rows.map(row => row.expectedLeagueLevelChange?.direction)
        )
        : [],
    },
  }
}
