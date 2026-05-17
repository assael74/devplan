// TEAMPROFILE/sharedUi/insights/teamPlayers/outcomeSection/OutcomeCards.js

import React from 'react'
import { Box, Chip, Typography } from '@mui/joy'

import { iconUi } from '../../../../../../../ui/core/icons/iconUi.js'

import { cardsSx as sx } from './sx/index.js'

const emptyArray = []

const getColor = group => {
  return group?.diagnosis?.riskTone ||
    group?.diagnosis?.groupTone ||
    group?.scoreTone ||
    'neutral'
}

const signed = value => {
  const n = Number(value)

  if (!Number.isFinite(n)) return '0'
  if (n > 0) return `+${n}`

  return `${n}`
}

const getSub = group => {
  const checked = group?.sample?.checked || 0
  const players = group?.sample?.players || 0
  const weak = group?.health?.weakCount || 0
  const damage = group?.health?.damageScore || 0

  return `${checked}/${players} במדגם · ${weak} מתחת לציפייה · נזק ${damage}`
}

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
  const color = getColor(group)

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
          <Box sx={sx.cardIcon(color, selected)}>
            {iconUi({ id: group.icon || 'insights', size: 'sm' })}
          </Box>

          <Box sx={sx.cardText}>
            <Typography level="title-sm" sx={sx.cardTitle}>
              {group.label}
            </Typography>

            <Typography level="body-xs" sx={sx.cardSub}>
              {getSub(group)}
            </Typography>
          </Box>
        </Box>

        <Chip
          size="sm"
          variant="soft"
          color={group.diagnosis?.qualityTone || color}
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
          label="נבדקו"
          value={`${group.sample?.checked || 0}/${group.sample?.players || 0}`}
         />

        <Metric
          label="מתחת"
          value={group.health?.weakCount || 0}
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
