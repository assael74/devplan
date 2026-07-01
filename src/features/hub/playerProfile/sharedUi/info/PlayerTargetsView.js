// src/features/hub/playerProfile/sharedUi/info/PlayerTargetsView.js

import React from 'react'
import { Box, Option, Select, Sheet, Typography } from '@mui/joy'

import { PLAYER_CONFIDENCE_OPTIONS } from '../../../../../shared/players/player.squadRole.utils.js'

import { iconUi } from '../../../../../ui/core/icons/iconUi.js'
import { viewSx as sx } from './sx/view.sx.js'

const EMPTY = '—'

const TARGET_VISUALS = {
  goalTier: {
    icon: 'targets',
    tone: 'impact',
  },

  goals: {
    icon: 'goal',
    tone: 'attack',
  },

  assists: {
    icon: 'assist',
    tone: 'creation',
  },

  goalContributions: {
    icon: 'targets',
    tone: 'impact',
  },

  defenseResponsibility: {
    icon: 'targets',
    tone: 'neutral',
  },

  cleanSheets: {
    icon: 'isStart',
    tone: 'neutral',
  },

  minutes: {
    icon: 'timePlayed',
    tone: 'usage',
  },

  lineup: {
    icon: 'isStart',
    tone: 'lineup',
  },
}

const getMetricVisual = id => {
  return TARGET_VISUALS[id] || {
    icon: 'flag',
    tone: 'neutral',
  }
}

const BasisItem = ({ label, value, icon }) => {
  return (
    <Sheet variant='soft' sx={sx.basisItem}>
      {icon ? <Box sx={sx.basisIcon}>{iconUi({ id: icon })}</Box> : null}

      <Typography level='body-xs' sx={sx.itemLabel}>{label}</Typography>

      <Typography level='title-sm' sx={sx.basisValue}>
        {value || EMPTY}
      </Typography>
    </Sheet>
  )
}

const TargetBasis = ({ basis = {} }) => {
  return (
    <Sheet variant='soft' sx={sx.basisArea}>
      <Typography level='title-sm' sx={sx.title}>בסיס יעד</Typography>

      <Box sx={sx.basisGrid}>
        <BasisItem label='מעמד בסגל' value={basis.role} icon='keyPlayer' />
        <BasisItem label='עמדה ראשית' value={basis.primaryPosition} icon='position' />
        <BasisItem label='חוליה' value={basis.positionGroup} icon='layers' />
        <BasisItem label='יעד קבוצה' value={basis.teamProfile} icon='targets' />
      </Box>
    </Sheet>
  )
}

const ConfidenceSummary = ({
  confidence = {},
  value = '',
  disabled = false,
  onChange,
}) => {
  const multiplierLabel = `${Math.round(Number(confidence.multiplier || 1) * 100)}%`

  const handleChange = (event, nextValue) => {
    if (disabled || typeof onChange !== 'function') return
    onChange(nextValue || '')
  }

  return (
    <Sheet variant='soft' sx={sx.section}>
      <Box sx={sx.confidenceRow}>
        <Box sx={sx.confidenceCopy}>
          <Typography level='title-sm' sx={sx.title}>ביטחון בביצוע</Typography>

          <Typography level='body-xs' sx={sx.metricHelper}>
            הערכת המאמן לסבירות שהשחקן יממש את היעד המקצועי.
          </Typography>

          <Typography level='body-xs' sx={sx.metricHelper}>
            מכפיל נוכחי: {multiplierLabel}
          </Typography>
        </Box>

        <Select
          size='sm'
          value={value || null}
          placeholder='בחר רמת ביטחון'
          disabled={disabled}
          onChange={handleChange}
          sx={sx.confidenceSelect}
        >
          {PLAYER_CONFIDENCE_OPTIONS.map(option => (
            <Option key={option.value} value={option.value}>
              {option.label} · {option.shortLabel}
            </Option>
          ))}
        </Select>
      </Box>
    </Sheet>
  )
}

const MetricDetail = ({ label, value }) => {
  if (!value || value === EMPTY || value.startsWith(EMPTY)) return null

  return (
    <Typography level='body-xs' sx={sx.metricHelper}>
      {label}: {value}
    </Typography>
  )
}

const TargetMetric = ({ metric }) => {
  const visual = getMetricVisual(metric.id)
  const icon = metric.icon || visual.icon

  return (
    <Sheet variant='soft' color='neutral' sx={sx.metric(visual.tone)}>
      <Box sx={sx.metricTop}>
        <Box sx={sx.metricIcon(visual.tone)}>{iconUi({ id: icon })}</Box>
        <Typography level='body-xs' sx={sx.itemLabel}>{metric.label}</Typography>
      </Box>

      <Typography level='title-lg' sx={sx.metricValue}>
        {metric.value || EMPTY}
      </Typography>

      {metric.originalValue ? (
        <Typography level='body-xs' sx={sx.originalTarget}>
          יעד מקצועי מקורי: {metric.originalValue}
        </Typography>
      ) : null}

      {metric.helper ? (
        <Typography level='body-xs' sx={sx.metricHelper}>
          {metric.helper}
        </Typography>
      ) : null}

      <MetricDetail label='טווח יעד' value={metric.range} />
      <MetricDetail label='יעד למשחק' value={metric.perGame} />
      <MetricDetail label='יעד עונתי' value={metric.absoluteTarget} />
      <MetricDetail label='טווח עונתי' value={metric.absoluteRange} />
    </Sheet>
  )
}

const TargetsBlock = ({ section, columns = 4 }) => {
  if (!section?.cards?.length) return null

  return (
    <Sheet variant='soft' sx={sx.section}>
      <Typography level='title-sm' sx={sx.title}>
        {section.title}
      </Typography>

      {section.subtitle ? (
        <Typography level='body-xs' sx={sx.metricHelper}>
          {section.subtitle}
        </Typography>
      ) : null}

      <Box sx={sx.cardsGrid(columns)}>
        {section.cards.map(metric => (
          <TargetMetric key={metric.id} metric={metric} />
        ))}
      </Box>
    </Sheet>
  )
}

export default function PlayerTargetsView({
  viewModel,
  confidenceLevel = '',
  pending = false,
  onConfidenceChange,
}) {
  if (!viewModel?.hasTargets) {
    return (
      <Sheet variant='soft' sx={sx.empty}>
        <Typography level='title-sm' sx={sx.emptyTitle}>
          אין מספיק נתונים לפתיחת יעד שחקן
        </Typography>

        <Typography level='body-xs' sx={sx.emptySub}>
          צריך מעמד בסגל, עמדה ראשית ויעד קבוצה פעיל.
        </Typography>
      </Sheet>
    )
  }

  return (
    <Box sx={sx.root}>
      <TargetBasis basis={viewModel.targetBasis} />

      <ConfidenceSummary
        confidence={viewModel.confidence}
        value={confidenceLevel}
        disabled={pending}
        onChange={onConfidenceChange}
      />

      <TargetsBlock section={viewModel.targetSection} columns={4} />
      <TargetsBlock section={viewModel.usageSection} columns={2} />
    </Box>
  )
}
