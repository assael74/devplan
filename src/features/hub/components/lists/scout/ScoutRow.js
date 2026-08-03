// features/hub/components/lists/scout/ScoutRow.js

import React from 'react'
import { Box, Typography, Avatar, IconButton } from '@mui/joy'

import playerImage from '../../../../../ui/core/images/playerImage.jpg'
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
          className="hub-row-action"
          sx={sx.actionButton(selected)}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation()
            onOpenActions(scout)
          }}
        >
          {iconUi({ id: 'more', size: 'small' })}
        </IconButton>
      )}
    </Box>
  )
}
