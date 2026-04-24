// clubProfile/desktop/modules/teams/components/toolbar/ClubTeamsSortMenu.js

import React from 'react'

import { SortMenuButton } from '../../../../../../../../ui/patterns/sort/index.js'
import { toolbarSx as sx } from '../../sx/toolbar.sx.js'

import { CLUB_TEAMS_SORT_OPTIONS } from '../../../../../sharedLogic/index.js'

export default function ClubTeamsSortMenu({
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
      sortOptions={CLUB_TEAMS_SORT_OPTIONS}
      onChangeSortBy={onChangeSortBy}
      onChangeSortDirection={onChangeSortDirection}
      buttonSx={sx.sortButton}
      menuSx={sx.sortMenu}
      minButtonWidth={150}
      minMenuWidth={220}
    />
  )
}
