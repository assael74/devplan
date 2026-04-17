// src/features/hub/components/lists/privates/PrivateRow.js

import React, { useMemo } from 'react'
import { Box, Typography, Avatar, IconButton } from '@mui/joy'
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded'
import playerImage from '../../../../../ui/core/images/playerImage.jpg'

import { iconUi } from '../../../../../ui/core/icons/iconUi.js'
import { listSx as sx } from '../list.sx.js'

import {
  buildPlayerFullName,
  buildPlayerSubLine,
  isProjectPlayer,
  isKeyPlayer,
} from './logic/privateRow.logic'

function ColorDot({ active }) {
  let bg = '#9e9e9e'
  if (active === true) bg = '#2e7d32'
  if (active === false) bg = '#d32f2f'
  return <Box sx={sx.colorDot(bg)} />
}

export default function PrivateRow({
  player,
  isMobile = false,
  onSelect,
  selected,
  onOpenRoute,
  onOpenActions,
}) {
  const fullName = useMemo(() => buildPlayerFullName(player), [player])
  const subLine = useMemo(() => buildPlayerSubLine(player), [player])

  const handleRowClick = (e) => {
    e.stopPropagation()

    if (isMobile) {
      if (onOpenRoute) {
        onOpenRoute(player)
        return
      }
      onSelect(player)
      return
    }

    onSelect(player)
  }

  return (
    <Box
      onMouseDown={(e) => e.stopPropagation()}
      onClick={handleRowClick}
      sx={sx.row(selected)}
    >
      <Avatar size="sm" src={player?.photo || playerImage}>
        {fullName?.[0] || '?'}
      </Avatar>

      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ColorDot active={player?.active} />

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
            onOpenActions(player)
          }}
        >
          <MoreVertRoundedIcon />
        </IconButton>
      )}
    </Box>
  )
}
