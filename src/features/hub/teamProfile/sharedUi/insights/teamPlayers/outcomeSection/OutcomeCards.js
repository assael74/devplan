// TEAMPROFILE/sharedUi/insights/teamPlayers/outcomeSection/OutcomeCards.js

import React from 'react'
import { Box, Chip, Typography } from '@mui/joy'

import { iconUi } from '../../../../../../../ui/core/icons/iconUi.js'

import {
  getGroupJoyTone,
  getQualityJoyTone,
  getWeakSampleValue,
  getGroupDamageValue,
} from './ui/index.js'

import { cardsSx as sx } from './sx/index.js'

const emptyArray = []

const Metric = ({ label, value }) => {
  return (
    <Box sx={sx.metric}>
      <Typography level="body-xs" sx={sx.metricLabel}>
        {label}
      </Typography>

      <Typography level="body-sm" sx={sx.metricValue}>
        {value}
      </Typography>
    </Box>
  )
}

const Card = ({ group, selected, onSelect }) => {
  const color = getGroupJoyTone(group)
  const qualityColor = getQualityJoyTone(group)

  return (
    <Box
      role="button"
      tabIndex={0}
      sx={sx.card(selected)}
      onClick={() => onSelect(group.id)}
      onKeyDown={event => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onSelect(group.id)
        }
      }}
    >
      <Box sx={sx.cardHead}>
        <Box sx={sx.cardTitleWrap}>
          <Box sx={sx.cardIcon(qualityColor, selected)}>
            {iconUi({ id: group.icon || 'insights', size: 'sm' })}
          </Box>

          <Box sx={sx.cardText}>
            <Typography level="title-sm" sx={{ ...sx.cardTitle, fontSize: 14 }}>
              {group.label}
            </Typography>
          </Box>
        </Box>

        <Chip
          size="sm"
          variant="soft"
          color={qualityColor}
          sx={sx.scoreChip(selected)}
        >
          {group.scoreLabel || '-'}
        </Chip>
      </Box>

      <Box sx={sx.diagnosisRow}>
        <Chip
          size="sm"
          variant="soft"
          color={color}
          sx={sx.diagnosisChip}
        >
          {group.diagnosis?.label || 'אין אבחנה'}
        </Chip>
      </Box>

      <Box sx={sx.metrics}>
        <Metric
          label="מתחת"
          value={`${group.health?.weakCount || 0}/${group.sample?.players || 0}`}
         />

        <Metric
          label="נזק"
          value={group.health?.weakWeightedTva || 0}
         />
      </Box>
    </Box>
  )
}

export default function OutcomeCards({
  groups = emptyArray,
  selectedId,
  onSelect,
}) {
  if (!groups.length) return null

  return (
    <Box sx={sx.cards}>
      {groups.map(group => (
        <Card
          key={group.id}
          group={group}
          selected={group.id === selectedId}
          onSelect={onSelect}
        />
      ))}
    </Box>
  )
}
