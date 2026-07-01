// src/features/playersDatabase/components/leagues/board/BoardList.js

import React from 'react'
import {
  Box,
  Button,
  Option,
  Select,
  Typography,
} from '@mui/joy'

import {
  getLeagueLevelLabel,
  getLeagueRegionLabel,
  getLeagueSeasonRows,
} from '../leagueUtils.js'
import { listSx as sx } from './sx/list.sx.js'

const getBirthYear = league => {
  const years = getLeagueSeasonRows(league)
    .map(season => Number(season.primaryBirthYear || season.birthYear))
    .filter(Number.isFinite)

  return years.length ? Math.min(...years) : ''
}

const getScoutProfilesCount = league => (
  Object.values(league?.teamsIndex || {})
    .reduce((acc, team) => acc + (Number(team?.scoutProfilesCount) || 0), 0)
)

export default function BoardList({
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
      <Box sx={sx.toolbar}>
        <Typography level="title-sm" sx={sx.toolbarTitle}>
          ליגות המאגר
        </Typography>

        <Box sx={sx.filters}>
          <Select
            size="sm"
            value={birthYearFilter}
            sx={sx.filterSelect}
            onChange={(event, value) => onBirthYearChange(value || 'all')}
          >
            {birthYearOptions.map(option => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>

          <Select
            size="sm"
            value={levelFilter}
            sx={sx.filterSelect}
            onChange={(event, value) => onLevelChange(value || 'all')}
          >
            {levelOptions.map(option => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>
        </Box>
      </Box>

      <Box className="dpScrollThin" sx={sx.list}>
        {leagues.map(league => {
          const selected = league.id === selectedId
          const birthYear = getBirthYear(league)
          const insight = leagueInsightsById[league.id] || {}
          const scoutProfilesCount = (() => {
            if (insight.scoutProfilesCount !== null &&
                insight.scoutProfilesCount !== undefined) {
              return insight.scoutProfilesCount
            }

            return getScoutProfilesCount(league)
          })()
          const opportunityCount = Number(insight.opportunityCount) || 0
          const maxLevelGap = Number(insight.maxLevelGap) || 0

          return (
            <Button
              key={league.id}
              size="sm"
              variant="plain"
              color="neutral"
              className={selected ? 'isSelected' : ''}
              onClick={() => onSelect(league.id)}
              sx={sx.item}
            >
              <Box sx={sx.text}>
                <Typography
                  level="body-sm"
                  sx={sx.title}
                >
                  {league.ageGroupLabel}
                  {' | '}
                  {league.leagueName}
                </Typography>

                <Typography
                  level="body-xs"
                  sx={sx.meta}
                >
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
              </Box>
            </Button>
          )
        })}
      </Box>
    </Box>
  )
}
