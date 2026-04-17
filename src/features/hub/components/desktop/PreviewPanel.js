import React from 'react'
import { Sheet, Typography } from '@mui/joy'

import { layoutSx as sx } from './layout/layout.sx'

import PlayerPreviewView from './preview/views/PlayerPreviewView'
import TeamContextView from './preview/views/TeamContextView'
import ClubContextView from './preview/views/ClubContextView'
import StaffPreviewView from './preview/views/StaffPreviewView'
import ScoutPreviewView from './preview/views/ScoutPreviewView'

// --- מיפוי לפי סוג ---
const VIEW_BY_TYPE = {
  player: PlayerPreviewView,
  team: TeamContextView,
  club: ClubContextView,
  staff: StaffPreviewView,
  scout: ScoutPreviewView,
}

export default function PreviewPanel({ selection, routesByType, countsByType, onOpenRoute, context }) {
  const type = selection.type
  const data = selection.data
  const View = VIEW_BY_TYPE[type]

  if (!type || !data) {
    return (
      <Sheet variant="outlined" sx={{ p: 2, borderRadius: 16 }}>
        <Typography level="body-sm">בחר שחקן / קבוצה / מועדון / איש צוות</Typography>
      </Sheet>
    )
  }

  return (
    <Sheet variant="soft" sx={sx.sheet}>
      <View
        {...{ [type]: data }}
        routes={routesByType[type]}
        counts={countsByType[type]}
        onOpenRoute={onOpenRoute}
        context={context}
      />
    </Sheet>
  )
}
