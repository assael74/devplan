// ui/fields/selectUi/players/ui/ProjectStatusSelectValue.js

import { Box, Chip, Typography } from '@mui/joy'
import { statusSx as sx } from '../sx/status.sx'
import { iconUi } from '../../../../core/icons/iconUi.js'

export default function ProjectStatusSelectValue({ opt }) {
  if (!opt) return null

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, minWidth: 0 }}>
      <Chip
        size="sm"
        variant="soft"
        sx={sx.value(opt)}
        startDecorator={iconUi({ id: opt.idIcon })}
      >
        <Typography level="body-sm" fontWeight="lg" noWrap sx={{ color: 'inherit' }}>
          {opt.label}
        </Typography>
      </Chip>
    </Box>
  )
}
