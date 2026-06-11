// teamProfile/desktop/modules/games/components/toolbar/TeamGamesSortMenu.js

import React from 'react'

import { SortMenuButton } from '../../../../../../../../ui/patterns/sort/index.js'

import { TEAM_GAMES_SORT_OPTIONS } from '../../../../../sharedLogic/games'

export default function TeamGamesSortMenu({
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
      sortOptions={TEAM_GAMES_SORT_OPTIONS}
      onChangeSortBy={onChangeSortBy}
      onChangeSortDirection={onChangeSortDirection}
      width={142}
      compact
    />
  )
}
