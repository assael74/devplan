// playerProfile/modules/videos/components/PlayerVideosToolbar.js

import React from 'react'
import { Box, Input, Option, Select, Typography, Chip, Button, ChipDelete } from '@mui/joy'

import { iconUi } from '../../../../../../../ui/core/icons/iconUi.js'
import { playerVideosToolbarSx as sx } from '../sx/playerVideos.toolbar.sx.js'

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
      sx={{ "--Chip-paddingInline": "-3px" }}
      startDecorator={iconUi({id: item.idIcon, sx: { pl: 0.5, fontSize: 18 }})}
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
          {iconUi({id: 'close'})}
        </ChipDelete>
      }
    >
      <Typography level="body-xs" noWrap sx={{ minWidth: 0 }}>
        {item.label} ({item.count || 0})
      </Typography>
    </Chip>
  )
}

export default function PlayerVideosToolbar({
  summary,
  filters,
  indicators = [],
  options = {},
  onOpenInsights,
  onChangeFilters,
  onResetFilters,
}) {
  const periodOptions = Array.isArray(options?.periodOptions) ? options.periodOptions : []
  const scopeOptions = Array.isArray(options?.scopeOptions) ? options.scopeOptions : []
  const categoryOptions = Array.isArray(options?.tagCategoryOptions) ? options.tagCategoryOptions : []
  const topicOptions = Array.isArray(options?.tagTopicOptions) ? options.tagTopicOptions : []

  const hasActiveFilters = (summary?.activeFiltersCount || 0) > 0

  const selectedPeriod = periodOptions.find((x) => x.value === (filters?.periodKey || '')) || null

  const selectedScope =
    scopeOptions.find((x) => x.id === (filters?.scope || 'all')) ||
    scopeOptions.find((x) => x.id === 'all') ||
    null

  const selectedCategory = categoryOptions.find((x) => x.value === (filters?.categoryKey || '')) || null

  const selectedTopic = topicOptions.find((x) => x.value === (filters?.topicKey || '')) || null

  const handleClearIndicator = (item) => {
    if (!item?.type) return

    if (item.type === 'search') {
      onChangeFilters({ search: '' })
      return
    }

    if (item.type === 'periodKey') {
      onChangeFilters({ periodKey: '' })
      return
    }

    if (item.type === 'scope') {
      onChangeFilters({ scope: 'all' })
      return
    }

    if (item.type === 'categoryKey') {
      onChangeFilters({ categoryKey: '', topicKey: '' })
      return
    }

    if (item.type === 'topicKey') {
      onChangeFilters({ topicKey: '' })
    }
  }

  return (
    <Box sx={sx.toolbar}>
      <Box sx={sx.toolbarTop}>
        <Input
          value={filters?.search || ''}
          onChange={(e) => onChangeFilters({ search: e.target.value })}
          startDecorator={iconUi({ id: 'search' })}
          placeholder="חיפוש לפי שם והערות"
          size="sm"
          sx={sx.searchInput}
        />

        <Select
          size="sm"
          value={filters?.scope || 'all'}
          onChange={(_, v) => onChangeFilters({ scope: v || 'all' })}
          sx={{ minWidth: 122, flexShrink: 0, }}
          slotProps={{ listbox: { sx: sx.listboxSx } }}
          renderValue={() => (
            <SelectValue
              label={selectedScope?.label || 'כל הסוגים'}
              icon={selectedScope?.id === 'meeting' ? 'meeting' : 'videoAnalysis'}
              count={selectedScope?.count ?? summary?.totalVideos ?? 0}
              fixedWidth={{ minWidth: 122, }}
            />
          )}
        >
          {scopeOptions.map((item) => (
            <Option key={item.id} value={item.id}>
              <SelectValue
                label={item.label}
                icon={item.id === 'meeting' ? 'meeting' : 'videoAnalysis'}
                count={item.count}
              />
            </Option>
          ))}
        </Select>

        <Select
          size="sm"
          value={filters?.categoryKey || ''}
          onChange={(_, v) => onChangeFilters({ categoryKey: v || '', topicKey: '' })}
          sx={{ minWidth: 176, flexShrink: 0, }}
          slotProps={{ listbox: { sx: sx.listboxSx } }}
          renderValue={() => (
            <SelectValue
              label={selectedCategory?.label || 'כל הקטגוריות'}
              icon="parents"
              count={selectedCategory?.count ?? summary?.totalVideos ?? 0}
              fixedWidth={{ minWidth: 176, }}
            />
          )}
        >
          <Option value="">
            <SelectValue
              label="כל הקטגוריות"
              icon="tag"
              count={summary?.totalVideos || 0}
            />
          </Option>

          {categoryOptions.map((item) => (
            <Option key={item.id} value={item.value}>
              <SelectValue label={item.label} icon="tag" count={item.count} />
            </Option>
          ))}
        </Select>

        <Select
          size="sm"
          value={filters?.topicKey || ''}
          onChange={(_, v) => onChangeFilters({ topicKey: v || '' })}
          sx={{ minWidth: 176, flexShrink: 0, }}
          disabled={!topicOptions.length}
          slotProps={{ listbox: { sx: sx.listboxSx } }}
          renderValue={() => (
            <SelectValue
              label={selectedTopic?.label || 'כל הנושאים'}
              icon="children"
              count={selectedTopic?.count ?? topicOptions.length}
              fixedWidth={{ minWidth: 176, }}
            />
          )}
        >
          <Option value="">
            <SelectValue
              label="כל הנושאים"
              icon="children"
              count={topicOptions.length || 0}
            />
          </Option>

          {topicOptions.map((item) => (
            <Option key={item.id} value={item.value}>
              <SelectValue label={item.label} icon="children" count={item.count} />
            </Option>
          ))}
        </Select>

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

      <Box sx={sx.bottomRow}>
        <Box sx={sx.indicatorsRow}>
          {indicators.map((item) => (
            <FilterIndicatorChip
              key={item.id}
              item={item}
              onClear={handleClearIndicator}
            />
          ))}
        </Box>

        <Typography level="body-xs" sx={sx.summaryText}>
          מוצגים {summary?.filteredVideos || 0} מתוך {summary?.totalVideos || 0} קטעים
        </Typography>
      </Box>
    </Box>
  )
}
