// preview/previewDomainCard/domains/club/teams/components/ClubTeamsRow.js

import React from 'react'
import { Avatar, Box, Chip, IconButton, Tooltip, Typography, Badge } from '@mui/joy'

import JoyStarRating from '../../../../../../../../../ui/domains/ratings/JoyStarRating.js'

import { iconUi } from '../../../../../../../../../ui/core/icons/iconUi'
import roleImage from '../../../../../../../../../ui/core/images/roleImage.png'
import { buildFallbackAvatar } from '../../../../../../../../../ui/core/avatars/fallbackAvatar.js'
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

export default function ClubTeamsRow({ row, onEdit }) {
  const src = row?.row?.photo || buildFallbackAvatar({ entityType: 'team', id: row?.id, name: row?.teamName })
  const statusMeta = buildStatusMeta(row)
  const teamName = row?.teamName || 'קבוצה'
  const teamYear = row?.teamYear || '—'
  const colorLeagueP = row?.leaguePosition ? 'neutral' : 'danger'
  const colorLeague = row?.league ? 'neutral' : 'danger'
  const leagueText = `${row?.league || 'לא עודכן'} (${row?.leagueLevel || 0})`
  const leaguePerf = `${row?.leaguePosition || 'לא עודכן'} (${row?.points || 0} נק')`
  const playersCount = Number(row?.playersCount) || 0
  const rolesCount = Number(row?.team?.roles.length) || 0
  const levelAvg = row?.team?.level

  return (
    <Box
      sx={sx.rowCardSx}
    >
      {/* מידע */}
      <Box sx={sx.infoCellSx}>
        <Box sx={sx.avatarBoxSx}>
          <Badge
            badgeInset="14%"
            size="sm"
            anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            color={statusMeta.badgeColor}
          >
            <Avatar src={src} />
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
                startDecorator={iconUi({id: 'project', size: 'sm'})}
                sx={{ bgcolor: c.bg, color: c.text, fontWeight: 700 }}
              >
                פרויקט
              </Chip>
            ) : null}
          </Box>
        </Box>
      </Box>

      {/*  כמות שחקנים */}
      <Box sx={sx.centerCellSx}>
        <Typography level="body-sm" sx={sx.valueTextSx || sx.teamNameSx}>
          {playersCount}
        </Typography>
      </Box>

      {/*  ליגה */}
      <Box sx={sx.centerCellSx}>
        <Typography level="body-sm" color={colorLeague} sx={{ fontSize: 11, fontWeight: 700 }}>
          {leagueText}
        </Typography>
      </Box>

      {/*  ביצוע */}
      <Box sx={sx.centerCellSx}>
        <Typography level="body-sm" color={colorLeagueP} sx={{ fontSize: 11, fontWeight: 700 }}>
          {leaguePerf}
        </Typography>
      </Box>

      {/*  כמות אנשי צוות */}
      <Box sx={sx.centerCellSx}>
        <Typography level="body-sm" sx={sx.valueTextSx || sx.teamNameSx}>
          {rolesCount}
        </Typography>
      </Box>

      {/*  רמה */}
      <Box sx={sx.centerCellSx}>
        <JoyStarRating value={levelAvg} size="sm" />
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
