// features/playersDatabase/components/profilesPage/toolbar/ProfilesToolbar.js

import React from 'react'
import { Box, Button, Option, Select, Sheet, Stack, Typography } from '@mui/joy'

import { iconUi } from '../../../../../ui/core/icons/iconUi.js'
import { ChipButton } from '../../sharedUi/index.js'
import {
  getLeagueLevelLabel,
  getLeagueRegionLabel,
} from '../../leagues/leagueUtils.js'
import { SEARCH_MODE_OPTIONS } from '../logic/constants.js'
import { getProfileChipCounts } from '../logic/filters.logic.js'
import {
  getPrimaryFallback,
  getPrimaryLabel,
  getPrimaryOptions,
  getRegionOptions,
  getRegionFallback,
  getHintText,
  getSecondaryRows,
  getSecondaryRowSelected,
  resetProfilesToolbar,
  toggleSecondaryRow,
} from './toolbar.logic.js'
import { toolbarSx as sx } from './toolbar.sx.js'
import ScoutProfilesFilterRow from './ScoutProfilesFilterRow.js'

const renderSelectValue = (label, fallback) => (
  <Typography level="body-sm" sx={sx.selectValue(label)}>
    {label || fallback}
  </Typography>
)

function FilterChipCard({ label, subtitle, selected, counts, onClick }) {
  const disabled = counts.playersCount === 0

  return (
    <ChipButton
      ariaLabel={label}
      label={label}
      selected={selected}
      disabled={disabled}
      onClick={onClick}
      palette={{
        selectedStart: '#173b57',
        selectedMid: '#245273',
        selectedEnd: '#4c87b1',
        selectedLine: '#5aa9d8',
      }}
    >
      <Box sx={sx.chipCardBody}>
        <Typography level="title-sm" sx={sx.chipCardTitle}>
          {label}
        </Typography>

        {subtitle ? (
          <Typography level="body-xs" sx={sx.chipCardSubtitle}>
            {subtitle}
          </Typography>
        ) : null}
      </Box>

      <Box sx={sx.chipCardMetrics(selected)}>
        <Box sx={sx.chipMetric}>
          <Typography
            level="body-sm"
            component="span"
            sx={sx.chipMetricValue}
            startDecorator={iconUi({ id: 'teams' })}
          >
            {counts.teamsCount}
          </Typography>
        </Box>

        <Box sx={sx.chipMetric}>
          <Typography
            level="body-sm"
            component="span"
            sx={sx.chipMetricValue}
            startDecorator={iconUi({ id: 'player' })}
          >
            {counts.playersCount}
          </Typography>
        </Box>
      </Box>
    </ChipButton>
  )
}

const getChipLabel = (searchMode, row) => {
  if (searchMode === 'year') {
    return row.league?.ageGroupLabel || row.title?.split('|')?.[0]?.trim() || row.title
  }

  return row.title
}

const getChipSubtitle = (searchMode, row) => {
  if (searchMode !== 'year') return ''

  const subtitleParts = [
    getLeagueLevelLabel(row.league?.level || row.level),
    getLeagueRegionLabel(row.league?.region || row.region),
  ].filter(Boolean)

  return subtitleParts.join(' | ')
}

