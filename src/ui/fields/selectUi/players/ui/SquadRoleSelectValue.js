// ui/fields/selectUi/players/ui/SquadRoleSelectValue.js

import { Box, Typography, Chip } from '@mui/joy'
import { iconUi } from '../../../../core/icons/iconUi.js'
import { formatSquadRoleWeight } from '../logic/squadRoleSelect.logic.js'

export default function SquadRoleSelectValue({ opt }) {
  if (!opt) return null

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, minWidth: 0 }}>
      <Typography level="body-sm" fontWeight="lg" noWrap startDecorator={iconUi({id: opt.idIcon, sx: {color: opt.color}})}>
        {opt.label}
      </Typography>
    </Box>
  )
}
