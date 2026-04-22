// teamProfile/desktop/modules/players/components/TeamPlayersToolbar.js

import React from 'react'
import { Box, Button, Chip, Input, Option, Select, ListItemDecorator } from '@mui/joy'

import { getEntityColors } from '../../../../../../../ui/core/theme/Colors.js'
import { iconUi } from '../../../../../../../ui/core/icons/iconUi.js'

import { toolbarSx as sx } from '../sx/toolbar.sx.js'

const c = getEntityColors('players')

const renderValue = (selected, positionBuckets) => {
  const val = selected?.value || ''
  const item = positionBuckets.find((p) => p.id === val)

  if (!item) {
    return (
      <>
        <ListItemDecorator>
          {iconUi({ id: 'layers' })}
        </ListItemDecorator>
        כל העמדות
      </>
    )
  }

  return (
    <>
      <ListItemDecorator>
        {iconUi({ id: item.id !== 'none' ? item.id : 'close' })}
      </ListItemDecorator>
      {item.label} ({item.count})
    </>
  )
}

export default function TeamPlayersToolbar({
  summary,
  filters,
  onOpenInsights,
  onChangeSearch,
  onToggleOnlyActive,
  onToggleOnlyKey,
  onToggleOnlyProject,
  onResetFilters,
  onChangePositionLayer,
}) {
  const positionBuckets = Array.isArray(summary?.positionBuckets) ? summary.positionBuckets : []
  const hasActiveFilters =
    !!filters?.search ||
    !!filters?.onlyActive ||
    !!filters?.onlyKey ||
    !!filters?.onlyProject ||
    !!filters?.positionLayer

  return (
    <Box sx={sx.toolbar}>
      <Box sx={sx.toolbarTop}>
        <Input
          value={filters?.search || ''}
          onChange={(e) => onChangeSearch(e.target.value)}
          startDecorator={iconUi({id: 'search'})}
          placeholder="חיפוש שחקן לפי שם / שנתון / עמדה"
          size="sm"
          sx={sx.searchInput}
        />

        <Select
          size="sm"
          value={filters?.positionLayer || ''}
          onChange={(_, value) => onChangePositionLayer(value || '')}
          placeholder="כל העמדות"
          sx={sx.positionSelect}
          renderValue={(selected) => renderValue(selected, positionBuckets)}
        >
          <Option value="">כל העמדות</Option>

          {positionBuckets.map((item) => {
            return (
              <Option key={item.id} value={item.id}>
                <ListItemDecorator>{iconUi({id: item.id !== 'none' ? item.id : 'close'})}</ListItemDecorator>
                 {item.label} ({item.count})
              </Option>
            )
          } )}
        </Select>

        <Box sx={sx.filtersInline}>
          <Chip
            size="md"
            variant={filters?.onlyProject ? 'solid' : 'outlined'}
            color={filters?.onlyProject ? 'success' : 'neutral'}
            onClick={onToggleOnlyProject}
            sx={{
              ...sx.filterChip,
              ...(filters?.onlyProject
                ? {}
                : {
                    bgcolor: c.bg,
                    color: c.text,
                  }),
            }}
            startDecorator={iconUi({id: 'project', sx: { color: !filters?.onlyProject ? '#f52516' : '' }})}
          >
            רק פרויקט ({summary?.project ?? 0})
          </Chip>

          <Chip
            size="md"
            variant={filters?.onlyKey ? 'solid' : 'outlined'}
            color={filters?.onlyKey ? 'success' : 'neutral'}
            onClick={onToggleOnlyKey}
            sx={sx.filterChip}
            startDecorator={iconUi({id: 'keyPlayer', sx: { color: !filters?.onlyKey ? '#f52516' : '' }})}
          >
            רק מפתח ({summary?.key ?? 0})
          </Chip>

          <Chip
            size="md"
            variant={filters?.onlyActive ? 'solid' : 'outlined'}
            color={filters?.onlyActive ? 'success' : 'neutral'}
            onClick={onToggleOnlyActive}
            sx={sx.filterChip}
            startDecorator={iconUi({id: 'active', sx: { color: !filters?.onlyActive ? '#f52516' : '' }})}
          >
            רק פעילים ({summary?.active ?? 0})
          </Chip>

          <Chip
            size="md"
            variant="soft"
            color="danger"
            disabled={!hasActiveFilters}
            onClick={onResetFilters}
            sx={sx.resetChip}
            startDecorator={iconUi({id: 'reset', sx: { color: !hasActiveFilters ? '#f52516' : '' }})}
          >
            איפוס
          </Chip>
        </Box>

        <Box sx={sx.createBtnWrap}>
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


    </Box>
  )
}
