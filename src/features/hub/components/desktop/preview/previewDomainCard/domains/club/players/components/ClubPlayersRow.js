import React from 'react'
import { Avatar, Box, Typography, Tooltip, IconButton, Chip } from '@mui/joy'
import { iconUi } from '../../../../../../../../../../ui/core/icons/iconUi'
import playerImage from '../../../../../../../../../../ui/core/images/playerImage.jpg'
import { tableSx as sx } from '../sx/clubPlayersTable.sx'
import JoyStarRating from '../../../../../../../../../../ui/domains/ratings/JoyStarRating'

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

function formatTimeRef(value) {
  const n = Number(value)
  if (!Number.isFinite(n) || n <= 0) return '0'
  return String(Math.round(n))
}

export default function ClubPlayersRow({ row, onEdit }) {
  const keyLabel = row?.isKey === true
  const autoLabel = row?.isAutoEligible === true
  const squadRoleLabe = row?.squadRoleMeta?.label || 'לא הוגדר'

  return (
    <Box sx={{ ...sx.rowCardSx, ...(row?.isKey ? sx.rowCardKeySx : {}) }}>
      <Box sx={sx.playerCellSx}>
        <Box sx={sx.avatarBoxSx}>
          <Avatar src={row?.player?.photo || playerImage} />
        </Box>

        <Box sx={sx.playerTextWrapSx}>
          <Typography level="body-md" sx={sx.playerNameSx}>
            {row?.fullName || ''}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap' }}>
            <Typography sx={sx.playerMetaSx}>
              {row?.teamName || 'ללא קבוצה'}
            </Typography>

            {keyLabel ? (
              <Chip size="sm" variant="outlined" color="primary" startDecorator={iconUi({id: 'keyPlayer'})}>
                מפתח
              </Chip>
            ) : null}
          </Box>
        </Box>
      </Box>

      <Box sx={sx.centerCellSx}>
        <JoyStarRating value={Number(row?.level || 0)} size="sm" />
      </Box>

      <Box sx={sx.centerCellSx}>
        <Typography level="body-sm" sx={sx.playerNameSx}>
          {row?.position || '—'}
        </Typography>
      </Box>

      <Box sx={sx.centerCellSx}>
        <Typography level="body-sm" sx={sx.playerNameSx}>
          {formatTimeRef(row?.timeRef)}
        </Typography>
      </Box>

      <Box sx={sx.centerCellSx}>
        <Typography level="body-sm" sx={sx.playerNameSx}>
          {squadRoleLabe}
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
