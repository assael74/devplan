// teamProfile/modules/games/components/TeamGamesToolbar.js

import React from 'react'
import { Box, Input, Option, Select, Typography, Chip, Button, ChipDelete } from '@mui/joy'

import { iconUi } from '../../../../../../ui/core/icons/iconUi.js'
import { teamGamesToolbarSx as sx } from '../sx/teamGames.toolbar.sx.js'

function SelectValue({ label, icon, count, fixedWidth }) {
  return (
    <Box sx={{ ...sx.selectValueRow, width: fixedWidth || '100%' }}>
      <Box sx={sx.selectValueMain}>
        {icon ? iconUi({ id: icon, size: 'sm' }) : null}

        <Typography level="body-sm" noWrap>
          {label}
        </Typography>
      </Box>

      <Chip size="sm" variant="soft" color="neutral" sx={{ flexShrink: 0, }}>
        {count || 0}
      </Chip>
    </Box>
  )
}

function FilterIndicatorChip({ item, onClear }) {
  if (!item) return null

  return (
    <Chip
      size="md"
      variant="soft"
      color="primary"
      sx={{ '--Chip-paddingInline': '-3px' }}
      startDecorator={iconUi({ id: item.idIcon || 'filter', sx: { pl: 0.5, fontSize: 18 } })}
      endDecorator={
        <ChipDelete
          color="danger"
          variant="plain"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            onClear(item)
          }}
        >
          {iconUi({ id: 'close' })}
        </ChipDelete>
      }
    >
      <Typography level="body-xs" noWrap sx={{ minWidth: 0 }}>
        {item.label}
      </Typography>
    </Chip>
  )
}

const pickOption = (arr, value, fallbackKey = 'id') => {
  const base = Array.isArray(arr) ? arr : []
  return base.find((x) => x?.value === value || x?.id === value || x?.[fallbackKey] === value) || null
}

