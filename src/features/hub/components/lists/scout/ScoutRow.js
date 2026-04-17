// features/hub/components/lists/scout/ScoutRow.js

import React from 'react'
import { Sheet, Box, Typography, Chip, Avatar, IconButton } from '@mui/joy'
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded'

import playerImage from '../../../../../ui/core/images/playerImage.jpg'
import { iconUi } from '../../../../../ui/core/icons/iconUi.js'
import { listSx as sx } from '../list.sx.js'

function ColorDot({ active }) {
  let bg = '#9e9e9e'
  if (active === true) bg = '#2e7d32'
  if (active === false) bg = '#d32f2f'
  return <Box sx={sx.colorDot(bg)} />
}

export default function ScoutRow({
  scout,
  selected,
  onSelect,
  actions,
  onOpenActions
}) {
  const fullName = scout?.title || ''
  const subLine = scout?.subline || ''
  const photo = scout?.photo || ''
  const idIcon = scout?.idIcon || ''

  return (
    <Box
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => {
        e.stopPropagation()
        onSelect(scout)
      }}
      sx={sx.row(selected)}
    >
      <Avatar size="sm" src={scout?.photo || playerImage}>
        {fullName?.[0] || '?'}
      </Avatar>

      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ColorDot active={scout?.active} />

          <Typography level="title-sm" noWrap sx={{ minWidth: 0 }}>
            {fullName}
          </Typography>

        </Box>

        <Typography level="body-xs" sx={sx.subLine} noWrap>
          {subLine}
        </Typography>
      </Box>

      {!!onOpenActions && (
        <IconButton
          size="sm"
          variant="plain"
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation()
            onOpenActions(scout)
          }}
        >
          <MoreVertRoundedIcon />
        </IconButton>
      )}
    </Box>
  )
}
