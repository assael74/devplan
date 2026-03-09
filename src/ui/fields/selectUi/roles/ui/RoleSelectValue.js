// ui/fields/selectUi/roles/ui/RoleSelectValue.js
import React from 'react'
import { Box, Typography, Chip } from '@mui/joy'
import { iconUi } from '../../../../core/icons/iconUi.js'
import { formatAff } from '../logic/roleSelect.logic'

export default function RoleSelectValue({ opt }) {
  if (!opt) return null

  const aff = formatAff(opt.teamName, opt.clubName)
  const role = opt.roleLabelH

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, minWidth: 0 }}>
      <Box
        component="img"
        src={opt.avatar}
        alt=""
        sx={{ width: 22, height: 22, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
      />

      <Typography level="body-sm" fontWeight="lg" noWrap sx={{ minWidth: 0 }}>
        {opt.label}
      </Typography>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, minWidth: 0, flexShrink: 0 }}>
        {role ? (
          <Chip
            size="sm"
            variant="soft"
            startDecorator={opt.roleIconId ? iconUi({ id: opt.roleIconId }) : null}
            sx={{ '--Chip-minHeight': '20px', fontSize: 10, px: 0.6, maxWidth: 160 }}
          >
            <Typography level="body-xs" noWrap sx={{ fontSize: 10 }}>
              {role}
            </Typography>
          </Chip>
        ) : null}

        {aff ? (
          <Chip
            size="sm"
            variant="outlined"
            sx={{ '--Chip-minHeight': '20px', fontSize: 10, px: 0.6, maxWidth: 190 }}
          >
            <Typography level="body-xs" noWrap sx={{ fontSize: 10 }}>
              {aff}
            </Typography>
          </Chip>
        ) : null}
      </Box>
    </Box>
  )
}
