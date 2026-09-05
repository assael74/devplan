// features/playersDatabase/ui/pages/searchPage/logic/search.columns.js

import {
  Box,
  IconButton,
} from '@mui/joy'
import {
  KeyboardArrowDown,
  KeyboardArrowUp,
} from '@mui/icons-material'

import { iconUi } from '../../../../../../ui/core/icons/iconUi.js'

import FavoriteButton from '../../../components/actions/FavoriteButton.js'
import LeagueName from '../../../components/entities/LeagueName.js'
import ScoutPriority from '../../../../../../ui/patterns/scout/ScoutPriority.js'
import ScoutProfileChipV2, {
  resolveScoutProfileDepthPct,
} from '../../../components/scout/ScoutProfileChipV2.js'
import { buildScoutCompactView } from '../../../components/scout/scoutDisplay.model.js'
import { buildTableColumnWidth } from '../../../components/tables/tableWidths.js'
import { buildTableRankColumn } from '../../../components/tables/tableRankColumn.js'
import { dataTableColumnsSx as columnSx } from '../../../components/tables/dataTable/sx/dataTableColumns.sx.js'
import { dataTableActionsSx as actionSx } from '../../../components/tables/dataTable/sx/dataTableActions.sx.js'
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

const buildFavoriteColumn = ({ width, onFavoriteToggle }) => ({
  key: 'favorite',
  label: '',
  sortable: false,
  sx: sx.favoriteColumn(width),
  render: row => (
    <FavoriteButton
      favorite={row.favorite}
      loading={row.favoritePending}
      label={row.playerName || row.teamName}
      onToggle={() => onFavoriteToggle?.(row)}
    />
  ),
})

