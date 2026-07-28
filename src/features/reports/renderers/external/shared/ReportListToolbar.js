// features/reports/renderers/external/shared/ReportListToolbar.js

import { Box, Typography } from '@mui/joy'

import { getEntityColors } from '../../../../../ui/core/theme/Colors.js'
import { reportListSx as sx } from './reportList.sx.js'

export default function ReportListToolbar({
  entityType = 'team',
  title = 'רשימת קבוצות',
  headers = [],
}) {
  const colors = getEntityColors(entityType)

  return (
    <Box sx={sx.toolbar(colors)}>
      <Box sx={sx.toolbarMain}>
        <Typography level='title-sm' sx={sx.toolbarTitle}>
          {title}
        </Typography>
      </Box>

      <Box sx={sx.toolbarHeaders}>
        {headers.map(header => (
          <Typography key={header.id} component='span' sx={sx.toolbarHeader}>
            {header.label}
          </Typography>
        ))}
      </Box>
    </Box>
  )
}
