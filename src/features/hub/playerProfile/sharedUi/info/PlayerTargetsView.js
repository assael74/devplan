// src/features/hub/playerProfile/sharedUi/info/PlayerTargetsView.js

import React from 'react'
import { Box, Button, Option, Select, Sheet, Typography } from '@mui/joy'

import { PLAYER_CONFIDENCE_OPTIONS } from '../../../../../shared/players/player.squadRole.utils.js'

import { iconUi } from '../../../../../ui/core/icons/iconUi.js'
import { viewSx as sx } from './sx/view.sx.js'

const EMPTY = '\u2014'

const TEXT = {
  basis: '\u05d1\u05e1\u05d9\u05e1 \u05d9\u05e2\u05d3',
  squadRole: '\u05de\u05e2\u05de\u05d3 \u05d1\u05e1\u05d2\u05dc',
  primaryPosition: '\u05e2\u05de\u05d3\u05d4 \u05e8\u05d0\u05e9\u05d9\u05ea',
  layer: '\u05d7\u05d5\u05dc\u05d9\u05d4',
  teamTarget: '\u05d9\u05e2\u05d3 \u05e7\u05d1\u05d5\u05e6\u05d4',
  confidence: '\u05d1\u05d9\u05d8\u05d7\u05d5\u05df \u05d1\u05d1\u05d9\u05e6\u05d5\u05e2',
  confidenceHelp: '\u05d4\u05e2\u05e8\u05db\u05ea \u05d4\u05de\u05d0\u05de\u05df \u05dc\u05e1\u05d1\u05d9\u05e8\u05d5\u05ea \u05e9\u05d4\u05e9\u05d7\u05e7\u05df \u05d9\u05de\u05de\u05e9 \u05d0\u05ea \u05d4\u05d9\u05e2\u05d3 \u05d4\u05de\u05e7\u05e6\u05d5\u05e2\u05d9.',
  multiplier: '\u05de\u05db\u05e4\u05d9\u05dc \u05e0\u05d5\u05db\u05d7\u05d9',
  selectConfidence: '\u05d1\u05d7\u05e8 \u05e8\u05de\u05ea \u05d1\u05d9\u05d8\u05d7\u05d5\u05df',
  originalTarget: '\u05d9\u05e2\u05d3 \u05de\u05e7\u05e6\u05d5\u05e2\u05d9 \u05de\u05e7\u05d5\u05e8\u05d9',
  targetRange: '\u05d8\u05d5\u05d5\u05d7 \u05d9\u05e2\u05d3',
  perGame: '\u05d9\u05e2\u05d3 \u05dc\u05de\u05e9\u05d7\u05e7',
  seasonTarget: '\u05d9\u05e2\u05d3 \u05e2\u05d5\u05e0\u05ea\u05d9',
  seasonRange: '\u05d8\u05d5\u05d5\u05d7 \u05e2\u05d5\u05e0\u05ea\u05d9',
  noTarget: '\u05dc\u05d0 \u05d4\u05d5\u05d2\u05d3\u05e8 \u05d9\u05e2\u05d3 \u05d0\u05d9\u05e9\u05d9 \u05e4\u05e2\u05d9\u05dc',
  noTargetHelp: '\u05db\u05d3\u05d9 \u05dc\u05e2\u05e7\u05d5\u05d1 \u05d0\u05d7\u05e8 \u05d4\u05ea\u05e7\u05d3\u05de\u05d5\u05ea \u05d4\u05e9\u05d7\u05e7\u05df, \u05d9\u05e9 \u05dc\u05d4\u05d2\u05d3\u05d9\u05e8 \u05e2\u05de\u05d3\u05d4 \u05e8\u05d0\u05e9\u05d9\u05ea \u05d5\u05d9\u05e2\u05d3 \u05e7\u05d1\u05d5\u05e6\u05ea\u05d9.',
  setPosition: '\u05d4\u05d2\u05d3\u05e8\u05ea \u05e2\u05de\u05d3\u05d4',
  teamTargetAction: '\u05d1\u05d7\u05d9\u05e8\u05ea \u05d9\u05e2\u05d3 \u05e7\u05d1\u05d5\u05e6\u05d4',
}

const TARGET_VISUALS = {
  goalTier: { icon: 'targets', tone: 'impact' },
  goals: { icon: 'goal', tone: 'attack' },
  assists: { icon: 'assist', tone: 'creation' },
  goalContributions: { icon: 'targets', tone: 'impact' },
  defenseResponsibility: { icon: 'targets', tone: 'neutral' },
  cleanSheets: { icon: 'isStart', tone: 'neutral' },
  minutes: { icon: 'timePlayed', tone: 'usage' },
  lineup: { icon: 'isStart', tone: 'lineup' },
}

const getMetricVisual = id => TARGET_VISUALS[id] || { icon: 'flag', tone: 'neutral' }

const BasisItem = ({ label, value, icon }) => (
  <Sheet variant='soft' sx={sx.basisItem}>
    {icon ? <Box sx={sx.basisIcon}>{iconUi({ id: icon })}</Box> : null}
    <Typography level='body-xs' sx={sx.itemLabel}>{label}</Typography>
    <Typography level='title-sm' sx={sx.basisValue}>{value || EMPTY}</Typography>
  </Sheet>
)

