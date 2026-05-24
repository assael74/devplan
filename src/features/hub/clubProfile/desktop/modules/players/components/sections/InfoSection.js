// clubProfile/desktop/modules/players/components/sections/InfoSection.js

import React from 'react'
import { Avatar, Box, Button, Chip, Typography } from '@mui/joy'
import { useNavigate } from 'react-router-dom'

import { iconUi } from '../../../../../../../../ui/core/icons/iconUi.js'
import playerImage from '../../../../../../../../ui/core/images/playerImage.jpg'
import { getEntityColors } from '../../../../../../../../ui/core/theme/Colors.js'
import { getSquadRoleMeta } from '../../../../../../../../shared/players/player.squadRole.utils.js'

import { infoSx as sx } from './sx/info.sx.js'

const c = getEntityColors('players')

const getPlayerId = player => {
  return player?.id || player?.playerId || null
}

const getTeamId = team => {
  return team?.id || team?.teamId || null
}

const getPlayerName = player => {
  return player?.playerFullName || player?.fullName || player?.label || '—'
}

const getTeam = row => {
  return row?.team || row?.player?.team || null
}

const getTeamName = team => {
  return team?.teamName || team?.label || '—'
}

export default function InfoSection({ row }) {
  const navigate = useNavigate()

  const player = row || {}
  const team = getTeam(row)
  const squadRoleMeta = getSquadRoleMeta(row, c)

  const playerId = getPlayerId(player)
  const teamId = getTeamId(team)

  const goToPlayer = event => {
    event.stopPropagation()
    if (playerId) navigate(`/players/${playerId}`)
  }

  const goToTeam = event => {
    event.stopPropagation()
    if (teamId) navigate(`/teams/${teamId}`)
  }

  return (
    <Box sx={sx.root}>
      <Box sx={sx.identityCol}>
        <Box sx={sx.avatarBox}>
          <Avatar src={row?.photo || playerImage} sx={sx.avatar} />

          <Box
            sx={[
              sx.avatarStatusDot,
              row?.active !== false
                ? { bgcolor: 'success.500' }
                : { bgcolor: 'danger.500' },
            ]}
          />

          <Box className="_rowAvatarOverlay" sx={sx.avatarOverlay} />
        </Box>

        <Box sx={sx.nameWrap}>
          <Box sx={sx.nameRow}>
            <Button
              size="sm"
              variant="plain"
              color="neutral"
              disabled={!playerId}
              onClick={goToPlayer}
              sx={sx.nameButton}
            >
              {getPlayerName(player)}
            </Button>

            {squadRoleMeta?.value ? (
              <Chip
                size="sm"
                variant="soft"
                color="warning"
                startDecorator={iconUi({
                  id: squadRoleMeta.iconId,
                  sx: { color: squadRoleMeta.color },
                })}
                sx={sx.roleChip}
              >
                {squadRoleMeta.label}
              </Chip>
            ) : (
              <Chip size="sm" color="danger" variant="soft" sx={sx.roleChip}>
                לא הוגדר מעמד
              </Chip>
            )}
          </Box>

          <Box sx={sx.subMetaInline}>
            <Button
              size="sm"
              variant="plain"
              color="neutral"
              disabled={!teamId}
              onClick={goToTeam}
              sx={sx.teamButton}
            >
              {getTeamName(team)}
            </Button>

            {!!row?.birthLabel ? (
              <Typography level="body-xs" sx={sx.metaText}>
                {row.birthLabel}
              </Typography>
            ) : null}

            {Number.isFinite(row?.age) ? (
              <Typography level="body-xs" sx={sx.metaText}>
                גיל {row.age}
              </Typography>
            ) : null}
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
