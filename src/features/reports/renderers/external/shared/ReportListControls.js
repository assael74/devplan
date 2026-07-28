// features/reports/renderers/external/shared/ReportListControls.js

import { Box } from '@mui/joy'

import { SortMenuButton } from '../../../../../ui/patterns/sort/index.js'
import ReportViewToggle from './ReportViewToggle.js'
import { reportListSx as sx } from './reportList.sx.js'

export default function ReportListControls({
  view,
  viewOptions = [],
  onChangeView,
  sortBy,
  sortDirection,
  sortOptions = [],
  onChangeSortBy,
  onChangeSortDirection,
}) {
  return (
    <Box sx={sx.controls}>
      <Box sx={sx.sortControl}>
        <SortMenuButton
          labelPrefix='מיון:'
          sortBy={sortBy}
          sortDirection={sortDirection}
          sortOptions={sortOptions}
          onChangeSortBy={onChangeSortBy}
          onChangeSortDirection={onChangeSortDirection}
          width={150}
          compact
        />
      </Box>

      <Box sx={sx.viewControl}>
        <ReportViewToggle
          value={view}
          options={viewOptions}
          onChange={onChangeView}
          ariaLabel='בחירת שכבת ביצוע'
        />
      </Box>
    </Box>
  )
}
