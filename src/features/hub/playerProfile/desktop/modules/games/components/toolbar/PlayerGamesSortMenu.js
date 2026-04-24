// playerProfile/desktop/modules/games/components/toolbar/PlayerGamesSortMenu.js

import React from 'react'

import { SortMenuButton } from '../../../../../../../../ui/patterns/sort/index.js'
import { toolbarSx as sx } from '../../sx/toolbar.sx.js'

import { PLAYER_GAMES_SORT_OPTIONS } from '../../../../../sharedLogic'

export default function PlayerGamesSortMenu({
  sortBy = 'date',
  sortDirection = 'desc',
  onChangeSortBy,
  onChangeSortDirection,
}) {
  return (
    <SortMenuButton
      labelPrefix="מיון:"
      sortBy={sortBy}
      sortDirection={sortDirection}
      sortOptions={PLAYER_GAMES_SORT_OPTIONS}
      onChangeSortBy={onChangeSortBy}
      onChangeSortDirection={onChangeSortDirection}
      buttonSx={sx.sortButton}
      menuSx={sx.sortMenu}
      minButtonWidth={150}
      minMenuWidth={220}
    />
  )
}
