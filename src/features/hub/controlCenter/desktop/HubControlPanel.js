// src/features/hub/controlCenter/desktop/HubControlPanel.js

import React from 'react'
import { Box, Sheet, Typography } from '@mui/joy'

import ClubDesktop from './ClubDesktop.js'
import PlayerDesktop from './PlayerDesktop.js'
import TeamDesktop from './TeamDesktop.js'
import ScoutView from '../../scouting/desktop/ScoutView.js'
import { layoutSx as sx } from '../../components/desktop/layout/layout.sx.js'
import logoMark from '../../../../ui/core/images/logo-mark.png'
import { devPlanColors } from '../../../../ui/core/theme/Colors.js'

const CONTROL_VIEW_BY_TYPE = {
  club: ClubDesktop,
  player: PlayerDesktop,
  team: TeamDesktop,
  scout: ScoutView,
}

function EmptyControlPanel() {
  return (
    <Sheet
      variant="outlined"
      sx={{
        minHeight: '100%',
        p: 2,
        borderRadius: 16,
        borderColor: devPlanColors.border,
        bgcolor: devPlanColors.surface,
        display: 'grid',
        placeItems: 'center',
        textAlign: 'center',
      }}
    >
      <Box sx={{ display: 'grid', justifyItems: 'center', gap: 1 }}>
        <Box
          component="img"
          src={logoMark}
          alt=""
          aria-hidden="true"
          sx={{
            width: 64,
            height: 64,
            objectFit: 'contain',
            opacity: 0.22,
          }}
        />

        <Typography level="title-sm" sx={{ color: devPlanColors.primary, fontWeight: 700 }}>
          בחר יישות
        </Typography>

        <Typography level="body-sm" sx={{ color: devPlanColors.subText }}>
          בחר שחקן, קבוצה או מועדון מהרשימה כדי לפתוח את מרכז השליטה.
        </Typography>
      </Box>
    </Sheet>
  )
}

export default function HubControlPanel({ selection, routesByType, countsByType, onOpenRoute, context }) {
  const type = selection?.type
  const data = selection?.data
  const View = CONTROL_VIEW_BY_TYPE[type]

  if (!type || !data) return <EmptyControlPanel />

  if (!View) return null

  if (type === 'player') {
    return <View player={data} onOpenRoute={onOpenRoute} />
  }

  if (type === 'team') {
    return <View team={data} onOpenRoute={onOpenRoute} />
  }

  if (type === 'club') {
    return <View club={data} onOpenRoute={onOpenRoute} />
  }

  return (
    <Sheet variant="soft" sx={sx.sheet}>
      <View
        scout={data}
        routes={routesByType?.scout}
        counts={countsByType?.scout}
        onOpenRoute={onOpenRoute}
        context={context}
      />
    </Sheet>
  )
}
