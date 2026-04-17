// clubProfile/desktop/modules/teams/components/sections/InfoSection.js

import React from 'react'
import { Box, Chip, Typography, Avatar } from '@mui/joy'

import { iconUi } from '../../../../../../../../ui/core/icons/iconUi.js'
import { resolveEntityAvatar } from '../../../../../../../../ui/core/avatars/fallbackAvatar.js'
import { clubTeamsSectionsSx as sx } from '../../sx/clubTeams.sections.sx.js'

function getLeagueLabel(team) {
  const leagueName = team?.leagueName || ''
  const leagueLevel = team?.leagueLevel || 0

  if (leagueName && leagueLevel !== '' && leagueLevel != null) {
    return `${leagueName} (${leagueLevel})`
  }

  if (leagueName) {
    return leagueName
  }

  if (leagueLevel !== '' && leagueLevel != null) {
    return `רמה ${leagueLevel}`
  }

  return ''
}

function getNumberLabel(value, fallback = 0) {
  return value == null || value === '' ? fallback : value
}

export default function InfoSection({ row }) {
  const team = row
  const teamName = team?.teamName || '—'
  const teamYear = team?.teamYear || ''
  const leagueLabel = getLeagueLabel(team)

  const position = getNumberLabel(team?.leaguePosition)
  const points = getNumberLabel(team?.points)
  const goalsFor = getNumberLabel(team?.leagueGoalsFor)
  const goalsAgainst = getNumberLabel(team?.leagueGoalsAgainst)

  const src = resolveEntityAvatar({
    entityType: 'team',
    entity: team,
    parentEntity: team?.club,
    subline: team?.club?.name,
  })

  return (
    <Box sx={sx.infoSection}>
      <Box sx={sx.identityCol}>
        <Box sx={sx.avatarBtn}>
          <Avatar src={src} sx={sx.avatar} />

          <Box
            sx={[
              sx.avatarStatusDot,
              row?.active ? { bgcolor: 'success.500' } : { bgcolor: 'danger.500' },
            ]}
          />

          <Box className="_rowAvatarOverlay" sx={sx.avatarOverlay} />
        </Box>

        <Box sx={sx.nameWrap}>
          <Box sx={sx.nameRow}>
            <Typography level="title-sm" sx={sx.playerName}>
              {teamName}
            </Typography>
          </Box>

          <Box sx={sx.subMetaInline}>
            {!!teamYear ? (
              <Typography level="body-sm" sx={{ fontWeight: 700 }}>
                {teamYear}
              </Typography>
            ) : null}

            {!!leagueLabel ? (
              <Typography level="body-xs" sx={sx.metaText}>
                {leagueLabel}
              </Typography>
            ) : null}
          </Box>
        </Box>
      </Box>

      <Box sx={{ flex: 1, marginInlineStart: 'auto' }} />

      <Box sx={sx.performCol}>
        <Chip
          size="md"
          startDecorator={iconUi({ id: 'leaguePos', size: 'sm' })}
          sx={{ flexShrink: 0, whiteSpace: 'nowrap' }}
        >
          מקום: {position}
        </Chip>

        <Chip
          size="md"
          startDecorator={iconUi({ id: 'points', size: 'sm' })}
          sx={{ flexShrink: 0, whiteSpace: 'nowrap' }}
        >
           נק׳: {points}
        </Chip>

        <Chip
          size="md"
          color='success'
          startDecorator={iconUi({ id: 'goal', size: 'sm' })}
          sx={{ flexShrink: 0, whiteSpace: 'nowrap' }}
        >
         זכות: {goalsFor}
        </Chip>

        <Chip
          size="md"
          color='danger'
          startDecorator={iconUi({ id: 'goal', size: 'sm' })}
          sx={{ flexShrink: 0, whiteSpace: 'nowrap' }}
        >
          חובה: {goalsAgainst}
        </Chip>
      </Box>
    </Box>
  )
}
