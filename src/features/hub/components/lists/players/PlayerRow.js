// hub/components/lists/players/PlayerRow.js
import React, { useMemo } from 'react'
import { Box, Typography, Avatar, IconButton } from '@mui/joy'
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded'
import playerImage from '../../../../../ui/core/images/playerImage.jpg'
import { rowSx } from '../../layout/hubComponents.sx.js'
import { iconUi } from '../../../../../ui/core/icons/iconUi.js'

import {
  buildPlayerFullName,
  buildPlayerSubLine,
  isProjectPlayer,
  isKeyPlayer,
} from './logic/PlayerRow.logic'
import { playerRowSx, colorDotSx } from './sx/PlayerRow.sx'

function ColorDot({ active }) {
  let bg = '#9e9e9e'
  if (active === true) bg = '#2e7d32'
  if (active === false) bg = '#d32f2f'
  return <Box sx={colorDotSx(bg)} />
}

export default function PlayerRow({ player, onSelect, onOpenActions, selected }) {
  const fullName = useMemo(() => buildPlayerFullName(player), [player])
  const subLine = useMemo(() => buildPlayerSubLine(player), [player])

  return (
    <Box
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => {
        e.stopPropagation()
        onSelect?.(player)
      }}
      sx={rowSx(selected)}
    >
      <Avatar size="sm" src={player?.photo || playerImage}>
        {fullName?.[0] || '?'}
      </Avatar>

      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Box sx={playerRowSx.topLine}>
          <ColorDot active={player?.active} />

          <Typography level="title-sm" noWrap sx={{ minWidth: 0 }}>
            {fullName}
          </Typography>

          {isProjectPlayer(player) && (
            <Box sx={playerRowSx.iconWrap}>
              {iconUi({ id: 'project', sx: { fontSize: 11, color: '#4fbc54' } })}
            </Box>
          )}

          {isKeyPlayer(player) && (
            <Box sx={playerRowSx.iconWrap}>
              {iconUi({ id: 'keyPlayer', sx: { fontSize: 11, color: '#4fbc54' } })}
            </Box>
          )}
        </Box>

        <Typography level="body-xs" sx={playerRowSx.subLine} noWrap>
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
