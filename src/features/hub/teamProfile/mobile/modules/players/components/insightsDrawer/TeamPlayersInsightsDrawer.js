// teamProfile/mobile/modules/players/components/insightsDrawer/TeamPlayersInsightsDrawer.js

import React from 'react'
import { Box, CircularProgress, Typography } from '@mui/joy'

import {
  InsightsDrawerShell,
  InsightsDrawerHeader,
} from '../../../../../../../../ui/patterns/insights'

import { getEntityColors } from '../../../../../../../../ui/core/theme/Colors.js'
import { resolveEntityAvatar } from '../../../../../../../../ui/core/avatars/fallbackAvatar.js'

import { TeamPlayersInsightsContent } from '../../../../../sharedUi/insights/teamPlayers/index.js'

const c = getEntityColors('teams')

const CONTENT_DELAY_MS = 180

function DrawerLoadingState() {
  return (
    <Box
      sx={{
        minHeight: 220,
        display: 'grid',
        placeItems: 'center',
        gap: 1,
        p: 3,
      }}
    >
      <CircularProgress size="sm" />

      <Typography level="body-sm" sx={{ color: 'text.tertiary' }}>
        טוען תובנות שחקנים...
      </Typography>
    </Box>
  )
}

export default function TeamPlayersInsightsDrawer({
  open,
  onClose,
  rows,
  summary,
  entity,
  team,
  model,
  resetKey,
}) {
  const [contentReady, setContentReady] = React.useState(false)

  const liveTeam = team || entity || {}

  const avatarSrc = resolveEntityAvatar({
    entityType: 'team',
    entity: liveTeam,
    parentEntity: liveTeam?.club,
    subline: liveTeam?.club?.name || liveTeam?.club?.clubName,
  })

  React.useEffect(() => {
    if (!open) {
      setContentReady(false)
      return undefined
    }

    const timer = window.setTimeout(() => {
      setContentReady(true)
    }, CONTENT_DELAY_MS)

    return () => {
      window.clearTimeout(timer)
    }
  }, [open, resetKey])

  return (
    <InsightsDrawerShell
      open={open}
      onClose={onClose}
      size="lg"
      header={
        <InsightsDrawerHeader
          title={liveTeam?.teamName || liveTeam?.name || ''}
          subtitle="תובנות שחקני הקבוצה"
          avatarSrc={avatarSrc}
          colorSx={{ bgcolor: c.bg }}
        />
      }
    >
      {contentReady ? (
        <TeamPlayersInsightsContent
          rows={rows}
          summary={summary}
          team={liveTeam}
          model={model}
          resetKey={resetKey}
        />
      ) : (
        <DrawerLoadingState />
      )}
    </InsightsDrawerShell>
  )
}
