// teamProfile/desktop/modules/videos/components/toolbar/TeamVideosSortMenu.js

import React from 'react'

import { SortMenuButton } from '../../../../../../../../ui/patterns/sort/index.js'

import { TEAM_VIDEOS_SORT_OPTIONS } from '../../../../../sharedLogic/videos'

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
      sortOptions={TEAM_VIDEOS_SORT_OPTIONS}
      onChangeSortBy={onChangeSortBy}
      onChangeSortDirection={onChangeSortDirection}
      width={152}
      compact
    />
  )
}
