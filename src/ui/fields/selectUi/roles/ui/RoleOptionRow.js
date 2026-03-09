// ui/fields/selectUi/roles/ui/RoleOptionRow.js
import React from 'react'
import { Box, Typography, Chip, ListItemDecorator } from '@mui/joy'
import { iconUi } from '../../../../core/icons/iconUi.js'
import { formatAff } from '../logic/roleSelect.logic'

export default function RoleOptionRow({ opt }) {
  const aff = formatAff(opt.teamName, opt.clubName)

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0, width: '100%' }}>
      <ListItemDecorator sx={{ minInlineSize: 30 }}>
        <Box
          component="img"
          src={opt.avatar}
          alt=""
          sx={{ width: 25, height: 25, borderRadius: '50%', objectFit: 'cover' }}
        />
      </ListItemDecorator>

      <Box sx={{ minWidth: 0, display: 'flex', flexDirection: 'column', flex: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, minWidth: 0 }}>
          <Typography level="body-sm" fontWeight="lg" noWrap>
            {opt.label}
          </Typography>

          {opt.roleLabelH ? (
            <Chip
              size="sm"
              variant="outlined"
              startDecorator={opt.roleIconId ? iconUi({ id: opt.roleIconId, sx: { width: 10, height: 10, mr: 0.2 } }) : null}
              sx={{ '--Chip-minHeight': '15px', fontSize: 10, px: 0.5 }}
            >
              {opt.roleLabelH}
            </Chip>
          ) : null}
        </Box>

        <Typography level="body-xs" sx={{ fontSize: 8, opacity: aff ? 0.75 : 0.55 }} noWrap>
          {aff || 'ללא שיוך'}
        </Typography>
      </Box>
    </Box>
  )
}
