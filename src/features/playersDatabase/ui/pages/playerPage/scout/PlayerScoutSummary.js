// src/features/playersDatabase/ui/pages/playerPage/scout/PlayerScoutSummary.js

import {
  Box,
  Typography,
} from '@mui/joy'

import { iconUi } from '../../../../../../ui/core/icons/iconUi.js'
import { playerScoutOverviewSx as sx } from '../sx/playerScoutOverview.sx.js'

function DecisionSignal({ iconId, label, tone = 'neutral', children }) {
  return (
    <Box sx={[sx.decisionSignal, sx.decisionTone[tone] || null]}>
      <Box sx={sx.decisionSignalHeader}>
        <Box sx={sx.decisionSignalIcon}>
          {iconUi({id: iconId, size: 'sm'})}
        </Box>

        <Typography level='body-xs' sx={sx.decisionSignalLabel}>
          {label}
        </Typography>
      </Box>

      <Box sx={sx.decisionSignalBody}>
        {children}
      </Box>
    </Box>
  )
}

export default function PlayerScoutSummary({ view }) {
  const profileStrengthLabel = view.profileStrength?.label || '-'

  return (
    <Box sx={sx.decisionBar}>
      <DecisionSignal
        iconId='priorityHigh'
        label='מיידיות'
        tone={view.interest.status}
      >
        <Typography level='h2' sx={sx.decisionPrimaryValue}>
          {view.interest.label}
        </Typography>

        <Typography level='body-xs' sx={sx.decisionSignalNote}>
          {view.interest.note}
        </Typography>
      </DecisionSignal>

      <DecisionSignal iconId='completed' label='חוזק פרופיל' tone='success'>
        <Typography level='h2' sx={sx.decisionPrimaryValue}>
          {profileStrengthLabel}
        </Typography>
      </DecisionSignal>

      <DecisionSignal iconId='history' label='עומק מידע' tone='depth'>
        <Typography level='h2' sx={sx.dataDepthPrimaryValue}>
          {view.dataDepth.label}
        </Typography>

        <Typography level='body-xs' sx={sx.decisionSignalNote}>
          {view.dataDepth.note}
        </Typography>
      </DecisionSignal>
    </Box>
  )
}
