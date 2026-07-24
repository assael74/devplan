// features/playersDatabase/ui/pages/searchPage/resultsSidebar/SearchResultsSidebar.js

import { Box, Card, CircularProgress, Typography } from '@mui/joy'

import SearchResultsSummary from './SearchResultsSummary.js'
import { searchResultsSidebarSx as sx } from './sx/searchResultsSidebar.sx.js'

export default function SearchResultsSidebar({
  summary = {},
  entityType = 'player',
  hasLoaded = false,
  loading = false,
}) {
  return (
    <Card sx={sx.panel}>
      <Box sx={sx.header}>
        <Typography level='title-md' sx={sx.title}>
          סיכום תוצאות
        </Typography>
        <Typography level='body-xs' sx={sx.subtitle}>
          תמונת מצב של המסמכים שכבר נטענו.
        </Typography>
      </Box>

      <Box className='dpScrollThin' sx={sx.content}>
        {loading ? (
          <Box sx={sx.state}>
            <CircularProgress size='sm' />
            <Typography level='body-sm'>טוען מסמכים...</Typography>
          </Box>
        ) : hasLoaded ? (
          <SearchResultsSummary summary={summary} entityType={entityType} />
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
