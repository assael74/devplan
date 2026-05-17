// teamProfile/desktop/modules/players/components/toolbar/TeamPlayersSortMenu.js

import React from 'react'

import { SortMenuButton } from '../../../../../../../../ui/patterns/sort/index.js'
import { TEAM_PLAYERS_SORT_OPTIONS } from '../../../../../sharedLogic/players/index.js'

import { toolbarSx as sx } from '../../sx/toolbar.sx.js'

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
