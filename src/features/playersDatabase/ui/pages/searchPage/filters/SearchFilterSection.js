// features/playersDatabase/ui/pages/searchPage/filters/SearchFilterSection.js

import { Box, Typography } from '@mui/joy'
import { searchFiltersSx as sx } from '../sx/searchFilters.sx.js'

export default function SearchFilterSection({ title, description, children }) {
  return (
    <Box sx={sx.section}>
      <Box sx={sx.sectionHeader}>
        <Typography level='title-sm' sx={sx.sectionTitle}>{title}</Typography>
        {description ? <Typography level='body-xs' sx={sx.sectionDescription}>{description}</Typography> : null}
      </Box>
      {children}
    </Box>
  )
}
