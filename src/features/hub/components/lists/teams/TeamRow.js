// hub/components/lists/teams/TeamRow.js

import React, { useMemo } from 'react'
import { Box, Typography, Avatar, IconButton } from '@mui/joy'
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded'
import { rowSx } from '../../layout/hubComponents.sx.js'
import { iconUi } from '../../../../../ui/core/icons/iconUi.js'

import {
  buildTeamSubLine,
  isProjectTeam,
} from './logic/TeamRow.logic'
import { teamRowSx, colorDotSx } from './sx/TeamRow.sx'
import { resolveEntityAvatar } from '../../../../../ui/core/avatars/fallbackAvatar.js'

function ColorDot({ active }) {
  let bg = '#9e9e9e'
  if (active === true) bg = '#2e7d32'
  if (active === false) bg = '#d32f2f'
  return <Box sx={colorDotSx(bg)} />
}

export default function TeamRow({ team, onSelect, onOpenActions, selected }) {
  const subLine = useMemo(() => buildTeamSubLine(team), [team])
  const teamName = team?.teamName?.[0]
  const src = resolveEntityAvatar({ entityType: 'team', entity: team, parentEntity: team?.club, subline: team?.club?.name, })

  return (
    <Box
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => {
        e.stopPropagation()
        onSelect(team)
      }}
      sx={rowSx(selected)}
    >
      <Avatar size="sm" src={src}>
        {teamName || '?'}
      </Avatar>

      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Box sx={teamRowSx.topLine}>
          <ColorDot active={team?.active} />

          <Typography level="title-sm" noWrap sx={{ minWidth: 0 }}>
            {team?.teamName}
          </Typography>

          {isProjectTeam(team) && (
            <Box sx={teamRowSx.iconWrap}>
              {iconUi({ id: 'project', sx: { fontSize: 11, color: '#4fbc54' } })}
            </Box>
          )}

        </Box>

        <Typography level="body-xs" sx={teamRowSx.subLine} noWrap>
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
            onOpenActions(team)
          }}
        >
          <MoreVertRoundedIcon />
        </IconButton>
      )}
    </Box>
  )
}
