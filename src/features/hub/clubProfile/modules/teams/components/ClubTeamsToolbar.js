// clubProfile/modules/teams/components/ClubTeamsToolbar.js

import React from 'react'
import {
  Box,
  Button,
  Chip,
  Input,
  ListItemDecorator,
  Option,
  Select,
} from '@mui/joy'

import { getEntityColors } from '../../../../../../ui/core/theme/Colors.js'
import { iconUi } from '../../../../../../ui/core/icons/iconUi.js'
import { clubTeamsToolbarSx as sx } from '../sx/clubTeams.toolbar.sx.js'

const c = getEntityColors('teams')

function renderValue(selected, positionBuckets) {
  const value = selected?.value || ''
  const item = positionBuckets.find((p) => p.id === value)

  if (!item) {
    return (
      <>
        <ListItemDecorator>{iconUi({ id: 'layers' })}</ListItemDecorator>
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

export default function ClubTeamsToolbar({
  summary,
  filters,
  filteredCount,
  onOpenInsights,
  onChangeSearch,
  onToggleOnlyActive,
  onToggleOnlyKey,
  onToggleOnlyProject,
  onResetFilters,
  onChangePositionLayer,
}) {
  const hasActiveFilters =
    !!filters?.search ||
    !!filters?.onlyActive ||
    !!filters?.onlyProject

  return (
    <Box sx={sx.toolbar}>
      <Box sx={sx.toolbarTop}>
        <Input
          value={filters?.search || ''}
          onChange={(e) => onChangeSearch(e.target.value)}
          startDecorator={iconUi({ id: 'search' })}
          placeholder="חיפוש שחקן לפי שם / שנתון / עמדה / קבוצה"
          size="sm"
          sx={sx.searchInput}
        />

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
            startDecorator={iconUi({
              id: 'project',
              sx: { color: !filters?.onlyProject ? '#f52516' : '' },
            })}
          >
            רק פרויקט ({summary?.project ?? 0})
          </Chip>

          <Chip
            size="md"
            variant={filters?.onlyActive ? 'solid' : 'outlined'}
            color={filters?.onlyActive ? 'success' : 'neutral'}
            onClick={onToggleOnlyActive}
            sx={sx.filterChip}
            startDecorator={iconUi({
              id: 'active',
              sx: { color: !filters?.onlyActive ? '#f52516' : '' },
            })}
          >
            רק פעילים ({summary?.active ?? 0})
          </Chip>

          <Chip
            size="md"
            variant="soft"
            color="danger"
            disabled={!hasActiveFilters}
            onClick={onResetFilters}
            sx={{ cursor: 'pointer', fontWeight: 700, }}
            startDecorator={iconUi({
              id: 'reset',
              sx: { color: !hasActiveFilters ? '#f52516' : '' },
            })}
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
