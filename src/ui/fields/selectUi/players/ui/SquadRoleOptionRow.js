// ui/fields/selectUi/players/ui/SquadRoleOptionRow.js

import { Box, Typography } from '@mui/joy'
import { iconUi } from '../../../../core/icons/iconUi.js'

export default function SquadRoleOptionRow({ opt }) {
  if (!opt) return null

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
      {iconUi({id: opt.idIcon, sx: {color: opt.color}})}

      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography level="body-sm" fontWeight="lg" noWrap>
          {opt.label}
        </Typography>
      </Box>
    </Box>
  )
}
