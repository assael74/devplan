// TEAMPROFILE/sharedUi/insights/teamPlayers/recommendSection/RecommendCard.js

import React from 'react'
import { Box, Chip, Typography } from '@mui/joy'

import { iconUi } from '../../../../../../../ui/core/icons/iconUi.js'

import { recommendSx as sx } from './sx/index.js'

const signed = value => {
  const n = Number(value)

  if (!Number.isFinite(n) || n === 0) return '0'

  return n > 0 ? `+${n.toFixed(2)}` : n.toFixed(2)
}

const getSourceText = item => {
  const group = item?.source?.groupLabel
  const mode = item?.source?.mode

  if (!group) return 'מקור לא מוגדר'
  if (mode === 'coverage') return `${group} · כל העמדות`
  if (mode === 'primary') return `${group} · ראשית בלבד`

  return group
}

const Metric = ({ label, value }) => {
  return (
    <Box sx={sx.metric}>
      <Typography level="body-xs" noWrap sx={sx.metricLabel}>
        {label}
      </Typography>

      <Typography level="body-sm" sx={sx.metricValue}>
        {value}
      </Typography>
    </Box>
  )
}

export default function RecommendCard({ item, index = 0, onDismiss }) {
  if (!item) return null

  const tone = item.tone || 'neutral'
  const metrics = item.metrics || {}

  return (
    <Box sx={sx.card(tone)}>
      <Box sx={sx.cardHead}>
        <Box sx={sx.cardTitleWrap}>
          <Box sx={sx.cardIcon(tone)}>
            <Typography level="body-sm" sx={sx.cardIndex}>
              {index + 1}
            </Typography>
          </Box>

          <Box sx={sx.cardText}>
            <Typography level="title-sm" sx={sx.cardTitle}>
              {item.title}
            </Typography>

            <Typography level="body-xs" sx={sx.cardMeta}>
              {getSourceText(item)}
            </Typography>
          </Box>
        </Box>

        <Box sx={sx.cardActions}>
          <Chip
            size="sm"
            variant="soft"
            color={tone}
            sx={sx.priorityChip}
          >
            {item.priority}
          </Chip>

          <Box
            role="button"
            tabIndex={0}
            sx={sx.dismiss}
            onClick={() => onDismiss(item.id)}
            onKeyDown={event => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                onDismiss(item.id)
              }
            }}
          >
            {iconUi({ id: 'close', size: 'xs' })}
          </Box>
        </Box>
      </Box>

      <Typography level="body-sm" sx={sx.text}>
        {item.text}
      </Typography>

      <Box sx={sx.metrics}>
        <Metric
          label="ציון"
          value={metrics.scoreLabel || '-'}
        />

        <Metric
          label="מתחת"
          value={`${metrics.weakCount || 0}/${metrics.checked || metrics.players || 0}`}
        />

        <Metric
          label="TVA"
          value={signed(metrics.totalTva)}
        />
      </Box>
    </Box>
  )
}
