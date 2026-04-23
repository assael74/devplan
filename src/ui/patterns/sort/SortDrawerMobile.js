// ui/patterns/sort/SortDrawerMobile.js

import React from 'react'
import {
  Drawer,
  Sheet,
  Box,
  Typography,
  ModalClose,
  Button,
} from '@mui/joy'

import { iconUi } from '../../core/icons/iconUi.js'
import { sortSx as sx } from './sx/sort.sx.js'
import {
  DEFAULT_SORT_BY,
  DEFAULT_SORT_DIRECTION,
  buildNextSortState,
  getSortDirectionIcon,
  normalizeSortState,
} from './sort.utils.js'

export default function SortDrawerMobile({
  open,
  onClose,
  title = 'מיון',
  sortBy = DEFAULT_SORT_BY,
  sortDirection = DEFAULT_SORT_DIRECTION,
  sortOptions = [],
  onChangeSortBy,
  onChangeSortDirection,
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
    onClose?.()
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      anchor="bottom"
      size="md"
      variant="plain"
      slotProps={{
        content: {
          sx: {
            bgcolor: 'transparent',
            p: 0,
            boxShadow: 'none',
            alignItems: 'stretch',
            justifyContent: 'flex-end',
          },
        },
      }}
    >
      <Sheet sx={sx.drawerSheet}>
        <Box sx={sx.drawerHeader}>
          <Typography level="title-md" sx={{ fontWeight: 700 }}>
            {title}
          </Typography>

          <ModalClose />
        </Box>

        <Box className="dpScrollThin" sx={sx.drawerList}>
          {sortOptions.map((item) => {
            const isActive = normalized.by === item.id

            return (
              <Button
                key={item.id}
                variant="plain"
                color="neutral"
                onClick={() => handlePick(item.id)}
                sx={isActive ? sx.drawerItemActive : sx.drawerItem}
              >
                <Typography
                  level="body-md"
                  sx={isActive ? { color: '#1ED760', fontWeight: 700 } : { fontWeight: 500 }}
                >
                  {item.label}
                </Typography>

                <Box sx={{ flex: 1 }} />

                {isActive
                  ? iconUi({
                      id: getSortDirectionIcon(normalized.direction),
                      sx: { color: '#1ED760', fontSize: 18 },
                    })
                  : null}
              </Button>
            )
          })}
        </Box>
      </Sheet>
    </Drawer>
  )
}
