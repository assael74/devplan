// features/hub/playerProfile/sharedUi/info/PlayerTargetsView.js

import React from 'react'
import { Box, Sheet, Typography } from '@mui/joy'

import { iconUi } from '../../../../../ui/core/icons/iconUi.js'
import { viewSx as sx } from './sx/view.sx.js'

const emptyText = '—'

const TARGET_VISUALS = {
  goals: {
    icon: 'goal',
    tone: 'attack',
  },

  assists: {
    icon: 'assist',
    tone: 'creation',
  },

  goalContributions: {
    icon: 'goal',
    tone: 'impact',
  },

  minutes: {
    icon: 'timePlayed',
    tone: 'usage',
  },

  lineup: {
    icon: 'isStart',
    tone: 'lineup',
  },

  playerGoalsAgainst: {
    icon: 'defense',
    tone: 'defense',
  },

  goalsAgainstPerGame: {
    icon: 'goal',
    tone: 'teamDefense',
  },
}

const getMetricVisual = (id) => {
  return TARGET_VISUALS[id] || {
    icon: 'flag',
    tone: 'neutral',
  }
}

const BasisItem = ({ label, value, icon }) => {
  return (
    <Sheet variant="soft" sx={sx.basisItem}>
      {!!icon && (
        <Box sx={sx.basisIcon}>
          {iconUi({
            id: icon,
          })}
        </Box>
      )}

      <Typography level="body-xs" sx={sx.itemLabel}>
        {label}
      </Typography>

      <Typography level="title-sm" sx={sx.basisValue}>
        {value || emptyText}
      </Typography>
    </Sheet>
  )
}

const TargetBasis = ({ basis = {} }) => {
  return (
    <Sheet variant="soft" sx={sx.basisArea}>
      <Typography level="title-sm" sx={sx.title}>
        בסיס יעד
      </Typography>

      <Box sx={sx.basisGrid}>
        <BasisItem
          label="מעמד בסגל"
          value={basis.role}
          icon='keyPlayer'
        />

        <BasisItem
          label="שכבת עמדה"
          value={basis.position}
          icon='layers'
        />

        <BasisItem
          label="יעד קבוצה"
          value={basis.teamProfile}
          icon='targets'
        />
      </Box>
    </Sheet>
  )
}

const TargetMetric = ({ id, label, value, helper }) => {
  const visual = getMetricVisual(id)

  return (
    <Sheet
      variant="soft"
      color="neutral"
      sx={sx.metric(visual.tone)}
    >
      <Box sx={sx.metricTop}>
        <Box sx={sx.metricIcon(visual.tone)}>
          {iconUi({
            id: visual.icon,
          })}
        </Box>

        <Typography level="body-xs" sx={sx.itemLabel}>
          {label}
        </Typography>
      </Box>

      <Typography level="title-lg" sx={sx.metricValue}>
        {value || emptyText}
      </Typography>

      {!!helper && (
        <Typography level="body-xs" sx={sx.metricHelper}>
          {helper}
        </Typography>
      )}
    </Sheet>
  )
}

const TargetsBlock = ({ cards = [] }) => {
  if (!cards.length) return null

  return (
    <Sheet variant="soft" sx={sx.section}>
      <Typography level="title-sm" sx={sx.title}>
        יעדי השחקן
      </Typography>

      <Box sx={sx.cardsGrid}>
        {cards.map((metric) => (
          <TargetMetric
            key={metric.id}
            id={metric.id}
            label={metric.label}
            value={metric.value}
            helper={metric.helper}
          />
        ))}
      </Box>
    </Sheet>
  )
}

export default function PlayerTargetsView({ viewModel }) {
  if (!viewModel?.hasTargets) {
    return (
      <Sheet variant="soft" sx={sx.empty}>
        <Typography level="title-sm" sx={sx.emptyTitle}>
          אין מספיק נתונים לפתיחת יעד שחקן
        </Typography>

        <Typography level="body-xs" sx={sx.emptySub}>
          צריך מעמד בסגל, עמדה מקצועית ויעד קבוצה פעיל.
        </Typography>
      </Sheet>
    )
  }

  const basis = viewModel.targetBasis || {}
  const cards = viewModel.targetCards || []

  return (
    <Box sx={sx.root}>
      <TargetBasis basis={basis} />
      <TargetsBlock cards={cards} />
    </Box>
  )
}
