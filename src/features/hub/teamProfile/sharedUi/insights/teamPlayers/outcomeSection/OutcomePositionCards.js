// TEAMPROFILE/sharedUi/insights/teamPlayers/outcomeSection/OutcomePositionCards.js

import React from 'react'
import { Box, Chip, Typography } from '@mui/joy'

import { ScoringInfoTooltip } from '../../../../../../../ui/patterns/scoring/index.js'
import { iconUi } from '../../../../../../../ui/core/icons/iconUi.js'

import {
  getGroupDamageValue,
  getGroupJoyTone,
  getQualityJoyTone,
  getWeakSampleValue,
} from './ui/index.js'

import { cardsSx as sx } from './sx/index.js'

const emptyArray = []
const loadingLabel = 'בטעינה'

const getScoreValue = group => {
  return group?.scoreLabel ||
    group?.diagnosis?.reason?.score ||
    '-'
}

const getValue = ({ loading, value, fallback = '-' }) => {
  if (loading) return loadingLabel
  return value ?? fallback
}

const Metric = ({ label, value, loading = false }) => {
  return (
    <Box sx={sx.metric}>
      <Typography level="body-xs" sx={sx.metricLabelP}>
        {label}
      </Typography>

      <Typography level="body-sm" sx={sx.metricValueP}>
        {getValue({ loading, value })}
      </Typography>
    </Box>
  )
}

const Card = ({ group, selected, onSelect, loading = false }) => {
  const color = loading ? 'neutral' : getGroupJoyTone(group)
  const qualityColor = loading ? 'neutral' : getQualityJoyTone(group)

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
              value: getScoreValue(group),
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

      <Box sx={sx.metricsP}>
        <Metric
          label="מתחת"
          loading={loading}
          value={getWeakSampleValue(group)}
        />

        <ScoringInfoTooltip
          metric="efficiency"
          placement="top"
          mode="short"
          triggerSx={{ display: 'inline-flex' }}
        >
          <Metric
            label="ציון"
            loading={loading}
            value={getScoreValue(group)}
          />
        </ScoringInfoTooltip>

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
            value={getGroupDamageValue(group)}
          />
        </ScoringInfoTooltip>
      </Box>
    </Box>
  )
}

export default function OutcomePositionCards({
  groups = emptyArray,
  selectedId,
  onSelect,
  loading = false,
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
          loading={loading}
        />
      ))}
    </Box>
  )
}
