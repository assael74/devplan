// features/playersDatabase/ui/pages/searchPage/resultsSidebar/SearchResultsSidebar.js

import {
  Box,
  Card,
  CircularProgress,
  Typography,
} from '@mui/joy'

import SearchResultsFilters from './SearchResultsFilters.js'
import SearchResultsSummary from './SearchResultsSummary.js'
import { searchResultsSidebarSx as sx } from './sx/SearchResultsSidebar.sx.js'

export default function SearchResultsSidebar({
  summary = {},
  entityType = 'player',
  hasLoaded = false,
  loading = false,
  filters = {},
  options = {},
  hasFilters = false,
  onFilterChange,
  onResetFilters,
}) {
  return (
    <Card sx={sx.panel}>
      <Box className='dpScrollThin' sx={sx.content}>
        {loading ? (
          <Box sx={sx.state}>
            <CircularProgress size='sm' />
            <Typography level='body-sm'>טוען מסמכים...</Typography>
          </Box>
        ) : hasLoaded ? (
          <>
            <SearchResultsSummary
              summary={summary}
              entityType={entityType}
            />

            <SearchResultsFilters
              entityType={entityType}
              filters={filters}
              options={options}
              hasFilters={hasFilters}
              onChange={onFilterChange}
              onReset={onResetFilters}
            />
          </>
        ) : (
          <Box sx={sx.state}>
            <Typography level='body-sm' sx={sx.stateTitle}>
              טרם נטענו מסמכים
            </Typography>
            <Typography level='body-xs' sx={sx.stateText}>
              בנה שאילתה ולחץ על טעינת מסמכים כדי להציג סיכום.
            </Typography>
          </Box>
        )}
      </Box>
    </Card>
  )
}
