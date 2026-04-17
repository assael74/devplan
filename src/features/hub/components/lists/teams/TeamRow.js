// hub/components/lists/teams/TeamRow.js

import React, { useMemo } from 'react'
import { Box, Typography, Avatar, IconButton } from '@mui/joy'
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded'

import { iconUi } from '../../../../../ui/core/icons/iconUi.js'
import { listSx as sx } from '../list.sx.js'

import {
  buildTeamSubLine,
  isProjectTeam,
} from './logic/TeamRow.logic'

import { resolveEntityAvatar } from '../../../../../ui/core/avatars/fallbackAvatar.js'

function ColorDot({ active }) {
  let bg = '#9e9e9e'
  if (active === true) bg = '#2e7d32'
  if (active === false) bg = '#d32f2f'
  return <Box sx={sx.colorDot(bg)} />
}

export default function TeamRow({
  team,
  isMobile = false,
  onSelect,
  selected,
  onOpenRoute,
  onOpenActions,
}) {
  const subLine = useMemo(() => buildTeamSubLine(team), [team])
  const teamName = team?.teamName || ''
  const src = resolveEntityAvatar({ entityType: 'team', entity: team, parentEntity: team?.club, subline: team?.club?.name, })

  const handleRowClick = (e) => {
    e.stopPropagation()

    if (isMobile) {
      if (onOpenRoute) {
        onOpenRoute(team)
        return
      }
      onSelect(team)
      return
    }

    onSelect(team)
  }

  return (
    <Box
      onMouseDown={(e) => e.stopPropagation()}
      onClick={handleRowClick}
      sx={sx.row(selected)}
    >
      <Avatar size="sm" src={src}>
        {teamName || '?'}
      </Avatar>

      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ColorDot active={team?.active} />

          <Typography level="title-sm" noWrap sx={{ minWidth: 0 }}>
            {team?.teamName}
          </Typography>

          {isProjectTeam(team) && (
            <Box sx={{ flexShrink: 0, display: 'inline-flex', alignItems: 'center' }}>
              {iconUi({ id: 'project', sx: { fontSize: 11, color: '#4fbc54' } })}
            </Box>
          )}

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
            onOpenActions(team)
          }}
        >
          <MoreVertRoundedIcon />
        </IconButton>
      )}
    </Box>
  )
}
