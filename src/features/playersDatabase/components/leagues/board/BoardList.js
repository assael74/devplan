// src/features/playersDatabase/components/leagues/board/BoardList.js

import React from 'react'
import {
  Box,
  Button,
  Typography,
} from '@mui/joy'

import {
  getLeagueLevelLabel,
  getLeagueRegionLabel,
} from '../leagueUtils.js'
import { SortMenuButton } from '../../../../../ui/patterns/sort/index.js'
import { listSx as sx } from './sx/list.sx.js'

export default function BoardList({
  leagues,
  selectedId,
  sortBy,
  sortDirection,
  sortOptions,
  onSortByChange,
  onSortDirectionChange,
  onSelect,
}) {
  return (
    <Box sx={sx.root}>
      <Box sx={sx.toolbar}>
        <SortMenuButton
          labelPrefix="מיון:"
          sortBy={sortBy}
          sortDirection={sortDirection}
          sortOptions={sortOptions}
          onChangeSortBy={onSortByChange}
          onChangeSortDirection={onSortDirectionChange}
          width={260}
          compact
        />
      </Box>

      <Box className="dpScrollThin" sx={sx.list}>
        {leagues.map(league => {
          const selected = league.id === selectedId

          return (
            <Button
              key={league.id}
              size="sm"
              variant="plain"
              color="neutral"
              className={selected ? 'isSelected' : ''}
              onClick={() => onSelect(league.id)}
              sx={sx.item}
            >
              <Box sx={sx.text}>
                <Typography
                  level="body-sm"
                  sx={sx.title}
                >
                  {league.ageGroupLabel}
                  {' | '}
                  {league.leagueName}
                </Typography>

                <Typography
                  level="body-xs"
                  sx={sx.meta}
                >
                  {getLeagueLevelLabel(league.level)}
                  {' | '}
                  {getLeagueRegionLabel(league.region)}
                </Typography>
              </Box>
            </Button>
          )
        })}
      </Box>
    </Box>
  )
}
