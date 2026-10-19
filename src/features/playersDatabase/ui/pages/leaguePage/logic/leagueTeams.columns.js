// src/features/playersDatabase/ui/pages/leaguePage/logic/leagueTeams.columns.js

import {
  Box,
  IconButton,
  Tooltip,
} from '@mui/joy'

import { buildTableColumnWidth } from '../../../components/tables/tableWidths.js'
import { dataTableColumnsSx as columnSx } from '../../../components/tables/dataTable/sx/dataTableColumns.sx.js'
import { dataTableActionsSx as actionSx } from '../../../components/tables/dataTable/sx/dataTableActions.sx.js'
import { buildTableRankColumn } from '../../../components/tables/tableRankColumn.js'
import FavoriteButton from '../../../components/actions/FavoriteButton.js'
import TeamPriorityBadge from '../../../components/scout/shared/TeamPriorityBadge.js'
import TeamName from '../../../components/entities/TeamName.js'
import TeamSignalLevelBadge from '../../../components/teamSignals/TeamSignalLevelBadge.js'
import LeagueFutureCompetitionBadge from '../components/LeagueFutureCompetitionBadge.js'
import { readTeamSignalSummary } from '../../../../domain/signals/teamSignalSummary.js'
import { iconUi } from '../../../../../../ui/core/icons/iconUi.js'
import teamLogo from '../../../../../../ui/core/images/teamLogo.png'
import { LEAGUE_TEAMS_TABLE_WIDTHS } from './leagueTableWidths.js'
import { leagueTeamsColumnsSx as sx } from '../sx/leagueTeams.columns.sx.js'

import { pickDefinedValue } from '../../../../model/shared/value.model.js'
const toCount = value => {
  const nextValue = Number(value)
  return Number.isFinite(nextValue) ? nextValue : 0
}

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


