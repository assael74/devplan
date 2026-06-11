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
  size = 'sm',
  width = 160,
  fullWidth = false,
  compact = false,
}) {
  const normalized = normalizeSortState(sortBy, sortDirection)

  const handlePick = nextSortBy => {
    const nextState = buildNextSortState({
      currentBy: normalized.by,
      currentDirection: normalized.direction,
      nextSortBy,
      sortOptions,
    })

    onChangeSortBy?.(nextState.by)
    onChangeSortDirection?.(nextState.direction)
  }

  const rootWidth = fullWidth ? '100%' : width
  const selectedLabel = getSortOptionLabel(sortOptions, normalized.by, labelPrefix)

  return (
    <Box sx={sx.root({ width: rootWidth })}>
      <Dropdown>
        <MenuButton
          size={size}
          variant="soft"
          startDecorator={iconUi({
            id: getSortDirectionIcon(normalized.direction),
            sx: sx.directionIcon,
          })}
          sx={sx.sortButton({ compact })}
        >
          <Typography level="body-sm" noWrap sx={sx.buttonLabel}>
            {compact ? selectedLabel : `${labelPrefix} ${selectedLabel}`}
          </Typography>

          <Box sx={{ flex: 1 }} />

          {iconUi({
            id: 'arrowDown',
            sx: sx.buttonIcon,
          })}
        </MenuButton>

        <Menu
          placement="bottom-start"
          size={size}
          sx={sx.sortMenu({ width: rootWidth })}
        >
          {sortOptions.map(item => {
            const isActive = normalized.by === item.id

            return (
              <MenuItem
                key={item.id}
                onClick={() => handlePick(item.id)}
                sx={isActive ? sx.sortMenuItemActive : sx.sortMenuItem}
              >
                <ListItemContent sx={sx.menuItemContent}>
                  <Typography
                    level="body-sm"
                    noWrap
                    sx={isActive ? sx.menuItemTextActive : sx.menuItemText}
                  >
                    {item.label}
                  </Typography>
                </ListItemContent>

                <ListItemDecorator sx={sx.menuItemDecorator}>
                  {isActive
                    ? iconUi({
                        id: getSortDirectionIcon(normalized.direction),
                        sx: sx.menuDirectionIcon,
                      })
                    : null}
                </ListItemDecorator>
              </MenuItem>
            )
          })}
        </Menu>
      </Dropdown>
    </Box>
  )
}
