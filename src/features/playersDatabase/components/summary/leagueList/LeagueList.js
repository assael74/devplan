// features/playersDatabase/components/summary/leagueList/LeagueList.js

import React from 'react'
import {
  Box,
  Button,
  Typography,
} from '@mui/joy'

import {
  getLeagueLevelLabel,
  getLeagueRegionLabel,
} from '../../leagues/leagueUtils.js'
import {
  getSummaryDisplayScoutProfilesCount,
  getSummaryLeagueBirthYear,
} from '../logic/index.js'
import { Toolbar } from './toolbar/index.js'
import { leagueListSx as sx } from './leagueList.sx.js'

function LeagueMeta({
  league,
  birthYear,
  scoutProfilesCount,
  opportunityCount,
  maxLevelGap,
}) {
  return (
    <Typography level="body-xs" sx={sx.meta}>
      <span>{getLeagueLevelLabel(league.level)}</span>
      <span>{getLeagueRegionLabel(league.region)}</span>

      {birthYear ? <span>{birthYear}</span> : null}

      {scoutProfilesCount > 0 ? (
        <Box component="span" sx={sx.metaChip}>
          {scoutProfilesCount} פרופ׳
        </Box>
      ) : null}

      {opportunityCount > 0 ? (
        <Box component="span" sx={sx.metaChipWarning}>
          {opportunityCount} בסיכון
        </Box>
      ) : null}

      {maxLevelGap > 0 ? (
        <Box component="span" sx={sx.metaChipDanger}>
          פער {maxLevelGap}
        </Box>
      ) : null}
    </Typography>
  )
}

function LeagueItem({ league, selected, insight, onSelect }) {
  const birthYear = getSummaryLeagueBirthYear(league)
  const scoutProfilesCount = getSummaryDisplayScoutProfilesCount({
    league,
    insight,
  })
  const opportunityCount = Number(insight.opportunityCount) || 0
  const maxLevelGap = Number(insight.maxLevelGap) || 0

  return (
    <Button
      size="sm"
      variant="plain"
      color="neutral"
      className={selected ? 'isSelected' : ''}
      onClick={() => onSelect(league.id)}
      sx={sx.item}
    >
      <Box sx={sx.text}>
        <Typography level="body-sm" sx={sx.itemTitle}>
          {league.ageGroupLabel}
          {' | '}
          {league.leagueName}
        </Typography>

        <LeagueMeta
          league={league}
          birthYear={birthYear}
          scoutProfilesCount={scoutProfilesCount}
          opportunityCount={opportunityCount}
          maxLevelGap={maxLevelGap}
        />
      </Box>
    </Button>
  )
}

export default function LeagueList({
  leagues,
  selectedId,
  birthYearFilter,
  levelFilter,
  birthYearOptions,
  levelOptions,
  leagueInsightsById = {},
  onBirthYearChange,
  onLevelChange,
  onSelect,
}) {
  return (
    <Box sx={sx.root}>
      <Toolbar
        birthYearFilter={birthYearFilter}
        levelFilter={levelFilter}
        birthYearOptions={birthYearOptions}
        levelOptions={levelOptions}
        onBirthYearChange={onBirthYearChange}
        onLevelChange={onLevelChange}
      />

      <Box className="dpScrollThin" sx={sx.list}>
        {leagues.map(league => (
          <LeagueItem
            key={league.id}
            league={league}
            selected={league.id === selectedId}
            insight={leagueInsightsById[league.id] || {}}
            onSelect={onSelect}
          />
        ))}
      </Box>
    </Box>
  )
}
