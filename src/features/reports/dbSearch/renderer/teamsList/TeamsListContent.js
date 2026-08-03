// src/features/reports/dbSearch/renderer/teamsList/TeamsListContent.js

import React from 'react'
import {
  Box,
  Checkbox,
  Chip,
  Input,
  Option,
  Select,
  Sheet,
  Table,
  Typography,
} from '@mui/joy'

import ScoutPriority from '../../../../../ui/patterns/scout/ScoutPriority.js'
import ExpectedLevelDeltaChip from '../../../../../ui/patterns/status/ExpectedLevelDeltaChip.js'
import LeagueName from '../components/LeagueName.js'
import TeamName from '../components/TeamName.js'
import { teamsListSx as sx } from './teamsList.sx.js'

const EXPECTED_LEVEL_LABELS = {
  relegation: 'ירידה צפויה',
  unchanged: 'ללא שינוי',
  promotion: 'עלייה צפויה',
}

const clean = value => String(value || '').trim()

function formatRate(value) {
  return Number.isFinite(Number(value))
    ? `${Math.round(Number(value))}%`
    : '—'
}

function formatScore(value) {
  return Number.isFinite(Number(value))
    ? Math.round(Number(value))
    : '—'
}

function FilterSelect({ label, value, options = [], onChange }) {
  if (!options.length) return null

  return (
    <Select
      size='sm'
      placeholder={label}
      value={value || null}
      onChange={(_, nextValue) => onChange(nextValue || '')}
      sx={sx.filterControl}
    >
      <Option value=''>הכול</Option>
      {options.map(option => (
        <Option key={String(option)} value={String(option)}>
          {label === 'שינוי רמה'
            ? EXPECTED_LEVEL_LABELS[option] || option
            : String(option)}
        </Option>
      ))}
    </Select>
  )
}

function resolvePath(row, path) {
  return path
    .split('.')
    .reduce((value, key) => value?.[key], row)
}

function resolveColumnValue(row, column = {}) {
  return column.field ? resolvePath(row, column.field) : undefined
}

function normalizeSortValue(value) {
  if (value === null || value === undefined || value === '') return 0
  return value
}

function resolveTeamSlot(row = {}) {
  const directSlot = Number(row.teamSlot || row.birthTeamSlot)
  if (Number.isFinite(directSlot) && directSlot > 0) return directSlot

  const match = clean(row.teamName).match(/\s([2-3])$/)
  return match ? Number(match[1]) : 1
}

function renderCell(row, column) {
  if (column.kind === 'team') {
    return (
      <Box sx={sx.teamCell}>
        <TeamName
          value={row.teamName}
          slot={resolveTeamSlot(row)}
          fontSize={13}
          nameSx={{ fontWeight: 650 }}
        />
        {row.favorite ? (
          <Chip size='sm' variant='soft'>מועדף</Chip>
        ) : null}
      </Box>
    )
  }

  if (column.kind === 'rate') {
    return formatRate(resolveColumnValue(row, column))
  }

  if (column.kind === 'clubLevel') {
    const clubLevel = Number(resolveColumnValue(row, column))

    if (!Number.isFinite(clubLevel) || clubLevel <= 0) return 'ג€”'

    return (
      <Box
        component='span'
        title={`רמת מועדון ${clubLevel}`}
        sx={sx.clubLevelChip}
      >
        {`C${clubLevel}`}
      </Box>
    )
  }

  if (column.kind === 'league') {
    return (
      <Box sx={sx.leagueCell}>
        <LeagueName
          value={row.leagueName}
          level={row.leagueLevel}
          showLevel={column.showLevel}
          fontSize={12}
        />
      </Box>
    )
  }

  if (column.kind === 'scoutPriority') {
    const performance = row[column.domain] || {}
    const value = performance.priorityLevel

    if (!value) return null

    return (
      <ScoutPriority
        value={value}
        short
        fontSize={11}
        tooltip={`${column.label}: ${formatScore(performance.scoutPriorityScore)}`}
      />
    )
  }

  if (column.kind === 'expectedLevelChange') {
    return (
      <ExpectedLevelDeltaChip
        direction={row.expectedLeagueLevelChange?.direction}
        iconOnly
      />
    )
  }

  const value = resolveColumnValue(row, column)
  return value === 0 ? 0 : value || '—'
}

