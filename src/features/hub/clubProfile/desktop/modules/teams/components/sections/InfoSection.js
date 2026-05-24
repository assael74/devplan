// clubProfile/desktop/modules/teams/components/sections/InfoSection.js

import React from 'react'
import { Avatar, Box, Button, Typography } from '@mui/joy'
import { useNavigate } from 'react-router-dom'

import { resolveEntityAvatar } from '../../../../../../../../ui/core/avatars/fallbackAvatar.js'

import { infoSx as sx } from './sx/info.sx.js'

const getTeamId = team => {
  return team?.id || team?.teamId || null
}

const getTeamName = team => {
  return team?.teamName || team?.label || '—'
}

const getLeagueLabel = team => {
  const leagueName = team?.leagueName || ''
  const leagueLevel = team?.leagueLevel

  if (leagueName && leagueLevel !== '' && leagueLevel != null) {
    return `${leagueName} (${leagueLevel})`
  }

  if (leagueName) return leagueName
  if (leagueLevel !== '' && leagueLevel != null) return `רמה ${leagueLevel}`

  return ''
}

export default function InfoSection({ row }) {
  const navigate = useNavigate()

  const team = row || {}
  const teamId = getTeamId(team)
  const teamName = getTeamName(team)
  const teamYear = team?.teamYear || ''
  const leagueLabel = getLeagueLabel(team)

  const src = resolveEntityAvatar({
    entityType: 'team',
    entity: team,
    parentEntity: team?.club,
    subline: team?.club?.name,
  })

  const goToTeam = event => {
    event.stopPropagation()
    if (teamId) navigate(`/teams/${teamId}`)
  }

  return (
    <Box sx={sx.root}>
      <Box sx={sx.identityCol}>
        <Box sx={sx.avatarBox}>
          <Avatar src={src} sx={sx.avatar} />

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
              disabled={!teamId}
              onClick={goToTeam}
              sx={sx.nameButton}
            >
              {teamName}
            </Button>
          </Box>

          <Box sx={sx.subMetaInline}>
            {!!teamYear ? (
              <Typography level="body-sm" sx={sx.yearText}>
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
    </Box>
  )
}
