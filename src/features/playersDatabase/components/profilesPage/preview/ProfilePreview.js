// features/playersDatabase/components/profilesPage/preview/ProfilePreview.js

import React from 'react'
import { Box, Typography } from '@mui/joy'

import { iconUi } from '../../../../../ui/core/icons/iconUi.js'
import {
  getScoutProfileRows,
  getScoutProfileTooltipData,
} from '../../../sharedLogic/pdbScoutProfiles.logic.js'
import PreviewToolbar from './toolbar/PreviewToolbar.js'
import { previewSx as sx } from './preview.sx.js'

const createDescription = profileId => {
  const info = getScoutProfileTooltipData(profileId)
  const rules = Array.isArray(info.rules) ? info.rules : []

  return [info.context, ...rules.slice(0, 2)].filter(Boolean).join(' | ')
}

const getProfileMetrics = profile => ({
  playersCount: profile?.loadedPlayersCount || 0,
  teamsCount: profile?.loadedTeamsCount || 0,
  leaguesCount: profile?.leaguesCount || 0,
  statsCount: profile?.statsCount || 0,
  profilesCount: profile?.scoutProfilesCount || 0,
})

const buildMetricItems = metrics => [
  {
    id: 'leagues',
    entity: 'club',
    iconId: 'league',
    label: 'ליגות שנבחרו',
    value: metrics.leaguesCount || 0,
  },
  {
    id: 'teams',
    entity: 'teams',
    iconId: 'teams',
    label: 'קבוצות שנבחרו',
    value: metrics.teamsCount || 0,
  },
  {
    id: 'players',
    entity: 'player',
    iconId: 'player',
    label: 'שחקנים שנבחרו',
    value: metrics.playersCount || 0,
  },
  {
    id: 'stats',
    entity: 'taskAnalyst',
    iconId: 'stats',
    label: 'שחקנים עם סטטיסטיקה',
    value: metrics.statsCount || 0,
  },
  {
    id: 'profiles',
    entity: 'scouting',
    iconId: 'playersDatabase',
    label: 'שחקנים עם פרופילים',
    value: metrics.profilesCount || 0,
  },
]

const buildScoutProfileItems = profile =>
  getScoutProfileRows(profile?.profileCounts)
    .filter(item => Number(item.count) > 0)
    .map(item => ({
      id: item.profileId,
      label: item.label,
      value: item.count,
      iconId: item.idIcon,
      description: createDescription(item.profileId),
    }))

function MetricCube({ item }) {
  return (
    <Box sx={sx.metricCube(item.entity)}>
      <Box sx={sx.metricHeader}>
        {item.iconId ? (
          <Box sx={sx.metricIcon(item.entity)}>
            {iconUi({ id: item.iconId, size: 'sm' })}
          </Box>
        ) : null}

        <Typography sx={sx.metricLabel}>{item.label}</Typography>
      </Box>

      <Typography sx={sx.metricValue(item.entity)}>{item.value}</Typography>
    </Box>
  )
}

function MetricsPreview({ items }) {
  const firstRow = items.slice(0, 3)
  const secondRow = items.slice(3, 5)

  return (
    <Box sx={sx.metricsSection}>
      <Box sx={sx.metricsRowThree}>
        {firstRow.map(item => <MetricCube key={item.id} item={item} />)}
      </Box>

      <Box sx={sx.metricsRowTwo}>
        {secondRow.map(item => <MetricCube key={item.id} item={item} />)}
      </Box>
    </Box>
  )
}

function ScoutProfileRow({ item }) {
  return (
    <Box sx={sx.scoutProfileRow}>
      <Box sx={sx.scoutProfileInfoCube}>
        <Box sx={sx.scoutProfileHeader}>
          {item.iconId ? (
            <Box sx={sx.scoutProfileIcon}>
              {iconUi({ id: item.iconId, size: 'sm' })}
            </Box>
          ) : null}

          <Typography sx={sx.scoutProfileLabel}>{item.label}</Typography>
        </Box>

        <Typography sx={sx.scoutProfileDescription}>
          {item.description || 'אין מידע נוסף להצגה'}
        </Typography>
      </Box>

      <Box sx={sx.scoutProfileCountCube}>
        <Typography sx={sx.scoutProfileCountValue}>{item.value}</Typography>
        <Typography sx={sx.scoutProfileCountLabel}>שחקנים</Typography>
      </Box>
    </Box>
  )
}

function ScoutProfilesPreview({ items }) {
  if (!items.length) return null

  return (
    <Box sx={sx.scoutProfilesSection}>
      {items.map(item => <ScoutProfileRow key={item.id} item={item} />)}
    </Box>
  )
}

function PreviewDataStage({ profile, metrics }) {
  const metricItems = buildMetricItems(metrics)
  const scoutProfileItems = buildScoutProfileItems(profile)

  return (
    <Box sx={sx.stage}>
      <MetricsPreview items={metricItems} />
      <ScoutProfilesPreview items={scoutProfileItems} />
    </Box>
  )
}

function InitialState() {
  return (
    <Box sx={sx.initialState}>
      <Typography sx={sx.initialText}>
        {'לא נבחר סוג חיפוש.\nצריך לבחור לפחות שני סלקטים כדי להתחיל.'}
      </Typography>
    </Box>
  )
}

function PrimaryState({ title, subtitle }) {
  return (
    <Box sx={sx.primaryState}>
      {title ? <Typography sx={sx.primaryTitle}>{title}</Typography> : null}
      {subtitle ? <Typography sx={sx.primarySubtitle}>{subtitle}</Typography> : null}
    </Box>
  )
}

export default function ProfilePreview({ profile, previewState = {} }) {
  const stage = previewState.stage || 'initial'
  const selectionMetrics = previewState.selectionMetrics || {}
  const metrics = stage === 'selection' ? selectionMetrics : getProfileMetrics(profile)

  return (
    <Box sx={sx.root}>
      <Box sx={sx.toolbarWrap}>
        <PreviewToolbar
          profile={profile}
          searchMode={previewState.searchMode || 'all'}
          primaryFilter={previewState.primaryFilter || 'all'}
          leagueLevelsCount={previewState.leagueLevelsCount || 0}
          yearsCount={previewState.yearsCount || 0}
          disabled={stage === 'initial'}
        />
      </Box>

      <Box className="dpScrollThin" sx={sx.content}>
        {stage === 'initial' ? (
          <InitialState />
        ) : stage === 'primary' ? (
          <PrimaryState
            title={previewState.title}
            subtitle={previewState.subtitle}
          />
        ) : (
          <PreviewDataStage profile={profile} metrics={metrics} />
        )}
      </Box>
    </Box>
  )
}
