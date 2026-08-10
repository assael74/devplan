// features/playersDatabase/ui/pages/leaguePage/logic/leagueTeams.columns.js

import {
  Box,
  IconButton,
  Tooltip,
} from '@mui/joy'

import { buildTableColumnWidth } from '../../../components/tables/tableWidths.js'
import { buildTableRankColumn } from '../../../components/tables/tableRankColumn.js'
import FavoriteButton from '../../../components/actions/FavoriteButton.js'
import ScoutBadge from '../../../components/scout/ScoutBadge.js'
import TeamName from '../../../components/entities/TeamName.js'
import { iconUi } from '../../../../../../ui/core/icons/iconUi.js'
import { buildFallbackAvatar } from '../../../../../../ui/core/avatars/fallbackAvatar.js'
import { LEAGUE_TEAMS_TABLE_WIDTHS } from './leagueTableWidths.js'
import { leagueTeamsColumnsSx as sx } from '../sx/leagueTeams.columns.sx.js'

import { pickDefinedValue } from '../../../../model/value.model.js'
const toCount = value => {
  const nextValue = Number(value)
  return Number.isFinite(nextValue) ? nextValue : 0
}

const clean = value => String(value || '').trim()

const toNumericValue = value => {
  if (value === null || value === undefined || value === '') {
    return null
  }

  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null
  }

  const normalizedValue = String(value)
    .replace('%', '')
    .replace(',', '.')
    .trim()

  const nextValue = Number(normalizedValue)

  return Number.isFinite(nextValue)
    ? nextValue
    : null
}

const resolvePrioritySortValue = value => {
  const directValue = toNumericValue(value)
  if (directValue !== null) return directValue

  if (!value || typeof value !== 'object') {
    return String(value || '')
  }

  const numericCandidates = [
    value.percentage,
    value.percent,
    value.performancePercentage,
    value.targetPercentage,
    value.score,
    value.value,
    value.ratio,
  ]

  for (const candidate of numericCandidates) {
    const numericValue = toNumericValue(candidate)

    if (numericValue !== null) {
      return numericValue
    }
  }

  return (
    value.label ||
    value.level ||
    value.priority ||
    ''
  )
}


const OPPORTUNITY_LABELS = {
  proven_quality: 'איכות מוכחת',
  interesting_anomaly: 'אנומליה מעניינת',
  quality_anomaly: 'איכות ואנומליה',
  above_target: 'ביצוע מעל היעד',
  neutral: 'ללא יתרון מובהק',
  unavailable: 'לא זמין',
}

const formatRate = value => {
  const number = toNumericValue(value)
  return number === null ? 'לא זמין' : `${Math.round(number)}%`
}

const formatScore = value => {
  const number = toNumericValue(value)
  return number === null ? 'לא זמין' : `${Math.round(number)}`
}

const formatNormalizedScore = formatScore

const buildPriorityTooltip = ({ sideLabel, view }) => {
  const opportunity = OPPORTUNITY_LABELS[view?.opportunityType] || 'לא זמין'

  return (
    <Box>
      <Box>{`עדיפות ${sideLabel}: ${formatScore(pickDefinedValue(view?.priority?.score, view?.priority?.rate))}`}</Box>
      <Box>{`סוג הזדמנות: ${opportunity}`}</Box>
      <Box>{`איכות מוחלטת: ${formatNormalizedScore(view?.quality?.rate)}`}</Box>
      <Box>{`ביצוע מול יעד מנורמל: ${formatNormalizedScore(pickDefinedValue(view?.target?.normalized, view?.target?.rate))}`}</Box>
      <Box>{`חריגה מהמיקום מנורמלת: ${formatNormalizedScore(pickDefinedValue(view?.ranking?.normalized, view?.ranking?.rate))}`}</Box>
      <Box>{`ציון אנומליה: ${formatRate(view?.anomaly?.rate)}`}</Box>
    </Box>
  )
}


const columnWidth = key => buildTableColumnWidth(
  LEAGUE_TEAMS_TABLE_WIDTHS[key]
)

const resolveTeamNameStatus = row => {
  const playersCount = toCount(
    row.playersCount ||
    row.rosterCount ||
    row.teamPlayersCount
  )
  const profilesCount = toCount(
    row.profilesCount ||
    row.scoutProfilesCount ||
    row.scoutProfilesSummary?.total
  )

  if (!playersCount) return 'emptyRoster'
  if (!profilesCount) return 'rosterOnly'

  return 'hasProfiles'
}

const resolveTeamNameSx = row => ({
  ...sx.teamNameStatus[resolveTeamNameStatus(row)],
})

