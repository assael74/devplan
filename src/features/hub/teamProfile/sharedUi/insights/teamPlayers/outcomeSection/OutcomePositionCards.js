// TEAMPROFILE/sharedUi/insights/teamPlayers/outcomeSection/OutcomePositionCards.js

import React from 'react'
import { Box, Chip, Typography } from '@mui/joy'

import { iconUi } from '../../../../../../../ui/core/icons/iconUi.js'

import {
  getGroupDamageValue,
  getGroupJoyTone,
  getQualityJoyTone,
  getWeakSampleValue,
} from './ui/index.js'

import { cardsSx as sx } from './sx/index.js'

const emptyArray = []

const getScoreValue = group => {
  return group?.scoreLabel ||
    group?.diagnosis?.reason?.score ||
    '-'
}

const Metric = ({ label, value, signedValue = false, }) => {
  return (
    <Box sx={sx.metric}>
      <Typography level="body-xs" sx={sx.metricLabelP}>
        {label}
      </Typography>

      <Typography level="body-sm" sx={sx.metricValueP}>
        {value}
      </Typography>
    </Box>
  )
}

const Card = ({ group, selected, onSelect, }) => {
  const color = getGroupJoyTone(group)
  const qualityColor = getQualityJoyTone(group)

  const select = () => {
    if (typeof onSelect === 'function') {
      onSelect(group.id)
    }
  }

  const onKeyDown = event => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      select()
    }
  }

  return (
    <Box
      role="button"
      tabIndex={0}
      sx={sx.card(selected)}
      onClick={select}
      onKeyDown={onKeyDown}
    >
      <Box sx={sx.cardHead}>
        <Box sx={sx.cardTitleWrap}>
          <Box sx={sx.cardPIcon}>
            {iconUi({
              id: group.id || group.layerKey || group.icon || 'positions',
              size: 'sm',
            })}
          </Box>

          <Box sx={sx.cardText}>
            <Typography level="title-sm" sx={sx.cardTitle}>
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
          {getScoreValue(group)}
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

      <Box sx={sx.metricsP}>
        <Metric
          label="מתחת"
          value={getWeakSampleValue(group)}
        />

        <Metric
          label="ציון"
          value={getScoreValue(group)}
        />

        <Metric
          label="נזק"
          value={getGroupDamageValue(group)}
          signedValue
        />
      </Box>
    </Box>
  )
}

export default function OutcomePositionCards({
  groups = emptyArray,
  selectedId,
  onSelect,
}) {
  const safeGroups = Array.isArray(groups) ? groups : emptyArray

  if (!safeGroups.length) return null

  return (
    <Box sx={sx.cards}>
      {safeGroups.map(group => (
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
