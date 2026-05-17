// TEAMPROFILE/sharedUi/insights/teamPlayers/outcomeSection/OutcomeDetails.js

import React from 'react'
import { Box, Typography } from '@mui/joy'

import {
  CollapsePanel,
  PlayersList,
} from '../shared/index.js'

import { detailsSx as sx } from './sx/index.js'

const emptyArray = []

const getOkPlayers = group => {
  const players = Array.isArray(group?.players) ? group.players : emptyArray

  return players.filter(player => !player.isWeak)
}

const getProblemPlayers = group => {
  return Array.isArray(group?.weakPlayers) ? group.weakPlayers : emptyArray
}

const getSummaryText = group => {
  const weak = group?.health?.weakCount || 0
  const checked = group?.sample?.checked || 0
  const damage = group?.health?.damageScore || 0
  const tva = group?.health?.weakWeightedTva || 0

  if (!checked) {
    return 'אין מספיק מדגם כדי לקבוע תקינות שחקנים במקבץ.'
  }

  if (!weak) {
    return `${checked}/${checked} שחקנים בטווח תקין · ללא נזק משמעותי`
  }

  return `${weak}/${checked} שחקנים לא תקינים · נזק ${damage} · TVA שלילי ${tva}`
}

const isVisibleDetail = row => {
  return row?.id !== 'basis'
}

const DetailRows = ({ rows = emptyArray }) => {
  const safeRows = rows.filter(isVisibleDetail)

  if (!safeRows.length) return null

  return (
    <Box sx={sx.detailGrid}>
      {safeRows.map(row => (
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
      sub={getSummaryText(group)}
      defaultOpen={false}
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