export default function ProfilesToolbar({ model }) {
  const primaryOptions = getPrimaryOptions(model)
  const primaryLabel = getPrimaryLabel(model.searchMode)
  const primaryFallback = getPrimaryFallback(model.searchMode)
  const regionOptions = getRegionOptions(model)
  const hasRegionSelect = regionOptions.length > 0
  const regionFallback = getRegionFallback()
  const secondaryRows = getSecondaryRows(model)
  const secondaryReady =
    model.searchMode !== 'all' && model.primaryFilter !== 'all'
  const hintText = getHintText(
    model.searchMode,
    model.primaryFilter,
    model.selectedRegionId
  )
  const showHintUnderSelectors =
    (hasRegionSelect && model.selectedRegionId === 'all') ||
    (!secondaryReady && hintText)

  const selectedProfile = model.selectedProfile || null
  const selectedProfileIds =
    model.selectedProfilesById?.[selectedProfile?.id] || []
  const selectedProfileResult = model.profileResultsById?.[selectedProfile?.id]

  return (
    <Sheet sx={sx.root}>
      <Box sx={[sx.main, !hasRegionSelect && sx.mainWithoutRegion]}>
        <Stack spacing={0.5}>
          <Typography level="body-xs" sx={sx.label}>
            עונה
          </Typography>

          <Select
            size="sm"
            value={model.selectedSeasonId}
            sx={sx.field}
            onChange={(_, value) => model.setSelectedSeasonId(value || model.selectedSeasonId)}
            renderValue={selected =>
              renderSelectValue(
                model.seasonOptions.find(item => item.value === selected?.value)?.label,
                'בחר עונה'
              )
            }
          >
            {model.seasonOptions.map(option => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>
        </Stack>

        <Stack spacing={0.5}>
          <Typography level="body-xs" sx={sx.label}>
            חיפוש משני
          </Typography>

          <Select
            size="sm"
            value={model.searchMode}
            sx={sx.field}
            onChange={(_, value) => model.setSearchMode(value || 'all')}
            renderValue={selected =>
              renderSelectValue(
                SEARCH_MODE_OPTIONS.find(item => item.value === selected?.value)?.label,
                'בחר סוג חיפוש'
              )
            }
          >
            {SEARCH_MODE_OPTIONS.map(option => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>
        </Stack>

        <Stack spacing={0.5}>
          <Typography level="body-xs" sx={sx.label}>
            {primaryLabel}
          </Typography>

          <Select
            size="sm"
            value={model.primaryFilter}
            disabled={model.searchMode === 'all'}
            sx={sx.field}
            onChange={(_, value) => model.setPrimaryFilter(value || 'all')}
            renderValue={selected =>
              renderSelectValue(
                primaryOptions.find(item => item.value === selected?.value)?.label,
                primaryFallback
              )
            }
          >
            {primaryOptions.map(option => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>
        </Stack>

        {regionOptions.length ? (
          <Stack spacing={0.5}>
            <Typography level="body-xs" sx={sx.label}>
              אזור
            </Typography>

            <Select
              size="sm"
              value={model.selectedRegionId}
              sx={sx.field}
              onChange={(_, value) => model.setSelectedRegionId(value || 'all')}
              renderValue={selected =>
                renderSelectValue(
                  regionOptions.find(item => item.value === selected?.value)?.label,
                  regionFallback
                )
              }
            >
              {regionOptions.map(option => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>
          </Stack>
        ) : null}

        <Stack direction="row" spacing={0.75} flexWrap="wrap" sx={sx.actions}>
          <Button
            size="sm"
            variant="soft"
            color="neutral"
            sx={{
              bgcolor: '#657684',
              color: '#ffffff',
              '&:hover': {
                bgcolor: '#173B57',
              },
            }}
            onClick={() => resetProfilesToolbar(model)}
          >
            נקה בחירה
          </Button>
        </Stack>
      </Box>

      <Box sx={sx.secondaryArea}>
        {showHintUnderSelectors ? (
          <Typography level="body-xs" sx={sx.hint}>
            {hintText}
          </Typography>
        ) : null}

        {secondaryReady && secondaryRows.length ? (
          <Box sx={sx.chipRow}>
            {secondaryRows.map(row => (
              <FilterChipCard
                key={row.id}
                label={getChipLabel(model.searchMode, row)}
                subtitle={getChipSubtitle(model.searchMode, row)}
                selected={getSecondaryRowSelected(model, row)}
                counts={getProfileChipCounts(row)}
                onClick={() => toggleSecondaryRow(model, row)}
              />
            ))}
          </Box>
        ) : null}

        {secondaryReady ? (
          <ScoutProfilesFilterRow
            previewState={model.previewState}
            selectedProfile={selectedProfile}
            selectedProfileIds={selectedProfileIds}
            onToggleProfile={model.toggleProfileForLoad}
            selectionReady={Boolean(model.previewState?.chipsReady)}
            loading={Boolean(selectedProfileResult?.loading) || Boolean(model.loading)}
          />
        ) : null}
      </Box>
    </Sheet>
  )
}
