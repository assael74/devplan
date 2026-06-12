// src/features/hub/components/lists/staff/StaffRow.js

import React from 'react'
import { Box, Typography, Avatar, IconButton } from '@mui/joy'
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded'

import roleImage from '../../../../../ui/core/images/roleImage.png'
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
  onOpenActions,
}) {
  const fullName = staff?.fullName || 'איש צוות'
  const roleLabel = staff?.roleLabel || staff?.typeLabel || staff?.type || ''
  const subline = staff?.subline || ''

  return (
    <Box
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => {
        e.stopPropagation()
        onSelect?.(staff)
      }}
      sx={{
        ...sx.row(selected),
        width: '100%',
        minWidth: 0,
        boxSizing: 'border-box',
      }}
    >
      <Avatar size="sm" src={staff?.photo || roleImage}>
        {fullName?.[0] || '?'}
      </Avatar>

      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
          <ColorDot active={staff?.active} />

          <Typography level="title-sm" noWrap sx={{ minWidth: 0 }}>
            {fullName}
          </Typography>
        </Box>

        <Typography level="body-xs" sx={sx.subLine} noWrap>
          {roleLabel || subline}
        </Typography>

        {roleLabel && subline ? (
          <Typography level="body-xs" sx={sx.subLine} noWrap>
            {subline}
          </Typography>
        ) : null}
      </Box>

      {actions ? (
        <Box
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
          sx={{ flexShrink: 0 }}
        >
          {actions}
        </Box>
      ) : null}

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
