// src/features/playersDatabase/ui/pages/searchPage/logic/search.columns.js

import { Box, IconButton } from '@mui/joy'
import { KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material'

import FavoriteButton from '../../../components/favorites/FavoriteButton.js'
import LeagueName from '../../../components/leagues/LeagueName.js'
import ScoutPriority from '../../../../../../ui/patterns/scout/ScoutPriority.js'
import ScoutCompactTooltip from '../../../components/scout/ScoutCompactTooltip.js'
import ScoutProfileChip from '../../../components/scout/ScoutProfileChip.js'
import { buildScoutCompactView } from '../../../components/scout/scoutDisplay.model.js'
import { buildTableColumnWidth } from '../../../components/tables/tableWidths.js'
import { buildTableRankColumn } from '../../../components/tables/tableRankColumn.js'
import playerImage from '../../../../../../ui/core/images/playerImage.jpg'
import { searchResultsTableSx as sx } from '../results/sx/searchResultsTable.sx.js'
import {
  PLAYER_SEARCH_TABLE_WIDTHS,
  TEAM_SEARCH_TABLE_WIDTHS,
} from './searchTableWidths.js'

const playerColumnWidth = key => buildTableColumnWidth(PLAYER_SEARCH_TABLE_WIDTHS[key])
const teamColumnWidth = key => buildTableColumnWidth(TEAM_SEARCH_TABLE_WIDTHS[key])

const toNumberOrZero = value => {
  const number = Number(value)

  return Number.isFinite(number) ? number : 0
}

const searchResultLinkSx = {
  '& [data-link-indicator]': {
    display: 'none',
  },
}

const buildFavoriteColumn = ({ columnWidth, onFavoriteToggle }) => ({
  key: 'favorite',
  label: '',
  sortable: false,
  sx: { ...sx.favoriteColumn, ...columnWidth('favorite') },
  render: row => (
    <FavoriteButton
      favorite={row.favorite}
      loading={row.favoritePending}
      label={row.playerName || row.teamName}
      onToggle={() => onFavoriteToggle?.(row)}
    />
  ),
})

const buildActionsColumn = columnWidth => ({
  key: 'actions',
  label: '',
  sortable: false,
  sx: { ...sx.actionsColumn, ...columnWidth('actions') },
  render: (row, index, context = {}) => (
    <IconButton
      size='sm'
      variant='outlined'
      aria-label={context.isExpanded ? 'סגירת פרטים' : 'פתיחת פרטים'}
      sx={sx.actionButton}
      onClick={event => {
        event.stopPropagation()
        context.toggleExpanded?.()
      }}
    >
      {context.isExpanded ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
    </IconButton>
  ),
})

export function buildPlayerSearchColumns({ onFavoriteToggle } = {}) {
  return [
    {
      key: 'avatar', label: '', sortable: false,
      sx: { ...sx.avatarColumn, ...playerColumnWidth('avatar') },
      render: row => <Box component='img' src={row.avatarUrl || playerImage} alt='' sx={sx.avatar} />,
    },
    {
      key: 'playerName',
      label: 'שחקן',
      sx: { ...sx.playerColumn, ...playerColumnWidth('playerName') },
      linkSx: searchResultLinkSx,
      getHref: row => row.playerUrl,
      getLinkAriaLabel: row => `פתיחת קישור השחקן ${row.playerName || ''}`,
    },
    { key: 'birthYear', label: 'שנתון', sx: { ...sx.yearColumn, ...playerColumnWidth('birthYear') } },
    { key: 'ageGroupLabel', label: 'קבוצת גיל', sx: { ...sx.ageGroupColumn, ...playerColumnWidth('ageGroupLabel') } },
    { key: 'seasonKey', label: 'עונה', sx: { ...sx.seasonColumn, ...playerColumnWidth('seasonKey') } },
    { key: 'teamName', label: 'קבוצה', sx: { ...sx.teamColumn, ...playerColumnWidth('teamName') } },
    {
      key: 'leagueName',
      label: 'ליגה',
      sx: { ...sx.leagueColumn, ...playerColumnWidth('leagueName') },
      render: row => (
        <LeagueName
          value={row.leagueName}
          level={row.leagueLevel}
          showLevel
        />
      ),
      getSortValue: row => row.leagueName || '',
    },
    { key: 'minutes', label: 'דקות', sx: { ...sx.numberColumn, ...playerColumnWidth('minutes') } },
    {
      key: 'startsAppearances', label: 'הרכב',
      sx: { ...sx.numberColumn, ...playerColumnWidth('startsAppearances') },
      render: row => `${Number(row.starts || 0)}/${Number(row.appearances || 0)}`,
      getSortValue: row => Number(row.starts || 0),
    },
    { key: 'goals', label: 'שערים', sx: { ...sx.numberColumn, ...playerColumnWidth('goals') } },
    {
      key: 'primaryProfile', label: 'פרופיל סקאוט',
      sx: { ...sx.profileColumn, ...playerColumnWidth('primaryProfile') },
      render: row => {
        const profileView = buildScoutCompactView({
          profiles: row.scoutProfiles,
          combinations: row.scoutCombinations,
          display: row.scoutProfileDisplay,
          fallbackLabel: row.primaryProfile,
        })

        if (!profileView.label || profileView.label === '-') return '-'

        return (
          <Box sx={sx.profileCell}>
            <ScoutProfileChip
              label={profileView.label}
              tooltip={(
                <ScoutCompactTooltip
                  title={profileView.tooltipTitle}
                  items={profileView.tooltipItems}
                  isCombination={profileView.isCombination}
                />
              )}
              variant={profileView.variant}
              fontSize={11}
            />
          </Box>
        )
      },
    },
    buildFavoriteColumn({
      columnWidth: playerColumnWidth,
      onFavoriteToggle,
    }),
    buildActionsColumn(playerColumnWidth),
  ]
}


const OPPORTUNITY_LABELS = {
  proven_quality: 'איכות מוכחת',
  interesting_anomaly: 'אנומליה מעניינת',
  quality_anomaly: 'איכות ואנומליה',
  above_target: 'ביצוע מעל היעד',
  neutral: 'ללא יתרון מובהק',
  unavailable: 'לא זמין',
}

const buildTeamPriorityTooltip = ({ sideLabel, performance = {} }) => {
  const score = Number(performance.scoutPriorityScore)
  const scoreLabel = Number.isFinite(score) ? `${Math.round(score)}` : '—'
  const opportunityKey = String(performance.opportunityType || '').trim()
  const opportunityLabel = OPPORTUNITY_LABELS[opportunityKey] || ''

  return opportunityLabel && opportunityKey !== 'unavailable'
    ? `${sideLabel}: ${scoreLabel} · ${opportunityLabel}`
    : `${sideLabel}: ${scoreLabel}`
}

export function buildTeamSearchColumns({ onFavoriteToggle } = {}) {
  return [
    {
      key: 'teamName',
      label: 'קבוצה',
      sx: { ...sx.teamColumn, ...teamColumnWidth('teamName') },
      linkSx: searchResultLinkSx,
      getHref: row => row.teamUrl,
      getLinkAriaLabel: row => `פתיחת קישור הקבוצה ${row.teamName || ''}`,
    },
    { key: 'birthYear', label: 'שנתון', sx: { ...sx.yearColumn, ...teamColumnWidth('birthYear') } },
    { key: 'ageGroupLabel', label: 'קבוצת גיל', sx: { ...sx.ageGroupColumn, ...teamColumnWidth('ageGroupLabel') } },
    { key: 'seasonKey', label: 'עונה', sx: { ...sx.seasonColumn, ...teamColumnWidth('seasonKey') } },
    {
      key: 'leagueName',
      label: 'ליגה',
      sx: { ...sx.leagueColumn, ...teamColumnWidth('leagueName') },
      render: row => (
        <LeagueName
          value={row.leagueName}
          level={row.leagueLevel}
          showLevel
        />
      ),
      getSortValue: row => row.leagueName || '',
    },
    buildTableRankColumn({
      sx: { ...sx.numberColumn, ...teamColumnWidth('tableRank') },
    }),
    { key: 'appearances', label: 'משחקים', sx: { ...sx.numberColumn, ...teamColumnWidth('appearances') } },
    { key: 'goalsFor', label: 'זכות', sx: { ...sx.numberColumn, ...teamColumnWidth('goalsFor') } },
    { key: 'goalsAgainst', label: 'חובה', sx: { ...sx.numberColumn, ...teamColumnWidth('goalsAgainst') } },
    {
      key: 'attackPriority', label: 'עדיפות התקפית',
      sx: { ...sx.priorityColumn, ...teamColumnWidth('attackPriority') },
      render: row => (
        <ScoutPriority
          value={row.offense?.priorityLevel}
          tooltip={buildTeamPriorityTooltip({
            sideLabel: 'עדיפות התקפית',
            performance: row.offense,
          })}
          short
          fontSize={11}
        />
      ),
      getSortValue: row => toNumberOrZero(row.offense?.scoutPriorityScore),
    },
    {
      key: 'defensePriority', label: 'עדיפות הגנתית',
      sx: { ...sx.priorityColumn, ...teamColumnWidth('defensePriority') },
      render: row => (
        <ScoutPriority
          value={row.defense?.priorityLevel}
          tooltip={buildTeamPriorityTooltip({
            sideLabel: 'עדיפות הגנתית',
            performance: row.defense,
          })}
          short
          fontSize={11}
        />
      ),
      getSortValue: row => toNumberOrZero(row.defense?.scoutPriorityScore),
    },
    { key: 'playersCount', label: 'שחקנים', sx: { ...sx.numberColumn, ...teamColumnWidth('playersCount') } },
    buildFavoriteColumn({
      columnWidth: teamColumnWidth,
      onFavoriteToggle,
    }),
    buildActionsColumn(teamColumnWidth),
  ]
}

export function buildSearchColumns({
  entityType = 'player',
  onFavoriteToggle,
} = {}) {
  return entityType === 'team'
    ? buildTeamSearchColumns({ onFavoriteToggle })
    : buildPlayerSearchColumns({ onFavoriteToggle })
}
