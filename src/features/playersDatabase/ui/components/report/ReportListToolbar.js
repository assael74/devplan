// features/playersDatabase/ui/components/report/ReportListToolbar.js

import {
  Box,
  Typography,
} from '@mui/joy'

import { getEntityColors } from '../../../../../ui/core/theme/Colors.js'
import { reportListToolbarSx as sx } from './sx/reportListToolbar.sx.js'

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
