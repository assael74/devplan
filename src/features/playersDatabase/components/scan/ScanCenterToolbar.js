// src/features/playersDatabase/components/scan/ScanCenterToolbar.js

import React from 'react'
import { Box, Button, Option, Select, Sheet, Stack, Typography } from '@mui/joy'
import { GroupsRounded, PersonRounded } from '@mui/icons-material'

import { iconUi } from '../../../../ui/core/icons/iconUi.js'
import { SEARCH_MODE_OPTIONS } from './logic/constants.js'
import { getScanChipCounts } from './logic/filters.logic.js'
import { scanToolbarSx as sx } from './sx/toolbar.sx.js'

const getPrimaryLabel = searchMode => searchMode === 'league' ? 'ליגות' : searchMode === 'year' ? 'שנתונים' : 'סוג חיפוש'

const getPrimaryOptions = model => model.searchMode === 'league' ? model.leagueOptions : model.searchMode === 'year' ? model.yearOptions : []

const getHintText = (searchMode, primaryFilter) => {
  if (searchMode === 'all') return 'בחר חיפוש לפי סוג חיפוש'
  if (searchMode === 'year' && primaryFilter === 'all') return 'בחר ליגה'
  if (searchMode === 'league' && primaryFilter === 'all') return 'בחר שנתון'
  return ''
}

const renderSelectValue = (label, fallback) => <Typography level="body-sm" sx={sx.selectValue(label)}>{label || fallback}</Typography>

function ChipCard({ label, selected, onClick, counts }) {
  return (
    <Box component="button" type="button" aria-pressed={selected} onClick={onClick} sx={[sx.chipCard, selected && sx.chipCardSelected]}>
      <Typography level="title-sm" sx={sx.chipCardTitle}>{label}</Typography>
      <Box sx={sx.chipCardMetrics}>
        <Box sx={sx.chipMetric}><GroupsRounded sx={sx.chipIcon} /><Typography level="body-sm" component="span" sx={sx.chipMetricValue}>{counts.teamsCount}</Typography></Box>
        <Box sx={sx.chipMetric}><PersonRounded sx={sx.chipIcon} /><Typography level="body-sm" component="span" sx={sx.chipMetricValue}>{counts.playersCount}</Typography></Box>
      </Box>
    </Box>
  )
}

export default function ScanCenterToolbar({ model }) {
  const primaryOptions = getPrimaryOptions(model)
  const primaryLabel = getPrimaryLabel(model.searchMode)
  const primaryFallback = model.searchMode === 'all' ? 'בחר סוג חיפוש' : model.searchMode === 'year' ? 'בחר ליגה' : 'בחר שנתון'
  const hintText = getHintText(model.searchMode, model.primaryFilter)
  const secondaryReady = model.searchMode !== 'all' && model.primaryFilter !== 'all'
  const chipRows = model.searchMode === 'year' ? model.leagueRows.filter(row => model.primaryFilter === 'all' || row.birthYear === model.primaryFilter) : model.searchMode === 'league' ? model.yearRows.filter(row => model.primaryFilter === 'all' || row.children?.some(child => child.leagueId === model.primaryFilter)) : []

  const reset = () => {
    model.setSelectedSeasonId(model.seasonOptions?.at(-1)?.value || model.selectedSeasonId)
    model.setSearchMode('all')
    model.setPrimaryFilter('all')
    model.setSelectedLeagueIds([])
    model.setSelectedBirthYears([])
  }

  return (
    <Sheet sx={sx.root}>
      <Box sx={sx.main}>
        <Stack spacing={0.5}>
          <Typography level="body-xs" sx={sx.label}>עונה</Typography>
          <Select size="sm" value={model.selectedSeasonId} onChange={(_, value) => model.setSelectedSeasonId(value || model.selectedSeasonId)} sx={sx.field} renderValue={selected => renderSelectValue(model.seasonOptions?.find(item => item.value === selected?.value)?.label, 'בחר עונה')}>
            {(model.seasonOptions || []).map(option => <Option key={option.value} value={option.value}>{option.label}</Option>)}
          </Select>
        </Stack>

        <Stack spacing={0.5}>
          <Typography level="body-xs" sx={sx.label}>סוג חיפוש</Typography>
          <Select size="sm" value={model.searchMode} onChange={(_, value) => model.setSearchMode(value || 'all')} sx={sx.field} renderValue={selected => renderSelectValue(SEARCH_MODE_OPTIONS.find(item => item.value === selected?.value)?.label, 'בחר סוג חיפוש')}>
            {SEARCH_MODE_OPTIONS.map(option => <Option key={option.value} value={option.value}>{option.label}</Option>)}
          </Select>
        </Stack>

        <Stack spacing={0.5}>
          <Typography level="body-xs" sx={sx.label}>{primaryLabel}</Typography>
          <Select size="sm" value={model.primaryFilter} disabled={model.searchMode === 'all'} onChange={(_, value) => model.setPrimaryFilter(value || 'all')} sx={sx.field} renderValue={selected => renderSelectValue(primaryOptions.find(item => item.value === selected?.value)?.label, primaryFallback)}>
            {primaryOptions.map(option => <Option key={option.value} value={option.value}>{option.label}</Option>)}
          </Select>
        </Stack>

        <Stack direction="row" spacing={0.75} flexWrap="wrap" sx={sx.actions}>
          <Button size="sm" variant="soft" color="neutral" onClick={reset}>נקה בחירה</Button>
          <Button size="sm" color={model.indicatorsLoaded ? 'success' : 'primary'} loading={model.loadingIndicators} startDecorator={iconUi({ id: 'search', size: 'small' })} onClick={model.loadIndicators}>טען פרופילים</Button>
        </Stack>
      </Box>

      {!secondaryReady && hintText ? <Typography level="body-xs" sx={sx.hint}>{hintText}</Typography> : null}

      {secondaryReady && chipRows.length ? (
        <Box sx={sx.chipRow}>
          {chipRows.map(row => {
            const selected = model.searchMode === 'year' ? model.selectedLeagueIds.includes(row.leagueId) : model.selectedBirthYears.includes(row.birthYear)
            const onClick = () => model.searchMode === 'year' ? model.toggleLeagueId(row.leagueId) : model.toggleBirthYear(row.birthYear)
            return <ChipCard key={row.id} label={row.title} selected={selected} onClick={onClick} counts={getScanChipCounts(row)} />
          })}
        </Box>
      ) : null}
    </Sheet>
  )
}
