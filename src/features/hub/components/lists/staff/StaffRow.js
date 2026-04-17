// features/hub/components/lists/staff/StaffRow.js

import React from 'react'
import { Sheet, Box, Typography, Chip, Avatar, IconButton } from '@mui/joy'
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded'

import roleImage from '../../../../../ui/core/images/roleImage.png'
import { iconUi } from '../../../../../ui/core/icons/iconUi.js'
import { listSx as sx } from '../list.sx.js'

function ColorDot({ active }) {
  let bg = '#9e9e9e'
  if (active === true) bg = '#2e7d32'
  if (active === false) bg = '#d32f2f'
  return <Box sx={sx.colorDot(bg)} />
}

export default function StaffRow({
  staff,
  selected,
  onSelect,
  actions,
  onOpenActions
}) {
  const fullName = staff?.fullName || 'איש צוות'
  const roleLabel = staff?.roleLabel || staff?.typeLabel || staff?.type || ''
  const subline = staff?.subline || ''
  const photo = staff?.photo || ''
  const idIcon = staff?.idIcon || ''

  return (
    <Box
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => {
        e.stopPropagation()
        onSelect(staff)
      }}
      sx={sx.row(selected)}
    >
      <Avatar size="sm" src={staff?.photo || roleImage}>
        {fullName?.[0] || '?'}
      </Avatar>

      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ColorDot active={staff?.active} />

          <Typography level="title-sm" noWrap sx={{ minWidth: 0 }}>
            {fullName}
          </Typography>

        </Box>

        <Typography level="body-xs" sx={sx.subLine} noWrap>
          {subline}
        </Typography>
      </Box>

      {!!onOpenActions && (
        <IconButton
          size="sm"
          variant="plain"
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation()
            onOpenActions(staff)
          }}
        >
          <MoreVertRoundedIcon />
        </IconButton>
      )}
    </Box>
  )
}