const buildActionsColumn = ({ width, onEntityOpen }) => ({
  key: 'actions',
  label: '',
  sortable: false,
  sx: sx.actionsColumn(width),
  render: (row, index, context = {}) => (
    <Box sx={actionSx.rowActions}>
      <IconButton
        size='sm'
        variant='outlined'
        aria-label='פתיחת עמוד במאגר'
        sx={actionSx.smallActionButton}
        onClick={event => {
          event.stopPropagation()

          if (typeof onEntityOpen === 'function') {
            onEntityOpen(row)
          }
        }}
      >
        {iconUi({
          id: 'view',
          size: 'sm',
        })}
      </IconButton>

      <IconButton
        size='sm'
        variant='outlined'
        aria-label={context.isExpanded ? 'סגירת פרטים' : 'פתיחת פרטים'}
        sx={actionSx.smallActionButton}
        onClick={event => {
          event.stopPropagation()
          context.toggleExpanded?.()
        }}
      >
        {context.isExpanded ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
      </IconButton>
    </Box>
  ),
})

export function buildPlayerSearchColumns({ onEntityOpen, onFavoriteToggle } = {}) {
  return [
    {
      key: 'avatar',
      label: '',
      sortable: false,
      sx: {
        ...columnSx.avatarColumn,
        ...playerColumnWidth('avatar'),
      },
      render: row => (
        <Box
          component='img'
          src={row.avatarUrl || playerImage}
          alt=''
          sx={columnSx.avatarImage}
        />
      ),
    },
    {
      key: 'playerName',
      label: 'שחקן',
      sx: {
        ...columnSx.nameColumn,
        ...playerColumnWidth('playerName'),
      },
      linkSx: searchResultLinkSx,
      getHref: row => row.playerUrl,
      getLinkAriaLabel: row => `פתיחת קישור השחקן ${row.playerName || ''}`,
    },
    {
      key: 'birthYear',
      label: 'שנתון',
      sx: {
        ...columnSx.numericColumn,
        ...playerColumnWidth('birthYear'),
      },
    },
    {
      key: 'ageGroupLabel',
      label: 'קבוצת גיל',
      sx: {
        ...columnSx.numericColumn,
        ...playerColumnWidth('ageGroupLabel'),
      },
    },
    {
      key: 'seasonKey',
      label: 'עונה',
      sx: {
        ...columnSx.numericColumn,
        ...playerColumnWidth('seasonKey'),
      },
    },
    {
      key: 'teamName',
      label: 'קבוצה',
      sx: {
        ...columnSx.nameColumn,
        ...playerColumnWidth('teamName'),
      },
    },
    {
      key: 'leagueName',
      label: 'ליגה',
      sx: {
        ...columnSx.nameColumn,
        ...playerColumnWidth('leagueName'),
      },
      render: row => (
        <LeagueName
          value={row.leagueName}
          level={row.leagueLevel}
          showLevel
        />
      ),
      getSortValue: row => row.leagueName || '',
    },
    {
      key: 'minutes',
      label: 'דקות',
      sx: {
        ...columnSx.numericColumn,
        ...playerColumnWidth('minutes'),
      },
    },
    {
      key: 'startsAppearances',
      label: 'הרכב',
      sx: {
        ...columnSx.numericColumn,
        ...playerColumnWidth('startsAppearances'),
      },
      render: row => `${Number(row.starts || 0)}/${Number(row.appearances || 0)}`,
      getSortValue: row => Number(row.starts || 0),
    },
    {
      key: 'goals',
      label: 'שערים',
      sx: {
        ...columnSx.numericColumn,
        ...playerColumnWidth('goals'),
      },
    },
    {
      key: 'primaryProfile',
      label: 'פרופיל סקאוט',
      sx: {
        ...columnSx.profileColumn,
        ...playerColumnWidth('primaryProfile'),
      },
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
            <ScoutProfileChipV2
              profileId={profileView.primaryItem?.id || ''}
              label={profileView.label}
              profile={profileView.primaryItem?.source}
              profiles={profileView.displayItems
                .filter(item => item.type === 'profile')
                .map(item => item.source)}
              depthPct={resolveScoutProfileDepthPct(profileView.primaryItem?.source)}
              isFilter={profileView.isCombination}
              showConditions
              showConditionsDepth
            />
          </Box>
        )
      },
    },
    buildFavoriteColumn({
      width: PLAYER_SEARCH_TABLE_WIDTHS.favorite,
      onFavoriteToggle,
    }),
    buildActionsColumn({
      width: PLAYER_SEARCH_TABLE_WIDTHS.actions,
      onEntityOpen,
    }),
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

export function buildTeamSearchColumns({ onEntityOpen, onFavoriteToggle } = {}) {
  return [
    {
      key: 'teamName',
      label: 'קבוצה',
      sx: {
        ...columnSx.nameColumn,
        ...teamColumnWidth('teamName'),
      },
      linkSx: searchResultLinkSx,
      getHref: row => row.teamUrl,
      getLinkAriaLabel: row => `פתיחת קישור הקבוצה ${row.teamName || ''}`,
    },
    {
      key: 'birthYear',
      label: 'שנתון',
      sx: {
        ...columnSx.numericColumn,
        ...teamColumnWidth('birthYear'),
      },
    },
    {
      key: 'ageGroupLabel',
      label: 'קבוצת גיל',
      sx: {
        ...columnSx.numericColumn,
        ...teamColumnWidth('ageGroupLabel'),
      },
    },
    {
      key: 'seasonKey',
      label: 'עונה',
      sx: {
        ...columnSx.numericColumn,
        ...teamColumnWidth('seasonKey'),
      },
    },
    {
      key: 'leagueName',
      label: 'ליגה',
      sx: {
        ...columnSx.nameColumn,
        ...teamColumnWidth('leagueName'),
      },
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
      sx: {
        ...columnSx.numericColumn,
        ...teamColumnWidth('tableRank'),
      },
    }),
    {
      key: 'appearances',
      label: 'משחקים',
      sx: {
        ...columnSx.numericColumn,
        ...teamColumnWidth('appearances'),
      },
    },
    {
      key: 'goalsFor',
      label: 'זכות',
      sx: {
        ...columnSx.numericColumn,
        ...teamColumnWidth('goalsFor'),
      },
    },
    {
      key: 'goalsAgainst',
      label: 'חובה',
      sx: {
        ...columnSx.numericColumn,
        ...teamColumnWidth('goalsAgainst'),
      },
    },
    {
      key: 'attackPriority',
      label: 'עדיפות התקפית',
      sx: {
        ...columnSx.numericColumn,
        ...teamColumnWidth('attackPriority'),
      },
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
      key: 'defensePriority',
      label: 'עדיפות הגנתית',
      sx: {
        ...columnSx.numericColumn,
        ...teamColumnWidth('defensePriority'),
      },
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
    {
      key: 'playersCount',
      label: 'שחקנים',
      sx: {
        ...columnSx.numericColumn,
        ...teamColumnWidth('playersCount'),
      },
    },
    buildFavoriteColumn({
      width: TEAM_SEARCH_TABLE_WIDTHS.favorite,
      onFavoriteToggle,
    }),
    buildActionsColumn({
      width: TEAM_SEARCH_TABLE_WIDTHS.actions,
      onEntityOpen,
    }),
  ]
}

export function buildSearchColumns({ entityType = 'player', onEntityOpen, onFavoriteToggle } = {}) {
  const columnOptions = {
    onEntityOpen,
    onFavoriteToggle,
  }

  return entityType === 'team'
    ? buildTeamSearchColumns(columnOptions)
    : buildPlayerSearchColumns(columnOptions)
}
