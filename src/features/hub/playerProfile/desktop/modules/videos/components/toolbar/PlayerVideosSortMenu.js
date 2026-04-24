// playerProfile/desktop/modules/videos/components/toolbar/PlayerVideosSortMenu.js

import React from 'react'

import { SortMenuButton } from '../../../../../../../../ui/patterns/sort/index.js'
import { toolbarSx as sx } from '../../sx/toolbar.sx.js'

import { PLAYER_VIDEOS_SORT_OPTIONS } from '../../../../../sharedLogic'

export default function TeamVideosSortMenu({
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
      sortOptions={PLAYER_VIDEOS_SORT_OPTIONS}
      onChangeSortBy={onChangeSortBy}
      onChangeSortDirection={onChangeSortDirection}
      buttonSx={sx.sortButton}
      menuSx={sx.sortMenu}
      minButtonWidth={150}
      minMenuWidth={220}
    />
  )
}