export default function TeamGamesToolbar({
  summary,
  filters,
  indicators = [],
  options = {},
  onOpenInsights,
  onChangeFilters,
  onResetFilters,
}) {
  const typeOptions = Array.isArray(options?.typeOptions) ? options.typeOptions : []
  const resultOptions = Array.isArray(options?.resultOptions) ? options.resultOptions : []
  const venueOptions = Array.isArray(options?.venueOptions) ? options.venueOptions : []
  const difficultyOptions = Array.isArray(options?.difficultyOptions) ? options.difficultyOptions : []

  const totalGames = summary?.totalGames || summary?.total || 0
  const filteredGames = summary?.filteredGames || summary?.shown || totalGames
  const activeFiltersCount = summary?.activeFiltersCount || 0
  const hasActiveFilters = activeFiltersCount > 0

  const selectedType = pickOption(typeOptions, filters?.typeKey || filters?.typeFilter || '')
  const selectedResult = pickOption(resultOptions, filters?.resultKey || filters?.resultFilter || '')
  const selectedVenue = pickOption(venueOptions, filters?.venueKey || filters?.homeFilter || '')
  const selectedDifficulty = pickOption(difficultyOptions, filters?.difficultyKey || '')

  const handleClearIndicator = (item) => {
    if (!item?.type) return

    if (item.type === 'search') return onChangeFilters({ search: '', q: '' })
    if (item.type === 'typeKey') return onChangeFilters({ typeKey: '', typeFilter: '' })
    if (item.type === 'resultKey') return onChangeFilters({ resultKey: '', resultFilter: '' })
    if (item.type === 'venueKey') return onChangeFilters({ venueKey: '', homeFilter: '' })
    if (item.type === 'difficultyKey') return onChangeFilters({ difficultyKey: '' })
  }

  return (
    <Box sx={sx.toolbar}>
      <Box sx={sx.toolbarTop}>
        <Input
          value={filters?.search || filters?.q || ''}
          onChange={(e) => onChangeFilters({ search: e.target.value, q: e.target.value })}
          startDecorator={iconUi({ id: 'search' })}
          placeholder="חיפוש לפי יריבה, תוצאה, סוג משחק"
          size="sm"
          sx={{ width: 240, maxWidth: '100%', flexShrink: 0, }}
        />

        <Select
          size="sm"
          value={filters?.typeKey || filters?.typeFilter || ''}
          onChange={(_, v) => onChangeFilters({ typeKey: v || '', typeFilter: v || '' })}
          sx={{ minWidth: 122, flexShrink: 0, }}
          slotProps={{ listbox: { sx: sx.listboxSx } }}
          renderValue={() => (
            <SelectValue
              label={selectedType?.label || 'כל סוגי המשחקים'}
              icon={selectedType?.idIcon || 'game'}
              count={selectedType?.count ?? totalGames}
              fixedWidth={{ minWidth: 122, }}
            />
          )}
        >
          <Option value="">
            <SelectValue label="כל סוגי המשחקים" icon="game" count={totalGames} />
          </Option>

          {typeOptions.map((item) => (
            <Option key={item.id || item.value} value={item.value || item.id}>
              <SelectValue label={item.label} icon={item.idIcon || 'game'} count={item.count} />
            </Option>
          ))}
        </Select>

        <Select
          size="sm"
          value={filters?.venueKey || filters?.homeFilter || ''}
          onChange={(_, v) => onChangeFilters({ venueKey: v || '', homeFilter: v || '' })}
          sx={{ minWidth: 150, flexShrink: 0, }}
          slotProps={{ listbox: { sx: sx.listboxSx } }}
          renderValue={() => (
            <SelectValue
              label={selectedVenue?.label || 'בית וחוץ'}
              icon={selectedVenue?.id === 'away' ? 'away' : selectedVenue?.id === 'home' ? 'home' : 'home'}
              count={selectedVenue?.count ?? totalGames}
              fixedWidth={{ minWidth: 150, }}
            />
          )}
        >
          <Option value="">
            <SelectValue label="בית וחוץ" icon="home" count={totalGames} />
          </Option>

          {venueOptions.map((item) => (
            <Option key={item.id || item.value} value={item.value || item.id}>
              <SelectValue label={item.label} icon={item.idIcon || 'home'} count={item.count} />
            </Option>
          ))}
        </Select>

        <Select
          size="sm"
          value={filters?.resultKey || filters?.resultFilter || ''}
          onChange={(_, v) => onChangeFilters({ resultKey: v || '', resultFilter: v || '' })}
          sx={{ minWidth: 156, flexShrink: 0, }}
          slotProps={{ listbox: { sx: sx.listboxSx } }}
          renderValue={() => (
            <SelectValue
              label={selectedResult?.label || 'כל התוצאות'}
              icon={selectedResult?.idIcon || 'result'}
              count={selectedResult?.count ?? totalGames}
              fixedWidth={{ minWidth: 156, flexShrink: 0, }}
            />
          )}
        >
          <Option value="">
            <SelectValue label="כל התוצאות" icon="result" count={totalGames} />
          </Option>

          {resultOptions.map((item) => (
            <Option key={item.id || item.value} value={item.value || item.id}>
              <SelectValue label={item.label} icon={item.idIcon || 'result'} count={item.count} />
            </Option>
          ))}
        </Select>

        {!!difficultyOptions.length && (
          <Select
            size="sm"
            value={filters?.difficultyKey || ''}
            onChange={(_, v) => onChangeFilters({ difficultyKey: v || '' })}
            sx={{ minWidth: 156, flexShrink: 0, }}
            slotProps={{ listbox: { sx: sx.listboxSx } }}
            renderValue={() => (
              <SelectValue
                label={selectedDifficulty?.label || 'כל רמות הקושי'}
                icon={selectedDifficulty?.idIcon || 'difficulty'}
                count={selectedDifficulty?.count ?? totalGames}
                fixedWidth={{ minWidth: 156 }}
              />
            )}
          >
            <Option value="">
              <SelectValue label="כל רמות הקושי" icon="difficulty" count={totalGames} />
            </Option>

            {difficultyOptions.map((item) => (
              <Option key={item.id || item.value} value={item.value || item.id}>
                <SelectValue label={item.label} icon={item.idIcon || 'difficulty'} count={item.count} />
              </Option>
            ))}
          </Select>
        )}

        <Chip
          size="sm"
          variant="soft"
          color="danger"
          disabled={!hasActiveFilters}
          onClick={onResetFilters}
          startDecorator={iconUi({ id: 'reset' })}
          sx={{ cursor: 'pointer', fontWeight: 700, flexShrink: 0, }}
        >
          איפוס
        </Chip>

        <Box sx={{ flex: 1 }} />

        <Box sx={{ display: 'flex', alignItems: 'center', flexShrink: 0, }}>
          <Button
            size="sm"
            variant="solid"
            startDecorator={iconUi({ id: 'insights' })}
            onClick={onOpenInsights}
            sx={sx.createBtn}
          >
            תובנות
          </Button>
        </Box>
      </Box>

      <Box sx={sx.toolbarBottom}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap' }}>
          <Chip size="sm" variant="soft" color="primary" startDecorator={iconUi({ id: 'game' })}>
            {filteredGames} / {totalGames} משחקים
          </Chip>

          {!!summary?.playedGames && (
            <Chip size="sm" variant="soft" color="success" startDecorator={iconUi({ id: 'done' })}>
              {summary.playedGames} שוחקו
            </Chip>
          )}

          {!!summary?.upcomingGames && (
            <Chip size="sm" variant="soft" color="warning" startDecorator={iconUi({ id: 'calendar' })}>
              {summary.upcomingGames} עתידיים
            </Chip>
          )}
        </Box>

        {!!indicators?.length && (
          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            {indicators.map((item) => (
              <FilterIndicatorChip
                key={item.id || item.type}
                item={item}
                onClear={handleClearIndicator}
              />
            ))}
          </Box>
        )}
      </Box>
    </Box>
  )
}
