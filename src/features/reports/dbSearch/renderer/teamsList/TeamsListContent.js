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
  Stack,
  Table,
  Typography,
} from '@mui/joy'

import { teamsListSx as sx } from './teamsList.sx.js'

const EXPECTED_LEVEL_LABELS = {
  relegation: 'ירידה צפויה',
  unchanged: 'ללא שינוי',
  promotion: 'עלייה צפויה',
  unknown: 'לא ניתן לחשב',
}

const clean = value => String(value || '').trim()

function formatRate(value) {
  return Number.isFinite(Number(value))
    ? `${Math.round(Number(value))}%`
    : '—'
}

function MetaItem({ item = {} }) {
  return (
    <Sheet variant='outlined' sx={sx.metaItem}>
      <Typography level='body-xs'>{item.label || ''}</Typography>
      <Typography level='title-md'>{item.value || '—'}</Typography>
    </Sheet>
  )
}


function QuerySnapshot({ queryItems = [], resultItems = [] }) {
  if (!queryItems.length && !resultItems.length) return null

  return (
    <Sheet variant='outlined' sx={sx.querySnapshot}>
      <Box sx={sx.querySnapshotHeader}>
        <Typography level='title-sm'>תנאי הצילום</Typography>
        <Typography level='body-xs'>הפילטרים שהיו פעילים בזמן יצירת ה־Snapshot</Typography>
      </Box>

      {queryItems.length ? (
        <Box sx={sx.queryGroup}>
          <Typography level='body-xs' sx={sx.queryGroupLabel}>שאילתת מקור</Typography>
          <Box sx={sx.queryChips}>
            {queryItems.map(item => (
              <Chip key={item.id || item.label} size='sm' variant='soft'>
                {item.label}
              </Chip>
            ))}
          </Box>
        </Box>
      ) : null}

      {resultItems.length ? (
        <Box sx={sx.queryGroup}>
          <Typography level='body-xs' sx={sx.queryGroupLabel}>סינון תוצאות לפני הצילום</Typography>
          <Box sx={sx.queryChips}>
            {resultItems.map(item => (
              <Chip key={item.id || `${item.label}-${item.value}`} size='sm' variant='outlined'>
                {item.label}: {item.value}
              </Chip>
            ))}
          </Box>
        </Box>
      ) : null}
    </Sheet>
  )
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

function normalizeSortValue(value) {
  if (value === null || value === undefined || value === '') return 0
  return value
}

function renderCell(row, column) {
  if (column.kind === 'team') {
    return (
      <Box sx={sx.teamCell}>
        <Typography level='body-sm' fontWeight={600} noWrap>
          {row.teamName || '—'}
        </Typography>
        {row.favorite ? (
          <Chip size='sm' variant='soft'>מועדף</Chip>
        ) : null}
      </Box>
    )
  }

  if (column.kind === 'goals') {
    return `${row.goalsFor || 0}:${row.goalsAgainst || 0}`
  }

  if (column.kind === 'rate') {
    return formatRate(resolvePath(row, column.field))
  }

  if (column.kind === 'expectedLevelChange') {
    return EXPECTED_LEVEL_LABELS[
      row.expectedLeagueLevelChange?.direction
    ] || '—'
  }

  const value = resolvePath(row, column.field)
  return value === 0 ? 0 : value || '—'
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
    season: '',
    birthYear: '',
    league: '',
    leagueLevel: '',
    expectedLevelChange: '',
    favoritesOnly: false,
  })
  const [sort, setSort] = React.useState(model.defaultSort || {
    field: 'tableRank',
    direction: 'asc',
  })

  React.useEffect(() => {
    setFilters({
      search: '',
      season: '',
      birthYear: '',
      league: '',
      leagueLevel: '',
      expectedLevelChange: '',
      favoritesOnly: false,
    })
    setSort(model.defaultSort || {
      field: 'tableRank',
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
      const firstValue = normalizeSortValue(resolvePath(first, sort.field))
      const secondValue = normalizeSortValue(resolvePath(second, sort.field))
      const direction = sort.direction === 'desc' ? -1 : 1

      if (typeof firstValue === 'string' || typeof secondValue === 'string') {
        return String(firstValue).localeCompare(String(secondValue), 'he') * direction
      }

      return (Number(firstValue) - Number(secondValue)) * direction
    })
  }, [capabilities, filters, model.rows, sort])

  const toggleSort = field => {
    setSort(current => ({
      field,
      direction:
        current.field === field && current.direction === 'asc'
          ? 'desc'
          : 'asc',
    }))
  }

  return (
    <Box sx={sx.root({ device })}>
      <Stack spacing={2}>
        <Box sx={sx.header}>
          <Typography level='h2'>{model.title}</Typography>
          {model.subtitle ? (
            <Typography level='body-sm'>{model.subtitle}</Typography>
          ) : null}
        </Box>

        {model.metaItems?.length ? (
          <Box sx={sx.metaGrid}>
            {model.metaItems.map(item => (
              <MetaItem
                key={item.id || item.label}
                item={item}
              />
            ))}
          </Box>
        ) : null}

        <QuerySnapshot
          queryItems={model.sourceQueryItems}
          resultItems={model.sourceResultItems}
        />

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
              <thead>
                <tr>
                  {(model.columns || []).map(column => (
                    <th
                      key={column.id}
                      data-sortable={column.sortable ? 'true' : undefined}
                      onClick={
                        column.sortable
                          ? () => toggleSort(column.field)
                          : undefined
                      }
                    >
                      {column.label}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {rows.map(row => (
                  <tr key={row.id}>
                    {(model.columns || []).map(column => (
                      <td key={`${row.id}:${column.id}`}>
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
      </Stack>
    </Box>
  )
}
