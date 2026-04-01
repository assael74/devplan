// preview/previewDomainCard/domains/team/players/components/TeamPlayersRow.js
import React from 'react'
import { Avatar, Box, Typography, Tooltip, IconButton, Badge } from '@mui/joy'
import { iconUi } from '../../../../../../../../../ui/core/icons/iconUi'
import playerImage from '../../../../../../../../../ui/core/images/playerImage.jpg'
import { getEntityColors } from '../../../../../../../../../ui/core/theme/Colors.js'
import { getProjectStatusMeta } from '../logic/teamPlayers.helpers'
import { getSquadRoleMeta } from '../../../../../../../../../shared/players/player.squadRole.utils.js'
import { tableSx as sx } from '../sx/teamPlayersTable.sx'
import JoyStarRating from '../../../../../../../../../ui/domains/ratings/JoyStarRating'

const c = getEntityColors('players')

export function LevelStars({ label, value }) {
  const v = value === 0 || value ? Number(value) : null

  return (
    <Box sx={{ mt: -1 }}>
      <Typography level="body-xs" sx={{ opacity: 0.75, lineHeight: 1 }}>
        {label}
      </Typography>
      <JoyStarRating value={v} size="sm" />
    </Box>
  )
}

export default function TeamPlayersRow({ row, onEdit }) {
  const squadRoleMeta = getSquadRoleMeta(row, c)
  const statusMeta = getProjectStatusMeta(row?.projectStatus)
  const positionLabel = row?.position || 'ללא עמדה'
  const timeRateStr = row?.timeRate || '0%'
  const activeColor = row?.active ? "success"  : "danger"

  return (
    <Box sx={{ ...sx.rowCardSx, ...(row?.isKey ? sx.rowCardKeySx : {}) }}>
      <Box sx={sx.playerCellSx}>
        <Box sx={sx.avatarBoxSx}>
          <Badge badgeInset="14%" size="sm" anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }} color={activeColor}>
            <Avatar src={row?.player?.photo || playerImage} />
          </Badge>
        </Box>

        <Box sx={sx.playerTextWrapSx}>
          <Typography level="body-md" sx={sx.playerNameSx}>
            {row?.name || ''}
          </Typography>
          <Typography sx={sx.playerMetaSx} startDecorator={iconUi({id: squadRoleMeta.iconId, sx:{ color: squadRoleMeta.color }})}>
            {squadRoleMeta.label}
          </Typography>
        </Box>
      </Box>

      <Box sx={sx.centerCellSx}>
        <LevelStars value={Number(row?.levelPotential || 0)} label="פוטנציאל" />
      </Box>

      <Box sx={sx.centerCellSx}>
        {statusMeta && (
          <Tooltip title={statusMeta.labelH}>
            <Box sx={{ ml: 1.5 }}>
              {iconUi({ id: statusMeta.idIcon, size: 'lg', sx: { color: statusMeta.color }, })}
            </Box>
          </Tooltip>
        )}
      </Box>

      <Box sx={sx.centerCellSx}>
        <Typography level="body-sm" sx={sx.playerNameSx}>
          {positionLabel}
        </Typography>
      </Box>

      <Box sx={sx.centerCellSx}>
        <Typography level="body-sm" sx={sx.playerNameSx}>
          {timeRateStr}
        </Typography>
      </Box>

      <Box sx={sx.centerCellSx}>
        <Tooltip title="עריכת שחקן">
          <IconButton size="sm" onClick={onEdit}>
            {iconUi({ id: 'more' })}
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  )
}
