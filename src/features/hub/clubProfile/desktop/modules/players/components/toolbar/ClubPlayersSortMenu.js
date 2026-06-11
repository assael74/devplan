// clubProfile/desktop/modules/players/components/toolbar/ClubPlayersSortMenu.js

import React from 'react'

import { SortMenuButton } from '../../../../../../../../ui/patterns/sort/index.js'

import { CLUB_PLAYERS_SORT_OPTIONS } from '../../../../../sharedLogic/index.js'

export default function ClubPlayersSortMenu({
  sortBy = 'name',
  sortDirection = 'asc',
  onChangeSortBy,
  onChangeSortDirection,
}) {
  return (
    <SortMenuButton
      labelPrefix="מיון:"
      sortBy={sortBy}
      sortDirection={sortDirection}
      sortOptions={CLUB_PLAYERS_SORT_OPTIONS}
      onChangeSortBy={onChangeSortBy}
      onChangeSortDirection={onChangeSortDirection}
      width={152}
      compact
    />
  )
}
