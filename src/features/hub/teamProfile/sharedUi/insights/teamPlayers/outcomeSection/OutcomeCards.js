// TEAMPROFILE/sharedUi/insights/teamPlayers/outcomeSection/OutcomeCards.js

import React from 'react'
import { Box, Chip, Typography } from '@mui/joy'

import { iconUi } from '../../../../../../../ui/core/icons/iconUi.js'
import { ScoringInfoTooltip } from '../../../../../../../ui/patterns/scoring/index.js'

import {
  getGroupJoyTone,
  getQualityJoyTone,
} from './ui/index.js'

import { cardsSx as sx } from './sx/index.js'

const emptyArray = []
const loadingLabel = 'בטעינה'

const getValue = ({ loading, value, fallback = '-' }) => {
  if (loading) return loadingLabel
  return value ?? fallback
}

const Metric = ({ label, value, loading = false }) => {
  return (
    <Box sx={sx.metric}>
      <Typography level="body-xs" sx={sx.metricLabel}>
        {label}
      </Typography>

      <Typography level="body-sm" sx={sx.metricValue}>
        {getValue({ loading, value })}
      </Typography>
    </Box>
  )
}

const Card = ({ group, selected, onSelect, loading = false }) => {
  const color = loading ? 'neutral' : getGroupJoyTone(group)
  const qualityColor = loading ? 'neutral' : getQualityJoyTone(group)

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

        <ScoringInfoTooltip
          metric="efficiency"
          placement="top"
          mode="short"
          triggerSx={{ display: 'inline-flex' }}
        >
          <Chip
            size="sm"
            variant="soft"
            color={qualityColor}
            sx={sx.scoreChip(selected)}
          >
            {getValue({
              loading,
              value: group.scoreLabel,
            })}
          </Chip>
        </ScoringInfoTooltip>
      </Box>

      <Box sx={sx.diagnosisRow}>
        <Chip
          size="sm"
          variant="soft"
          color={color}
          sx={sx.diagnosisChip}
        >
          {loading ? loadingLabel : group.diagnosis?.label || 'אין אבחנה'}
        </Chip>
      </Box>

      <Box sx={sx.metrics}>
        <Metric
          label="מתחת"
          loading={loading}
          value={`${group.health?.weakCount || 0}/${group.sample?.players || 0}`}
        />

        <ScoringInfoTooltip
          metric="impact"
          mode="short"
          placement="top"
          showDiff
          triggerSx={{ display: 'block', minWidth: 0 }}
        >
          <Metric
            label="נזק"
            loading={loading}
            value={group.health?.weakWeightedTva || 0}
          />
        </ScoringInfoTooltip>
      </Box>
    </Box>
  )
}

export default function OutcomeCards({
  groups = emptyArray,
  selectedId,
  onSelect,
  loading = false,
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
          loading={loading}
        />
      ))}
    </Box>
  )
}
