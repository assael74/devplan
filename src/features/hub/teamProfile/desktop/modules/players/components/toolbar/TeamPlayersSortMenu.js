// teamProfile/desktop/modules/players/components/toolbar/TeamPlayersSortMenu.js

import React from 'react'

import { SortMenuButton } from '../../../../../../../../ui/patterns/sort/index.js'
import { toolbarSx as sx } from '../../sx/toolbar.sx.js'

const TEAM_PLAYERS_SORT_OPTIONS = [
  { id: 'level', label: 'פוטנציאל', idIcon: 'insights', defaultDirection: 'desc' },
  { id: 'age', label: 'גיל', idIcon: 'calendar', defaultDirection: 'asc' },
  { id: 'name', label: 'שם', idIcon: 'players', defaultDirection: 'asc' },
  { id: 'timeRate', label: 'דקות משחק', idIcon: 'playTimeRate', defaultDirection: 'desc' },
  { id: 'goals', label: 'שערים', idIcon: 'goal', defaultDirection: 'desc' },
  { id: 'assists', label: 'בישולים', idIcon: 'assists', defaultDirection: 'desc' },
  { id: 'squadRole', label: 'מעמד', idIcon: 'star', defaultDirection: 'desc' },
  { id: 'projectStatus', label: 'סטטוס פרויקט', idIcon: 'project', defaultDirection: 'asc' },
]

export default function TeamPlayersSortMenu({
  sortBy = 'level',
  sortDirection = 'desc',
  onChangeSortBy,
  onChangeSortDirection,
}) {
  return (
    <SortMenuButton
      labelPrefix="מיון:"
      sortBy={sortBy}
      sortDirection={sortDirection}
      sortOptions={TEAM_PLAYERS_SORT_OPTIONS}
      onChangeSortBy={onChangeSortBy}
      onChangeSortDirection={onChangeSortDirection}
      buttonSx={sx.sortButton}
      menuSx={sx.sortMenu}
    />
  )
}
