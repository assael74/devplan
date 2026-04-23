// ui/patterns/sort/SortMenuButton.js

import React from 'react'
import {
  Dropdown,
  Menu,
  MenuButton,
  MenuItem,
  Box,
  ListItemDecorator,
  ListItemContent,
  Typography,
} from '@mui/joy'

import { iconUi } from '../../core/icons/iconUi.js'
import { sortSx as sx } from './sx/sort.sx.js'
import {
  DEFAULT_SORT_BY,
  DEFAULT_SORT_DIRECTION,
  buildNextSortState,
  getSortDirectionIcon,
  getSortOptionLabel,
  normalizeSortState,
} from './sort.utils.js'

export default function SortMenuButton({
  labelPrefix = 'מיון:',
  sortBy = DEFAULT_SORT_BY,
  sortDirection = DEFAULT_SORT_DIRECTION,
  sortOptions = [],
  onChangeSortBy,
  onChangeSortDirection,
  buttonSx,
  menuSx,
  minButtonWidth = 160,
  minMenuWidth = 220,
}) {
  const normalized = normalizeSortState(sortBy, sortDirection)

  const handlePick = (nextSortBy) => {
    const nextState = buildNextSortState({
      currentBy: normalized.by,
      currentDirection: normalized.direction,
      nextSortBy,
      sortOptions,
    })

    onChangeSortBy?.(nextState.by)
    onChangeSortDirection?.(nextState.direction)
  }

  return (
    <Dropdown>
      <MenuButton
        size="sm"
        variant="soft"
        startDecorator={iconUi({
          id: 'arrowDown',
          sx: { color: 'text.secondary', fontSize: 18 },
        })}
        sx={{
          ...sx.sortButton,
          minWidth: minButtonWidth,
          ...buttonSx,
        }}
      >
        {getSortOptionLabel(sortOptions, normalized.by, labelPrefix)}
        <Box sx={{ flex: 1 }} />
        {iconUi({
          id: getSortDirectionIcon(normalized.direction),
          sx: { color: '#1ED760', fontSize: 18 },
        })}
      </MenuButton>

      <Menu
        placement="bottom-start"
        size="sm"
        sx={{
          ...sx.sortMenu,
          minWidth: minMenuWidth,
          ...menuSx,
        }}
      >
        {sortOptions.map((item) => {
          const isActive = normalized.by === item.id

          return (
            <MenuItem
              key={item.id}
              onClick={() => handlePick(item.id)}
              sx={isActive ? sx.sortMenuItemActive : { minHeight: 40, px: 1, borderRadius: 10 }}
            >
              <ListItemContent>
                <Typography
                  level="body-sm"
                  noWrap
                  sx={isActive ? { color: '#1ED760', fontWeight: 700 } : { fontWeight: 500 }}
                >
                  {item.label}
                </Typography>
              </ListItemContent>

              <Box sx={{ flex: 1 }} />

              <ListItemDecorator sx={{ minInlineSize: 24 }}>
                {isActive
                  ? iconUi({
                      id: getSortDirectionIcon(normalized.direction),
                      sx: { color: '#1ED760', fontSize: 18 },
                    })
                  : null}
              </ListItemDecorator>
            </MenuItem>
          )
        })}
      </Menu>
    </Dropdown>
  )
}
