// src/features/hub/controlCenter/desktop/HubControlPanel.js

import React from 'react'
import { Sheet, Typography } from '@mui/joy'

import ClubDesktop from './ClubDesktop.js'
import PlayerDesktop from './PlayerDesktop.js'
import TeamDesktop from './TeamDesktop.js'
import ScoutView from '../../scouting/desktop/ScoutView.js'
import { layoutSx as sx } from '../../components/desktop/layout/layout.sx.js'

const CONTROL_VIEW_BY_TYPE = {
  club: ClubDesktop,
  player: PlayerDesktop,
  team: TeamDesktop,
  scout: ScoutView,
}

export default function HubControlPanel({ selection, routesByType, countsByType, onOpenRoute, context }) {
  const type = selection?.type
  const data = selection?.data
  const View = CONTROL_VIEW_BY_TYPE[type]

  if (!type || !data) {
    return (
      <Sheet variant="outlined" sx={{ p: 2, borderRadius: 16 }}>
        <Typography level="body-sm">בחר שחקן, קבוצה או מועדון</Typography>
      </Sheet>
    )
  }

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