export const buildLeagueTeamsColumns = ({
  onTeamOpen,
  onTeamUrlEdit,
  onFavoriteToggle,
}) => {
  return [
  buildTableRankColumn({
    sx: {
      ...sx.rankColumn,
      ...columnWidth('tableRank'),
    },
    defaultSortDirection: 'asc',
  }),
  {
    key: 'teamAvatar',
    label: '',
    sortable: false,
    sx: {
      ...sx.avatarColumn,
      ...columnWidth('teamAvatar'),
    },
    render: row => (
      <Box
        component='img'
        src={buildFallbackAvatar({
          entityType: 'team',
          id: row.id,
          name: row.name,
          subline: row.teamSlot && row.teamSlot !== '1'
            ? row.teamSlot
            : '',
        })}
        alt=''
        sx={sx.teamAvatar}
      />
    ),
  },
  {
    key: 'name',
    label: 'קבוצה',
    sx: {
      ...sx.teamNameColumn,
      ...columnWidth('name'),
    },
    headerSx: sx.teamNameHeader,
    cellSx: row => ({
      ...sx.teamNameCell,
      ...resolveTeamNameSx(row),
    }),
    getHref: row => row.teamUrl,
    getLinkAriaLabel: row => (
      `פתיחת קישור הקבוצה ${row.name || ''}`
    ),
    getSortValue: row => row.name || '',
    linkSx: row => resolveTeamNameSx(row),
    render: row => (
      <TeamName
        value={row.name}
        slot={row.teamSlot}
        fontSize={13}
        nameSx={sx.teamNameInherit}
      />
    ),
  },
  {
    key: 'games',
    label: 'משחקים',
    sx: {
      ...sx.compactTableColumn,
      ...columnWidth('games'),
    },
    getSortValue: row => toCount(row.games),
  },
  {
    key: 'goalsFor',
    label: 'שערים שכבשו',
    sx: {
      ...sx.compactTableColumn,
      ...columnWidth('goalsFor'),
    },
    getSortValue: row => toCount(row.goalsFor),
  },
  {
    key: 'goalsAgainst',
    label: 'שערים שספגו',
    sx: {
      ...sx.compactTableColumn,
      ...columnWidth('goalsAgainst'),
    },
    getSortValue: row => toCount(row.goalsAgainst),
  },
  {
    key: 'points',
    label: 'נקודות',
    sx: {
      ...sx.compactTableColumn,
      ...columnWidth('points'),
    },
    getSortValue: row => toCount(row.points),
  },
  {
    key: 'attackPriority',
    label: 'עדיפות התקפית',
    sx: {
      ...sx.priorityColumn,
      ...columnWidth('attackPriority'),
    },
    getSortValue: row => (
      resolvePrioritySortValue(
        pickDefinedValue(
          row?.performanceView?.offense?.priority?.score,
          row?.performanceView?.offense?.priority?.rate,
        )
      )
    ),
    render: row => {
      const view = row?.performanceView?.offense || {}

      return (
        <ScoutBadge
          value={view.priority?.level || 'unavailable'}
          tooltip={buildPriorityTooltip({
            sideLabel: 'התקפית',
            view,
          })}
          short
          fontSize={11}
        />
      )
    },
  },
  {
    key: 'defensePriority',
    label: 'עדיפות הגנתית',
    sx: {
      ...sx.priorityColumn,
      ...columnWidth('defensePriority'),
    },
    getSortValue: row => (
      resolvePrioritySortValue(
        pickDefinedValue(
          row?.performanceView?.defense?.priority?.score,
          row?.performanceView?.defense?.priority?.rate,
        )
      )
    ),
    render: row => {
      const view = row?.performanceView?.defense || {}

      return (
        <ScoutBadge
          value={view.priority?.level || 'unavailable'}
          tooltip={buildPriorityTooltip({
            sideLabel: 'הגנתית',
            view,
          })}
          short
          fontSize={11}
        />
      )
    },
  },
  {
    key: 'rosterProfiles',
    label: 'סגל / שחקנים / פרופילים',
    sx: {
      ...sx.rosterProfilesColumn,
      ...columnWidth('rosterProfiles'),
    },
    getSortValue: row => (
      (toCount(row.playersCount) * 1000000) +
      (toCount(row.profilesCount) * 1000) +
      toCount(row.profileAssignmentsCount)
    ),
    render: row => (
      <Box sx={sx.rosterProfilesCell}>
        <Box component='span' sx={sx.rosterProfilesValue}>
          {row.playersCount || 0}
        </Box>
        <Box component='span' sx={sx.rosterProfilesDivider}>/</Box>
        <Box component='span' sx={sx.rosterProfilesValue}>
          {row.profilesCount || 0}
        </Box>
        <Box component='span' sx={sx.rosterProfilesDivider}>/</Box>
        <Box component='span' sx={sx.rosterProfilesValue}>
          {row.profileAssignmentsCount || 0}
        </Box>
      </Box>
    ),
  },
  {
    key: 'favorite',
    label: '',
    sortable: false,
    sx: {
      ...sx.actionColumn,
      ...columnWidth('favorite'),
    },
    render: row => (
      <FavoriteButton
        favorite={row.favorite}
        loading={row.favoritePending}
        label={row.name}
        onToggle={() => onFavoriteToggle?.(row)}
      />
    ),
  },
  {
    key: 'actions',
    label: '',
    sortable: false,
    sx: {
      ...sx.actionColumn,
      ...columnWidth('actions'),
    },
    headerSx: sx.actionHeader,
    render: row => (
      <Box sx={sx.rowActions}>
        <Tooltip title='כניסה לקבוצה'>
          <IconButton
            size='sm'
            variant='outlined'
            aria-label='כניסה לקבוצה'
            sx={sx.tableButton}
            onClick={() => onTeamOpen(row)}
          >
            {iconUi({
              id: 'view',
              size: 'sm',
            })}
          </IconButton>
        </Tooltip>

        <Tooltip title='פעולות נוספות'>
          <IconButton
            size='sm'
            variant='outlined'
            aria-label='פעולות נוספות'
            sx={sx.tableButton}
            onClick={event => {
              event.stopPropagation()
              onTeamUrlEdit(row)
            }}
          >
            {iconUi({
              id: 'more',
              size: 'sm',
            })}
          </IconButton>
        </Tooltip>
      </Box>
    ),
  },
  ]
}