const TargetBasis = ({ basis = {} }) => (
  <Sheet variant='soft' sx={sx.basisArea}>
    <Typography level='title-sm' sx={sx.title}>{TEXT.basis}</Typography>
    <Box sx={sx.basisGrid}>
      <BasisItem label={TEXT.squadRole} value={basis.role} icon='keyPlayer' />
      <BasisItem label={TEXT.primaryPosition} value={basis.primaryPosition} icon='position' />
      <BasisItem label={TEXT.layer} value={basis.positionGroup} icon='layers' />
      <BasisItem label={TEXT.teamTarget} value={basis.teamProfile} icon='targets' />
    </Box>
  </Sheet>
)

const ConfidenceSummary = ({ confidence = {}, value = '', disabled = false, onChange }) => {
  const multiplierLabel = `${Math.round(Number(confidence.multiplier || 1) * 100)}%`

  const handleChange = (event, nextValue) => {
    if (disabled || typeof onChange !== 'function') return
    onChange(nextValue || '')
  }

  return (
    <Sheet variant='soft' sx={sx.section}>
      <Box sx={sx.confidenceRow}>
        <Box sx={sx.confidenceCopy}>
          <Typography level='title-sm' sx={sx.title}>{TEXT.confidence}</Typography>
          <Typography level='body-xs' sx={sx.metricHelper}>{TEXT.confidenceHelp}</Typography>
          <Typography level='body-xs' sx={sx.metricHelper}>{TEXT.multiplier}: {multiplierLabel}</Typography>
        </Box>

        <Select size='sm' value={value || null} placeholder={TEXT.selectConfidence} disabled={disabled} onChange={handleChange} sx={sx.confidenceSelect}>
          {PLAYER_CONFIDENCE_OPTIONS.map(option => (
            <Option key={option.value} value={option.value}>{option.label}{' \u00b7 '}{option.shortLabel}</Option>
          ))}
        </Select>
      </Box>
    </Sheet>
  )
}

const MetricDetail = ({ label, value }) => {
  if (!value || value === EMPTY || value.startsWith(EMPTY)) return null
  return <Typography level='body-xs' sx={sx.metricHelper}>{label}: {value}</Typography>
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
      <Typography level='title-lg' sx={sx.metricValue}>{metric.value || EMPTY}</Typography>
      {metric.originalValue ? <Typography level='body-xs' sx={sx.originalTarget}>{TEXT.originalTarget}: {metric.originalValue}</Typography> : null}
      {metric.helper ? <Typography level='body-xs' sx={sx.metricHelper}>{metric.helper}</Typography> : null}
      <MetricDetail label={TEXT.targetRange} value={metric.range} />
      <MetricDetail label={TEXT.perGame} value={metric.perGame} />
      <MetricDetail label={TEXT.seasonTarget} value={metric.absoluteTarget} />
      <MetricDetail label={TEXT.seasonRange} value={metric.absoluteRange} />
    </Sheet>
  )
}

const TargetsBlock = ({ section, columns = 4 }) => {
  if (!section?.cards?.length) return null
  return (
    <Sheet variant='soft' sx={sx.section}>
      <Typography level='title-sm' sx={sx.title}>{section.title}</Typography>
      {section.subtitle ? <Typography level='body-xs' sx={sx.metricHelper}>{section.subtitle}</Typography> : null}
      <Box sx={sx.cardsGrid(columns)}>{section.cards.map(metric => <TargetMetric key={metric.id} metric={metric} />)}</Box>
    </Sheet>
  )
}

export default function PlayerTargetsView({
  viewModel,
  confidenceLevel = '',
  pending = false,
  onConfidenceChange,
  onOpenPosition,
}) {
  if (!viewModel?.hasTargets) {
    return (
      <Sheet variant='soft' sx={sx.empty}>
        <Typography level='title-sm' sx={sx.emptyTitle}>{TEXT.noTarget}</Typography>
        <Typography level='body-xs' sx={sx.emptySub}>{TEXT.noTargetHelp}</Typography>
        <Box sx={sx.emptyActions}>
          <Button size='sm' variant='solid' disabled={pending} onClick={onOpenPosition} startDecorator={iconUi({ id: 'position' })} sx={sx.emptyPrimaryAction}>
            {TEXT.setPosition}
          </Button>
          <Button size='sm' variant='soft' color='neutral' disabled startDecorator={iconUi({ id: 'targets' })} sx={sx.emptyDisabledAction}>
            {TEXT.teamTargetAction}
          </Button>
        </Box>
      </Sheet>
    )
  }

  return (
    <Box sx={sx.root}>
      <TargetBasis basis={viewModel.targetBasis} />
      <ConfidenceSummary confidence={viewModel.confidence} value={confidenceLevel} disabled={pending} onChange={onConfidenceChange} />
      <TargetsBlock section={viewModel.targetSection} columns={4} />
      <TargetsBlock section={viewModel.usageSection} columns={2} />
    </Box>
  )
}