function resolveCellTitle(row, column) {
  if (column.kind === 'team') return row.teamName || ''
  if (column.kind === 'league') return [
    row.leagueName,
    row.leagueLevel ? `רמה ${row.leagueLevel}` : '',
  ].filter(Boolean).join(' · ')
  if (column.kind === 'clubLevel') {
    return row.clubLevel ? `רמת מועדון ${row.clubLevel}` : ''
  }
  if (column.kind === 'scoutPriority' || column.kind === 'expectedLevelChange') return undefined

  const value = renderCell(row, column)
  return typeof value === 'string' || typeof value === 'number'
    ? String(value)
    : undefined
}

export default function TeamsListContent({
  model = {},
  presentation = 'url',
  device = 'desktop',
}) {
  const options = model.filterOptions || {}
  const capabilities = model.filterCapabilities || {}
  const isPdf = presentation === 'pdf'
  const [filters, setFilters] = React.useState({
    search: '',
    clubLevel: '',
    season: '',
    birthYear: '',
    league: '',
    leagueLevel: '',
    expectedLevelChange: '',
    favoritesOnly: false,
  })
  const [sort, setSort] = React.useState(model.defaultSort || {
    field: 'teamName',
    direction: 'asc',
  })

  React.useEffect(() => {
    setFilters({
      search: '',
      clubLevel: '',
      season: '',
      birthYear: '',
      league: '',
      leagueLevel: '',
      expectedLevelChange: '',
      favoritesOnly: false,
    })
    setSort(model.defaultSort || {
      field: 'teamName',
      direction: 'asc',
    })
  }, [model.entityId, model.snapshot?.capturedAt])

  const updateFilter = React.useCallback((field, value) => {
    setFilters(current => ({
      ...current,
      [field]: value,
    }))
  }, [])

  const rows = React.useMemo(() => {
    const filtered = (Array.isArray(model.rows) ? model.rows : []).filter(row => {
      if (
        capabilities.search &&
        filters.search &&
        !clean(row.teamName)
          .toLocaleLowerCase('he')
          .includes(filters.search.toLocaleLowerCase('he'))
      ) return false

      if (capabilities.clubLevel && filters.clubLevel && clean(row.clubLevel) !== filters.clubLevel) return false
      if (capabilities.season && filters.season && clean(row.seasonKey) !== filters.season) return false
      if (capabilities.birthYear && filters.birthYear && clean(row.birthYear) !== filters.birthYear) return false
      if (capabilities.league && filters.league && clean(row.leagueName) !== filters.league) return false
      if (capabilities.leagueLevel && filters.leagueLevel && clean(row.leagueLevel) !== filters.leagueLevel) return false
      if (
        capabilities.expectedLevelChange &&
        filters.expectedLevelChange &&
        clean(row.expectedLeagueLevelChange?.direction) !== filters.expectedLevelChange
      ) return false
      if (capabilities.favorites && filters.favoritesOnly && row.favorite !== true) return false

      return true
    })

    return [...filtered].sort((first, second) => {
      const compareValues = (field, directionValue = 'asc') => {
        const firstValue = normalizeSortValue(resolvePath(first, field))
        const secondValue = normalizeSortValue(resolvePath(second, field))
        const direction = directionValue === 'desc' ? -1 : 1

        if (typeof firstValue === 'string' || typeof secondValue === 'string') {
          return String(firstValue).localeCompare(String(secondValue), 'he') * direction
        }

        return (Number(firstValue) - Number(secondValue)) * direction
      }

      const primary = compareValues(sort.field, sort.direction)
      if (primary !== 0) return primary

      const secondaryField = sort.secondaryField || (sort.field === 'teamName' ? '' : 'teamName')
      return secondaryField
        ? compareValues(secondaryField, sort.secondaryDirection || 'asc')
        : 0
    })
  }, [capabilities, filters, model.rows, sort])

  const toggleSort = column => {
    setSort(current => ({
      field: column.field,
      direction:
        current.field === column.field && current.direction === 'asc'
          ? 'desc'
          : 'asc',
    }))
  }

  return (
    <Box sx={sx.root({ device })}>
      <Box sx={sx.content}>
        {!isPdf ? (
          <Sheet variant='outlined' sx={sx.filters}>
            <Box sx={sx.filtersRow}>
              {capabilities.search ? (
                <Input
                  size='sm'
                  placeholder='חיפוש קבוצה'
                  value={filters.search}
                  onChange={event => updateFilter('search', event.target.value)}
                  sx={sx.searchInput}
                />
              ) : null}

              {capabilities.clubLevel ? (
                <FilterSelect
                  label='רמת מועדון'
                  value={filters.clubLevel}
                  options={options.clubLevels}
                  onChange={value => updateFilter('clubLevel', value)}
                />
              ) : null}

              {capabilities.season ? (
                <FilterSelect
                  label='עונה'
                  value={filters.season}
                  options={options.seasons}
                  onChange={value => updateFilter('season', value)}
                />
              ) : null}

              {capabilities.birthYear ? (
                <FilterSelect
                  label='שנתון'
                  value={filters.birthYear}
                  options={options.birthYears}
                  onChange={value => updateFilter('birthYear', value)}
                />
              ) : null}

              {capabilities.league ? (
                <FilterSelect
                  label='ליגה'
                  value={filters.league}
                  options={options.leagues}
                  onChange={value => updateFilter('league', value)}
                />
              ) : null}

              {capabilities.leagueLevel ? (
                <FilterSelect
                  label='רמת ליגה'
                  value={filters.leagueLevel}
                  options={options.leagueLevels}
                  onChange={value => updateFilter('leagueLevel', value)}
                />
              ) : null}

              {capabilities.expectedLevelChange ? (
                <FilterSelect
                  label='שינוי רמה'
                  value={filters.expectedLevelChange}
                  options={options.expectedLevelChanges}
                  onChange={value => updateFilter('expectedLevelChange', value)}
                />
              ) : null}
            </Box>

            <Box sx={sx.filtersMetaRow}>
              {capabilities.favorites ? (
                <Checkbox
                  size='sm'
                  label='מועדפים בלבד'
                  checked={filters.favoritesOnly}
                  onChange={event => updateFilter('favoritesOnly', event.target.checked)}
                />
              ) : null}

              <Chip size='sm' variant='soft'>
                מוצגות {rows.length} מתוך {model.totalRows || 0}
              </Chip>

              <Typography level='body-xs' sx={sx.localFilterNote}>
                הסינון והמיון משנים את התצוגה בלבד
              </Typography>
            </Box>
          </Sheet>
        ) : null}

        <Sheet variant='outlined' sx={sx.tableWrap}>
          {rows.length ? (
            <Table
              stickyHeader={!isPdf}
              hoverRow={!isPdf}
              size='sm'
              sx={sx.table({ isPdf })}
            >
              <colgroup>
                {(model.columns || []).map(column => (
                  <col key={column.id} style={{ width: column.width }} />
                ))}
              </colgroup>

              <thead>
                <tr>
                  {(model.columns || []).map(column => (
                    <th
                      key={column.id}
                      data-align={column.headerAlign || column.align || 'center'}
                      data-sortable={column.sortable ? 'true' : undefined}
                      aria-sort={
                        sort.field === column.field
                          ? sort.direction === 'asc'
                            ? 'ascending'
                            : 'descending'
                          : undefined
                      }
                      onClick={
                        column.sortable
                          ? () => toggleSort(column)
                          : undefined
                      }
                    >
                      {column.label}
                      {column.sortable && sort.field === column.field ? (
                        <Box component='span' sx={sx.sortIndicator}>
                          {sort.direction === 'asc' ? '▲' : '▼'}
                        </Box>
                      ) : null}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {rows.map((row, rowIndex) => (
                  <tr key={`${row.id || row.teamId || 'team'}:${rowIndex}`}>
                    {(model.columns || []).map(column => (
                      <td
                        key={`${row.id || row.teamId || 'team'}:${rowIndex}:${column.id}`}
                        data-align={column.align || 'center'}
                        title={resolveCellTitle(row, column)}
                      >
                        {renderCell(row, column)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <Box sx={sx.empty}>
              <Typography level='body-md'>אין קבוצות להצגה לפי הסינון הנוכחי.</Typography>
            </Box>
          )}
        </Sheet>
      </Box>
    </Box>
  )
}