const RESEARCH_COLUMNS = [
  { key: 'performanceSignal', label: 'ביצועים', familyId: 'performance' },
  { key: 'rosterBalanceSignal', label: 'איזון', familyId: 'roster-balance' },
  { key: 'yearMovementsSignal', label: 'מעברים', familyId: 'year-movements' },
  { key: 'futureCompetitionSignal', label: 'צפי תחרות', familyId: 'future-competition' },
  { key: 'clubGapSignal', label: 'ביחס למועדון', familyId: 'club-gap' },
]

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
  researchMode = false,
  futureCompetitionContext,
}) => {
  const columnWidth = key => buildTableColumnWidth(LEAGUE_TEAMS_TABLE_WIDTHS[key])

  return [
  buildTableRankColumn({
    sx: {
      ...columnSx.indexColumn,
      ...columnWidth('tableRank'),
    },
    defaultSortDirection: 'asc',
  }),
  {
    key: 'teamAvatar',
    label: '',
    sortable: false,
    sx: {
      ...columnSx.avatarColumn,
      ...columnWidth('teamAvatar'),
    },
    render: row => (
      <Box sx={sx.teamLogoWrap}>
        <Box component='img' src={teamLogo} alt='' sx={sx.teamLogo} />
      </Box>
    ),
  },
  {
    key: 'name',
    label: 'קבוצה',
    sx: {
      ...columnSx.nameColumn,
      ...columnWidth('name'),
    },
    headerSx: {
      ...columnSx.nameHeader,
      ...sx.teamNameHeader,
    },
    cellSx: row => ({
      ...columnSx.nameCell,
      ...resolveTeamNameSx(row),
    }),
    getHref: row => row.teamUrl,
    getLinkAriaLabel: row => `פתיחת קישור הקבוצה ${row.name || ''}`,
    linkSx: row => ({
      ...resolveTeamNameSx(row),
      px: 0.5,
    }),
    getSortValue: row => row.name || '',
    render: row => (
      <Box sx={sx.teamSignalsCell}>
        <Box
          component='span'
          sx={sx.teamIdentityLink}
        >
          <TeamName
            value={row.name}
            slot={row.teamSlot}
            fontSize={13}
            nameSx={sx.teamNameInherit}
          />
          {row.showInvestigationIndicator ? (
            <Tooltip title='קיימת חקירה לקבוצה'>
              <Box component='span' aria-label='קיימת חקירה לקבוצה' sx={sx.investigationIcon}>
                {iconUi({ id: 'notes', size: 'sm' })}
              </Box>
            </Tooltip>
          ) : null}
        </Box>
      </Box>
    ),
  },
  {
    key: 'games',
    label: 'משחקים',
    sx: {
      ...columnSx.numericColumn,
      ...columnWidth('games'),
    },
    getSortValue: row => toCount(row.games),
  },
  {
    key: 'goalsFor',
    label: 'שערים שכבשו',
    sx: {
      ...columnSx.numericColumn,
      ...columnWidth('goalsFor'),
    },
    getSortValue: row => toCount(row.goalsFor),
  },
  {
    key: 'goalsAgainst',
    label: 'שערים שספגו',
    sx: {
      ...columnSx.numericColumn,
      ...columnWidth('goalsAgainst'),
    },
    getSortValue: row => toCount(row.goalsAgainst),
  },
  {
    key: 'points',
    label: 'נקודות',
    sx: {
      ...columnSx.numericColumn,
      ...columnWidth('points'),
    },
    getSortValue: row => toCount(row.points),
  },
  ...(researchMode ? [
  ...RESEARCH_COLUMNS.map(({ familyId, ...column }) => ({
    ...column,
    defaultSortDirection: 'desc',
    headerSx: sx.workAreaHeader,
    cellSx: sx.workAreaCell,
    sx: {
      ...columnSx.numericColumn,
      ...columnWidth('researchSignal'),
    },
    getSortValue: row => readTeamSignalSummary(row.teamSignalSummary).familiesById[familyId].level,
    render: row => (
      familyId === 'future-competition'
        ? <LeagueFutureCompetitionBadge row={row} context={futureCompetitionContext} />
        : <TeamSignalLevelBadge summary={row.teamSignalSummary} familyId={familyId} />
    ),
  })),
  {
    key: 'investigation',
    label: 'חקירה',
    defaultSortDirection: 'desc',
    headerSx: sx.workAreaHeader,
    cellSx: sx.workAreaCell,
    sx: {
      ...columnSx.numericColumn,
      ...columnWidth('investigation'),
    },
    getSortValue: row => row.showInvestigationIndicator === true ? 1 : 0,
    render: row => {
      const marked = row.showInvestigationIndicator === true
      const label = marked ? 'חקירה סומנה ידנית' : 'חקירה לא סומנה'

      return (
        <Tooltip title={label}>
          <Box
            component='span'
            role='img'
            aria-label={label}
            tabIndex={0}
            sx={sx.investigationStatus(marked)}
          >
            {iconUi({
              id: 'notes',
              size: 'sm',
              style: { color: 'inherit' },
              sx: { fontSize: 16 },
            })}
          </Box>
        </Tooltip>
      )
    },
  },
  ] : [
  {
    key: 'attackPriority',
    label: 'עדיפות התקפית',
    headerSx: sx.workAreaHeader,
    cellSx: sx.workAreaCell,
    sx: {
      ...columnSx.numericColumn,
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
        <TeamPriorityBadge
          side='offense'
          view={view}
          teamName={row.name}
          team={row}
          short
          fontSize={11}
        />
      )
    },
  },
  {
    key: 'defensePriority',
    label: 'עדיפות הגנתית',
    headerSx: sx.workAreaHeader,
    cellSx: sx.workAreaCell,
    sx: {
      ...columnSx.numericColumn,
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
        <TeamPriorityBadge
          side='defense'
          view={view}
          teamName={row.name}
          team={row}
          short
          fontSize={11}
        />
      )
    },
  },
  {
    key: 'playersCount',
    label: 'שחקנים בסגל',
    headerSx: sx.workAreaHeader,
    cellSx: sx.workAreaCell,
    sx: {
      ...columnSx.numericColumn,
      ...columnWidth('playersCount'),
    },
    getSortValue: row => toCount(row.playersCount),
    render: row => (
      <Box component='span'>{toCount(row.playersCount)}</Box>
    ),
  },
  {
    key: 'statsLoaded',
    label: 'סטטיסטיקה',
    headerSx: sx.workAreaHeader,
    cellSx: sx.workAreaCell,
    sx: {
      ...columnSx.numericColumn,
      ...columnWidth('statsLoaded'),
    },
    getSortValue: row => row.hasStats === true ? 1 : 0,
    render: row => {
      const loaded = row.hasStats === true
      const label = loaded ? 'נטענה סטטיסטיקה' : 'לא נטענה סטטיסטיקה'

      return (
        <Box
          component='span'
          role='img'
          aria-label={label}
          sx={sx.statsLoadedIndicator(loaded)}
        >
          {loaded ? iconUi({
            id: 'positivePriority',
            size: 'sm',
            style: { color: 'inherit' },
            sx: { fontSize: 18 },
          }) : '−'}
        </Box>
      )
    },
  },
  {
    key: 'statsGamesGap',
    label: 'פער משחקים',
    headerSx: sx.workAreaHeader,
    cellSx: sx.workAreaCell,
    sx: {
      ...columnSx.numericColumn,
      ...columnWidth('statsGamesGap'),
    },
    getSortValue: row => typeof row.statsStatus?.gap === 'number' ? row.statsStatus.gap : null,
    render: row => {
      const gap = row.statsStatus?.gap
      const known = typeof gap === 'number'
      const loaded = row.hasStats === true
      const description = row.statsStatus?.description || 'פער המשחקים אינו ידוע.'

      const content = (
        <Box
          component='span'
          tabIndex={!known && loaded ? 0 : undefined}
          aria-label={description}
          sx={sx.statsGamesGap(known ? gap : null)}
        >
          {known ? gap : loaded ? iconUi({
            id: 'infoOutline',
            size: 'sm',
            style: { color: 'inherit' },
            sx: { fontSize: 14 },
          }) : '−'}
        </Box>
      )

      return !known && loaded
        ? <Tooltip title='חסר בסיס להשוואת משחקים'>{content}</Tooltip>
        : content
    },
  },
  ]),
  {
    key: 'favorite',
    label: '',
    sortable: false,
    sx: {
      ...columnSx.actionsColumn,
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
      ...columnSx.actionsColumn,
      ...columnWidth('actions'),
    },
    headerSx: sx.actionHeader,
    render: row => (
      <Box sx={sx.rowActions}>
        <IconButton
            size='sm'
            variant='outlined'
            aria-label='כניסה לקבוצה'
            sx={actionSx.actionButton}
            onClick={() => onTeamOpen(row)}
          >
            {iconUi({
              id: 'view',
              size: 'sm',
            })}
          </IconButton>

        <IconButton
            size='sm'
            variant='outlined'
            aria-label={onTeamUrlEdit ? 'פעולות נוספות' : 'עריכת קישור קבוצה אינה זמינה כרגע'}
            disabled={!onTeamUrlEdit}
            sx={actionSx.actionButton}
            onClick={event => {
              event.stopPropagation()
              if (onTeamUrlEdit) onTeamUrlEdit(row)
            }}
          >
            {iconUi({
              id: 'more',
              size: 'sm',
            })}
          </IconButton>
      </Box>
    ),
  },
  ]
}
