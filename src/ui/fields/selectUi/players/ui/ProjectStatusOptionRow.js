// ui/fields/selectUi/players/ui/ProjectStatusOptionRow.js

import { Box, Typography, ListItemDecorator } from '@mui/joy'
import { statusSx as sx } from '../sx/status.sx'
import { iconUi } from '../../../../core/icons/iconUi.js'

export default function ProjectStatusOptionRow({ opt }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
      <ListItemDecorator sx={{ minInlineSize: 34 }}>
        <Box sx={sx.row}>
          {iconUi({ id: opt.idIcon, sx: { color: opt.color } })}
        </Box>
      </ListItemDecorator>

      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography level="body-sm" fontWeight="lg" noWrap>
          {opt.label}
        </Typography>
      </Box>
    </Box>
  )
}
