// preview/previewDomainCard/domains/club/teams/components/ClubTeamsRow.js

import React from 'react'
import { Avatar, Box, Chip, IconButton, Tooltip, Typography, Badge } from '@mui/joy'
import { iconUi } from '../../../../../../../../../ui/core/icons/iconUi'
import roleImage from '../../../../../../../../../ui/core/images/roleImage.png'
import { getEntityColors } from '../../../../../../../../../ui/core/theme/Colors.js'
import { tableSx as sx } from '../sx/clubTeamsTable.sx'

const c = getEntityColors('teams')

function buildStatusMeta(row) {
  if (row?.active === true) {
    return {
      label: 'פעילה',
      color: 'success',
      badgeColor: 'success',
    }
  }

  return {
    label: 'לא פעילה',
    color: 'neutral',
    badgeColor: 'neutral',
  }
}

function formatLevel(value) {
  const n = Number(value)
  if (!Number.isFinite(n)) return '—'
  return Number.isInteger(n) ? String(n) : n.toFixed(1)
}

export default function ClubTeamsRow({ row, onEdit }) {
  const statusMeta = buildStatusMeta(row)
  const teamName = row?.name || 'קבוצה'
  const teamYear = row?.year || '—'
  const playersCount = Number(row?.playersCount) || 0
  const rolesCount = Number(row?.rolesCount) || 0
  const levelAvg = formatLevel(row?.levelAvg)

  return (
    <Box
      sx={{
        ...sx.rowCardSx,
        ...(row?.isProject ? sx.rowCardProjectSx || {} : {}),
      }}
    >
      <Box sx={sx.teamCellSx}>
        <Box sx={sx.avatarBoxSx}>
          <Badge
            badgeInset="14%"
            size="sm"
            anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            color={statusMeta.badgeColor}
          >
            <Avatar src={row?.raw?.photo || row?.raw?.teamPhoto || roleImage} />
          </Badge>
        </Box>

        <Box sx={sx.teamTextWrapSx}>
          <Typography level="body-md" sx={sx.teamNameSx}>
            {teamName}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap' }}>
            <Typography level="body-xs" sx={sx.teamMetaSx}>
              שנתון {teamYear}
            </Typography>

            {row?.isProject ? (
              <Chip
                size="sm"
                variant="soft"
                sx={{
                  bgcolor: c.bg,
                  color: c.text,
                  fontWeight: 700,
                }}
              >
                פרויקט
              </Chip>
            ) : null}

            <Chip size="sm" variant="soft" color={statusMeta.color}>
              {statusMeta.label}
            </Chip>
          </Box>
        </Box>
      </Box>

      <Box sx={sx.centerCellSx}>
        <Typography level="body-sm" sx={sx.valueTextSx || sx.teamNameSx}>
          {teamYear}
        </Typography>
      </Box>

      <Box sx={sx.centerCellSx}>
        <Typography level="body-sm" sx={sx.valueTextSx || sx.teamNameSx}>
          {playersCount}
        </Typography>
      </Box>

      <Box sx={sx.centerCellSx}>
        <Typography level="body-sm" sx={sx.valueTextSx || sx.teamNameSx}>
          {rolesCount}
        </Typography>
      </Box>

      <Box sx={sx.centerCellSx}>
        <Typography level="body-sm" sx={sx.valueTextSx || sx.teamNameSx}>
          {levelAvg}
        </Typography>
      </Box>

      <Box sx={sx.centerCellSx}>
        <Tooltip title="עריכת קבוצה">
          <IconButton size="sm" onClick={onEdit}>
            {iconUi({ id: 'more' })}
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  )
}
