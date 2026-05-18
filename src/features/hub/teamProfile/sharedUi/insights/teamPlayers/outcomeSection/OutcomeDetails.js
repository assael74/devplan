// TEAMPROFILE/sharedUi/insights/teamPlayers/outcomeSection/OutcomeDetails.js

import React from 'react'
import { Box, Typography } from '@mui/joy'

import {
  CollapsePanel,
  PlayersList,
} from '../shared/index.js'

import {
  getDetailsSummary,
  getOkPlayers,
  getProblemPlayers,
  getVisibleDetails,
} from './ui/index.js'

import { detailsSx as sx } from './sx/index.js'

const emptyArray = []

const DetailRows = ({ rows = emptyArray }) => {
  const visibleRows = getVisibleDetails(rows)

  if (!visibleRows.length) return null

  return (
    <Box sx={sx.detailGrid}>
      {visibleRows.map(row => (
        <Box key={row.id || row.label} sx={sx.detailRow}>
          <Typography level="body-xs" sx={sx.detailLabel}>
            {row.label}
          </Typography>

          <Typography level="body-sm" sx={sx.detailText}>
            {row.text}
          </Typography>
        </Box>
      ))}
    </Box>
  )
}

export default function OutcomeDetails({ group, sourceType = 'role' }) {
  if (!group) return null

  const problemPlayers = getProblemPlayers(group)
  const okPlayers = getOkPlayers(group)

  return (
    <CollapsePanel
      icon={group.icon || 'insights'}
      title={group.label}
      defaultOpen={false}
      sub={getDetailsSummary(group)}
      tone={group.diagnosis?.color || 'primary'}
    >
      <Box sx={sx.details}>
        <DetailRows rows={group.details || emptyArray} />

        <PlayersList
          players={problemPlayers}
          title="שחקנים לא תקינים"
          emptyText="אין שחקנים לא תקינים במקבץ הזה."
          limit={8}
          variant="problem"
          sourceType={sourceType}
        />

        <PlayersList
          players={okPlayers}
          title="שחקנים תקינים"
          emptyText="אין שחקנים תקינים להצגה."
          limit={10}
          variant="ok"
          sourceType={sourceType}
        />
      </Box>
    </CollapsePanel>
  )
}
