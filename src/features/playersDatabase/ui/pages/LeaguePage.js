// features/playersDatabase/ui/pages/LeaguePage.js

import * as React from 'react'
import {
  Box,
  Button,
  Card,
  Divider,
  IconButton,
  Option,
  Select,
  Stack,
  Tooltip,
  Typography,
} from '@mui/joy'
import { useNavigate } from 'react-router-dom'

import { formatLtrNumber } from '../../../../shared/format/direction.js'
import { useSnackbar } from '../../../../ui/core/feedback/snackbar/SnackbarProvider.js'
import { mapFirestoreErrorToDetails } from '../../../../ui/core/feedback/snackbar/snackbar.format.js'
import { SNACK_STATUS } from '../../../../ui/core/feedback/snackbar/snackbar.model.js'
import { PLAYERS_DATABASE_CLUBS_CATALOG } from '../../catalog/clubs.catalog.js'
import { buildTeamIdentity } from '../../catalog/teamIdentity.js'
import { resolveClubCatalogMatch } from '../../catalog/catalogResolvers.js'
import PlayersDatabaseLayout from '../layout/PlayersDatabaseLayout.js'
import Breadcrumbs from '../layout/Breadcrumbs.js'
import StatCard from '../components/cards/StatCard.js'
import InfoPanel from '../components/cards/InfoPanel.js'
import DataTable from '../components/tables/DataTable.js'
import { DataImportModal } from '../components/modals/index.js'
import ScoutBadge from '../components/scout/ScoutBadge.js'
import ScoutPrioritySelect from '../components/filters/ScoutPrioritySelect.js'
import StatusPill from '../components/status/StatusPill.js'
import ActivityStatusChip from '../components/status/ActivityStatusChip.js'
import TeamName from '../components/teams/TeamName.js'
import { iconUi } from '../../../../ui/core/icons/iconUi.js'
import { buildFallbackAvatar } from '../../../../ui/core/avatars/fallbackAvatar.js'
import { useLeaguePage } from '../hooks/useLeaguePage.js'
import {
  PLAYERS_DATABASE_WRITE_ACTIONS,
  runPlayersDatabaseWriteAction,
} from '../../services/write/index.js'
import {
  buildPlayersDatabaseBreadcrumbs,
  PLAYERS_DATABASE_UI_ROUTES,
} from '../logic/routeBuilders.js'
import { leagueSx as sx } from './sx/league.sx.js'

const compactColumnSx = {
  width: 66,
  minWidth: 66,
}

const REGION_LABELS = [
  'דרום',
  'צפון',
  'מרכז',
  'שרון',
  'שפלה',
  'נגב',
  'גליל',
  'חיפה',
  'ירושלים',
]

const REGION_LABEL_BY_KEY = {
  south: 'דרום',
  north: 'צפון',
  center: 'מרכז',
  central: 'מרכז',
  sharon: 'שרון',
  shefela: 'שפלה',
  negev: 'נגב',
  galil: 'גליל',
  haifa: 'חיפה',
  jerusalem: 'ירושלים',
}

const numberInputSx = {
  minWidth: 48,
}

const ltrNumberInputSx = {
  minWidth: 48,

  '& input': {
    direction: 'ltr',
    textAlign: 'left',
    fontSize: 12,
    fontWeight: 400,
  },
}

const clubOptions = PLAYERS_DATABASE_CLUBS_CATALOG.map(club => ({
  value: club.id,
  label: club.name,
}))

const teamSlotOptions = [
  { value: '1', label: '1' },
  { value: '2', label: '2' },
  { value: '3', label: '3' },
]

const baseImportColumns = [
  {
    key: 'rank',
    required: true,
    label: 'מיקום',
    readOnly: true,
    sx: compactColumnSx,
    inputSx: numberInputSx,
  },
  {
    key: 'clubId',
    required: true,
    label: 'מועדון',
    type: 'select',
    options: clubOptions,
    sx: {
      width: 190,
      minWidth: 190,
    },
    inputSx: {
      minWidth: 170,
    },
  },
  {
    key: 'teamSlot',
    required: true,
    label: 'קבוצה',
    type: 'select',
    options: teamSlotOptions,
    sx: {
      width: 64,
      minWidth: 64,
    },
    inputSx: {
      minWidth: 48,
    },
  },
  {
    key: 'games',
    required: true,
    label: 'משחקים',
    sx: compactColumnSx,
    inputSx: numberInputSx,
  },
  {
    key: 'wins',
    label: 'ניצחונות',
    sx: compactColumnSx,
    inputSx: numberInputSx,
  },
  {
    key: 'draws',
    label: 'תיקו',
    sx: compactColumnSx,
    inputSx: numberInputSx,
  },
  {
    key: 'losses',
    label: 'הפסדים',
    sx: compactColumnSx,
    inputSx: numberInputSx,
  },
  {
    key: 'goalsFor',
    required: true,
    label: 'זכות',
    sx: compactColumnSx,
    inputSx: numberInputSx,
  },
  {
    key: 'goalsAgainst',
    required: true,
    label: 'חובה',
    sx: compactColumnSx,
    inputSx: numberInputSx,
  },
  {
    key: 'goalDifference',
    label: 'הפרש',
    sx: compactColumnSx,
    inputSx: ltrNumberInputSx,
  },
  {
    key: 'points',
    required: true,
    label: 'נקודות',
    sx: compactColumnSx,
    inputSx: numberInputSx,
  },
]

const displayNameColumn = {
  key: 'teamName',
  label: 'שם בתצוגה',
  sx: {
    width: 180,
    minWidth: 180,
  },
  inputSx: {
    minWidth: 150,
  },
}

const LEAGUE_IMPORT_PLACEHOLDER = [
  'מיקום',
  'קבוצה',
  'משחקים',
  'ניצחונות',
  'תיקו',
  'הפסדים',
  'שערי זכות',
  'שערי חובה',
  'הפרש שערים',
  'נקודות',
].join('\t')

const clean = value => String(value ?? '').trim()

const escapeRegExp = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const resolveRegionLabel = value => {
  const region = clean(value)
  if (!region) return ''

  return REGION_LABEL_BY_KEY[region] || region
}

const splitLeagueTitle = league => {
  const name = clean(league?.name)
  const explicitRegion = resolveRegionLabel(league?.region)
  const matchedRegion = explicitRegion || REGION_LABELS.find(region => name.endsWith(region))
  const baseName = matchedRegion
    ? clean(name.replace(new RegExp(`\\s*-?\\s*${escapeRegExp(matchedRegion)}\\s*$`), ''))
    : name

  return {
    name: baseName || name || '-',
    region: matchedRegion,
  }
}

const toNumber = value => {
  const nextValue = Number(clean(value).replace(/\u200E/g, ''))
  return Number.isFinite(nextValue) ? nextValue : 0
}

const normalizeName = value => clean(value)
  .toLowerCase()
  .replace(/["׳״']/g, '')
  .replace(/\s+/g, ' ')

const looksLikeHeaderRow = cells =>
  cells.some(cell => ['מיקום', 'קבוצה', 'משחקים', 'נקודות'].includes(clean(cell)))

const getClubNameById = clubId =>
  PLAYERS_DATABASE_CLUBS_CATALOG.find(club => club.id === clubId)?.name || ''

const parseTeamSlot = teamName => {
  const match = clean(teamName).match(/(?:^|\s)([2-3])$/)
  return match?.[1] || '1'
}

const stripTrailingSlot = teamName =>
  clean(teamName).replace(/\s+[2-3]$/, '').trim()

const normalizeSignedNumberText = value => {
  const text = clean(value).replace(/\u200E/g, '')
  if (!text) return ''

  if (/^\d+(?:\.\d+)?-$/.test(text)) {
    return `-${text.slice(0, -1)}`
  }

  if (/^\d+(?:\.\d+)?\+$/.test(text)) {
    return text.slice(0, -1)
  }

  return text
}

const formatGoalDifference = value =>
  formatLtrNumber(normalizeSignedNumberText(value))

const getClubById = clubId =>
  PLAYERS_DATABASE_CLUBS_CATALOG.find(club => club.id === clean(clubId)) || null

const buildServiceLeague = ({ league = {}, leagueDoc = {} } = {}) => ({
  id: clean(leagueDoc.id || leagueDoc.leagueId || league.id),
  name: clean(leagueDoc.name || leagueDoc.leagueName || league.name),
  leagueName: clean(leagueDoc.leagueName || leagueDoc.name || league.name),
  ageGroupId: clean(leagueDoc.ageGroupId),
  ageGroupLabel: clean(leagueDoc.ageGroupLabel || league.ageGroup),
  level: toNumber(leagueDoc.level),
  region: clean(leagueDoc.region),
})

const buildServiceSeason = ({ league = {}, leagueDoc = {}, selectedSeasonOption = {} } = {}) => {
  const season = selectedSeasonOption?.season || {}

  return {
    ...season,
    leagueId: clean(leagueDoc.id || leagueDoc.leagueId || league.id),
    seasonId: clean(season.seasonId || season.seasonKey || league.seasonKey),
    seasonKey: clean(season.seasonKey || league.seasonKey),
    birthYear: toNumber(season.birthYear || league.birthYear),
    leagueTotalRound: toNumber(season.leagueTotalRound || league.leagueTotalRound),
  }
}

const buildServiceRows = ({ rows = [], league = {}, season = {} } = {}) => (
  (Array.isArray(rows) ? rows : []).map(row => {
    const club = getClubById(row.clubId)
    const teamSlot = toNumber(row.teamSlot) || 1
    const identity = buildTeamIdentity({
      clubId: row.clubId,
      clubName: club?.name || row.clubName,
      ageGroupId: league.ageGroupId,
      ageGroupLabel: league.ageGroupLabel,
      birthYear: season.birthYear,
      teamSlot,
      leagueId: league.id,
      leagueName: league.name,
    })

    return {
      position: toNumber(row.rank),
      rank: toNumber(row.rank),
      clubId: clean(row.clubId),
      clubName: club?.name || row.clubName || row.teamName,
      clubLevel: toNumber(club?.clubLevel),
      displayName: clean(row.teamName),
      teamSlot,
      birthTeamId: identity.birthTeamId,
      birthTeamSlot: identity.birthTeamSlot,
      birthYear: identity.birthYear,
      teamSlotId: identity.teamSlotId,
      teamId: identity.teamId,
      ageGroupId: league.ageGroupId,
      ageGroupLabel: league.ageGroupLabel,
      games: toNumber(row.games),
      wins: toNumber(row.wins),
      draws: toNumber(row.draws),
      losses: toNumber(row.losses),
      goalsFor: toNumber(row.goalsFor),
      goalsAgainst: toNumber(row.goalsAgainst),
      goalDifference: toNumber(normalizeSignedNumberText(row.goalDifference)),
      points: toNumber(row.points),
    }
  }).filter(row => row.rank || row.clubId || row.teamId)
)

const getExpectedTeamDisplayName = row => {
  const clubName = row.clubName || getClubNameById(row.clubId)
  const slot = clean(row.teamSlot || '1')

  if (!clubName) return ''
  if (slot === '1') return clubName

  return `${clubName} ${slot}`
}

const shouldShowDisplayName = row => {
  const sourceName = stripTrailingSlot(row.teamName)
  const expectedName = stripTrailingSlot(getExpectedTeamDisplayName(row))

  if (!sourceName) return false
  if (!expectedName) return true

  return normalizeName(sourceName) !== normalizeName(expectedName)
}

const buildLeagueImportColumns = rows => {
  if (!rows.some(shouldShowDisplayName)) return baseImportColumns

  return [
    ...baseImportColumns.slice(0, 3),
    displayNameColumn,
    ...baseImportColumns.slice(3),
  ]
}

const parseLeagueTablePasteRows = text => {
  const lines = clean(text).split(/\r?\n/).map(line => line.trim()).filter(Boolean)
  const dataLines = lines.length && looksLikeHeaderRow(lines[0].split('\t'))
    ? lines.slice(1)
    : lines

  return dataLines.map((line, index) => {
    const cells = line.split('\t').map(clean)
    const sourceTeamName = cells[1] || ''
    const clubMatch = resolveClubCatalogMatch(sourceTeamName)
    const teamSlot = parseTeamSlot(sourceTeamName) || '1'

    return {
      id: `league_table_${index + 1}`,
      rank: cells[0] || '',
      clubId: clubMatch?.id || '',
      clubName: clubMatch?.name || '',
      teamSlot,
      teamName: sourceTeamName,
      games: cells[2] || '',
      wins: cells[3] || '',
      draws: cells[4] || '',
      losses: cells[5] || '',
      goalsFor: cells[6] || '',
      goalsAgainst: cells[7] || '',
      goalDifference: formatGoalDifference(cells[8]),
      points: cells[9] || '',
    }
  })
}

function TitleChip({ children, tone = 'primary' }) {
  return (
    <Box sx={{
      ...sx.titleChip,
      ...(tone === 'tertiary' ? sx.titleChipTertiary : {}),
    }}>
      {children}
    </Box>
  )
}

function LeagueKpiDetail({ label, value }) {
  return (
    <Box sx={sx.leagueStateDetail}>
      <Typography sx={sx.leagueStateDetailValue}>
        {value || '-'}
      </Typography>

      <Typography sx={sx.leagueStateDetailLabel}>
        {label}
      </Typography>
    </Box>
  )
}

function LeagueSummaryStatCard({
  teamsCount,
  roundsCount,
  goalsCount,
  profilesCount,
}) {
  return (
    <Card sx={sx.summaryStatCard}>
      <Box sx={sx.leagueStateMain}>
        <Box sx={sx.leagueStateText}>
          <Typography sx={sx.leagueStateTitle}>
            מצב ליגה
          </Typography>

          <Typography sx={sx.leagueStateValue}>
            {teamsCount || '-'}
          </Typography>
        </Box>

        <Box sx={sx.leagueStateIcon}>
          {iconUi({ id: 'league', size: 'sm' })}
        </Box>
      </Box>

      <Box sx={sx.leagueStateDetails}>
        <LeagueKpiDetail
          label='קבוצות'
          value={teamsCount}
        />

        <LeagueKpiDetail
          label='מחזורים'
          value={roundsCount}
        />

        <LeagueKpiDetail
          label='שערים'
          value={goalsCount}
        />

        <LeagueKpiDetail
          label='פרופילים'
          value={profilesCount}
        />
      </Box>
    </Card>
  )
}

function LeagueActionsPanel({
  selectedSeasonKey,
  seasonOptions,
  selectedBirthYear,
  birthYearOptions,
  onSeasonChange,
  onBirthYearChange,
  attackPriorityFilter,
  defensePriorityFilter,
  onAttackPriorityFilterChange,
  onDefensePriorityFilterChange,
  onLoad,
}) {
  return (
    <InfoPanel
      title='פעולות אפשריות'
      sx={sx.insightsPanel}
    >
      <Stack
        spacing={1}
        className='dpScrollThin'
        sx={sx.insightsList}
      >
        <Box sx={sx.actionSeasonBox}>
          <Typography
            level='body-xs'
            sx={sx.actionSeasonLabel}
          >
            עונת משחקים
          </Typography>

          <Select
            value={selectedSeasonKey || ''}
            size='sm'
            sx={sx.actionSeasonSelect}
            onChange={(event, nextValue) => onSeasonChange(nextValue || '')}
          >
            {seasonOptions.length ? (
              seasonOptions.map(option => (
                <Option
                  key={`${option.target}_${option.seasonKey}`}
                  value={option.seasonKey}
                >
                  {option.seasonKey}
                </Option>
              ))
            ) : (
              <Option value=''>אין עונות</Option>
            )}
          </Select>
        </Box>

        <Box sx={sx.actionSeasonBox}>
          <Typography
            level='body-xs'
            sx={sx.actionSeasonLabel}
          >
            שנתון
          </Typography>

          <Select
            value={selectedBirthYear ? String(selectedBirthYear) : ''}
            size='sm'
            sx={sx.actionSeasonSelect}
            onChange={(event, nextValue) => onBirthYearChange(nextValue || '')}
          >
            {birthYearOptions.length ? (
              birthYearOptions.map(year => (
                <Option
                  key={year}
                  value={String(year)}
                >
                  {year}
                </Option>
              ))
            ) : (
              <Option value=''>אין שנתונים</Option>
            )}
          </Select>
        </Box>

        <Box sx={sx.priorityFiltersRow}>
          <ScoutPrioritySelect
            label='ביצוע התקפי'
            value={attackPriorityFilter}
            fontSize={11}
            onChange={onAttackPriorityFilterChange}
          />

          <ScoutPrioritySelect
            label='ביצוע הגנתי'
            value={defensePriorityFilter}
            fontSize={11}
            onChange={onDefensePriorityFilterChange}
          />
        </Box>

        <Divider sx={sx.sidePanelDivider} />

        <Button
          startDecorator={iconUi({ id: 'upload', size: 'sm' })}
          sx={sx.sideLoadButton}
          onClick={onLoad}
        >
          טעינת נתוני ליגה
        </Button>

        <Button
          variant='outlined'
          startDecorator={iconUi({ id: 'delete', size: 'sm' })}
          sx={sx.sideDeleteButton}
        >
          מחיקת קבוצות לעונה
        </Button>
      </Stack>
    </InfoPanel>
  )
}

export default function LeaguePage() {
  const navigate = useNavigate()
  const { notify } = useSnackbar()
  const [importOpen, setImportOpen] = React.useState(false)
  const [importPasteValue, setImportPasteValue] = React.useState('')
  const [importRows, setImportRows] = React.useState([])
  const [importBusy, setImportBusy] = React.useState(false)
  const [attackPriorityFilter, setAttackPriorityFilter] = React.useState('')
  const [defensePriorityFilter, setDefensePriorityFilter] = React.useState('')
  const {
    league,
    leagueDoc,
    teams,
    summary,
    seasonOptions,
    birthYearOptions,
    selectedSeasonKey,
    selectedSeasonOption,
    setSelectedSeasonKey,
    setSelectedBirthYear,
    reload,
    loading,
    error,
  } = useLeaguePage()

  const importColumns = React.useMemo(() => (
    buildLeagueImportColumns(importRows)
  ), [importRows])

  const handleCloseImport = () => {
    setImportOpen(false)
  }

  const handleOpenImport = () => {
    setImportOpen(true)
  }

  const handlePreviewImport = () => {
    setImportRows(parseLeagueTablePasteRows(importPasteValue))
  }

  const handleImportCellChange = ({ rowIndex, column, value }) => {
    setImportRows(currentRows => currentRows.map((row, index) => {
      if (index !== rowIndex) return row

      const nextRow = {
        ...row,
        [column.key]: value,
      }

      if (column.key === 'clubId') {
        const club = PLAYERS_DATABASE_CLUBS_CATALOG.find(item => item.id === value)
        nextRow.clubName = club?.name || ''
      }

      if (column.key === 'teamSlot') {
        nextRow.teamSlot = value || '1'
      }

      if (column.key === 'goalDifference') {
        nextRow.goalDifference = formatGoalDifference(value)
      }

      return nextRow
    }))
  }

  const handleConfirmImport = async () => {
    const serviceLeague = buildServiceLeague({
      league,
      leagueDoc,
    })
    const serviceSeason = buildServiceSeason({
      league,
      leagueDoc,
      selectedSeasonOption,
    })
    const rows = buildServiceRows({
      rows: importRows,
      league: serviceLeague,
      season: serviceSeason,
    })

    setImportBusy(true)

    try {
      const result = await runPlayersDatabaseWriteAction({
        actionType: PLAYERS_DATABASE_WRITE_ACTIONS.PASTE_LEAGUE_TABLE,
        payload: {
          league: serviceLeague,
          season: serviceSeason,
          target: selectedSeasonOption?.target || 'current',
          rows,
        },
      })

      notify({
        status: SNACK_STATUS.SUCCESS,
        title: 'טבלת הליגה נשמרה',
        message: String(result.rowsCount || rows.length) + ' שורות עודכנו',
      })

      setImportOpen(false)
      setImportPasteValue('')
      setImportRows([])
      reload()
    } catch (error) {
      notify({
        status: SNACK_STATUS.ERROR,
        title: 'טעינת טבלת הליגה נכשלה',
        message: serviceLeague.name || 'ליגה',
        details: mapFirestoreErrorToDetails(error),
      })
    } finally {
      setImportBusy(false)
    }
  }

  const filteredTeams = React.useMemo(() => (
    teams.filter(team => (
      (!attackPriorityFilter || team.attackPriority === attackPriorityFilter)
      && (!defensePriorityFilter || team.defensePriority === defensePriorityFilter)
    ))
  ), [teams, attackPriorityFilter, defensePriorityFilter])

  const breadcrumbs = buildPlayersDatabaseBreadcrumbs([
    {
      label: 'מרכז ליגות',
      to: PLAYERS_DATABASE_UI_ROUTES.leagues,
    },
    {
      label: league.name,
    },
  ])

  const columns = [
    {
      key: 'tableRank',
      label: 'מיקום',
      sx: sx.rankColumn,
      render: row => (
        <Box sx={sx.rankBadge}>
          {row.tableRank || '-'}
        </Box>
      ),
    },
    {
      key: 'teamAvatar',
      label: '',
      sx: sx.avatarColumn,
      render: row => (
        <Box
          component='img'
          src={buildFallbackAvatar({
            entityType: 'team',
            id: row.id,
            name: row.name,
            subline: row.teamSlot && row.teamSlot !== '1' ? row.teamSlot : '',
          })}
          alt=''
          sx={sx.teamAvatar}
        />
      ),
    },
    {
      key: 'name',
      label: 'קבוצה',
      sx: sx.teamNameColumn,
      headerSx: sx.teamNameHeader,
      cellSx: sx.teamNameCell,
      render: row => (
        <TeamName
          value={row.name}
          slot={row.teamSlot}
          fontSize={13}
        />
      ),
    },
    {
      key: 'games',
      label: 'משחקים',
      sx: sx.compactTableColumn,
    },
    {
      key: 'goalsFor',
      label: 'שערים שכבשו',
      sx: sx.compactTableColumn,
    },
    {
      key: 'goalsAgainst',
      label: 'שערים שספגו',
      sx: sx.compactTableColumn,
    },
    {
      key: 'points',
      label: 'נקודות',
      sx: sx.compactTableColumn,
    },
    {
      key: 'attackPriority',
      label: 'ביצוע התקפי',
      sx: sx.priorityColumn,
      render: row => (
        <ScoutBadge
          value={row.attackPriority}
          short
          fontSize={11}
        />
      ),
    },
    {
      key: 'defensePriority',
      label: 'ביצוע הגנתי',
      sx: sx.priorityColumn,
      render: row => (
        <ScoutBadge
          value={row.defensePriority}
          short
          fontSize={11}
        />
      ),
    },
    {
      key: 'rosterProfiles',
      label: 'סגל / פרופילים',
      sx: sx.rosterProfilesColumn,
      render: row => (
        <Box sx={sx.rosterProfilesCell}>
          <Box component='span' sx={sx.rosterProfilesValue}>
            {row.playersCount || 0}
          </Box>
          <Box component='span' sx={sx.rosterProfilesDivider}>
            /
          </Box>
          <Box component='span' sx={sx.rosterProfilesValue}>
            {row.profilesCount || 0}
          </Box>
        </Box>
      ),
    },
    {
      key: 'actions',
      label: '',
      sx: sx.actionColumn,
      render: row => (
        <Box sx={sx.rowActions}>
          <Tooltip title='כניסה לקבוצה'>
            <IconButton
              size='sm'
              variant='outlined'
              aria-label='כניסה לקבוצה'
              sx={sx.tableButton}
              onClick={() => {
                navigate(
              PLAYERS_DATABASE_UI_ROUTES.team({
                leagueId: league.id,
                teamId: row.id,
                seasonKey: selectedSeasonKey,
              })
            )
          }}
            >
              {iconUi({ id: 'view', size: 'sm' })}
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
              }}
            >
              {iconUi({ id: 'more', size: 'sm' })}
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ]

  const handleNavigateToSearch = () => {
    navigate(PLAYERS_DATABASE_UI_ROUTES.search)
  }

  const handleNavigateToLeagues = () => {
    navigate(PLAYERS_DATABASE_UI_ROUTES.leagues)
  }

  const titleParts = splitLeagueTitle(league)
  const isActiveLeague = selectedSeasonOption?.target === 'current'

  return (
    <PlayersDatabaseLayout>
      <Box sx={sx.page}>
        <Box sx={sx.header}>
          <Stack sx={sx.headerCopy}>
            <Breadcrumbs items={breadcrumbs} />

            <Box sx={sx.titleRow}>
              <Typography level='h1' sx={sx.pageTitle}>
                {titleParts.name}
                {titleParts.region ? (
                  <Box
                    component='span'
                    sx={sx.titleRegion}
                  >
                    {' - '}
                  {titleParts.region}
                </Box>
              ) : null}
              </Typography>

              <Box sx={sx.titleChips}>
                <TitleChip tone='tertiary'>
                  {league.ageGroup}
                </TitleChip>

                <TitleChip>
                  {league.levelLabel}
                </TitleChip>
              </Box>
            </Box>
          </Stack>

          <Stack sx={sx.actionsPanel}>
            <ActivityStatusChip active={isActiveLeague} />

            <Stack
              direction='row'
              spacing={1}
              sx={sx.actions}
            >
              <Button
                sx={sx.primaryButton}
                startDecorator={iconUi({
                  id: 'playerDatabase',
                  size: 'sm',
                })}
                onClick={handleNavigateToSearch}
              >
                מעבר לעמוד חיפוש
              </Button>

              <Button
                variant='outlined'
                sx={sx.secondaryButton}
                startDecorator={iconUi({
                  id: 'back',
                  size: 'sm',
                })}
                onClick={handleNavigateToLeagues}
              >
                חזרה למרכז ליגות
              </Button>
            </Stack>
          </Stack>
        </Box>

        <Box sx={sx.statsGrid}>
          <LeagueSummaryStatCard
            teamsCount={summary.teamsCount}
            roundsCount={league.leagueTotalRound}
            goalsCount={summary.goalsCount}
            profilesCount={summary.profilesCount}
          />

          <StatCard
            title='חוזקות התקפיות'
            value={summary.attackPositive}
            caption='קבוצות חיוביות ומעלה'
            iconId='stats'
          />

          <StatCard
            title='חוזקות הגנתיות'
            value={summary.defensePositive}
            caption='קבוצות חיוביות ומעלה'
            iconId='defensive'
          />

          <StatCard
            title='מומלצות לטעינת שחקנים'
            value={summary.recommendedTeams}
            caption='עדיפות גבוהה או יעד מוביל'
            iconId='targets'
            tone='solid'
          />
        </Box>

        <Box sx={sx.contentGrid}>
          <DataTable
            className='dpScrollThin'
            columns={columns}
            rows={filteredTeams}
            getRowKey={row => row.id}
            emptyText={loading ? 'טוען נתוני ליגה...' : error || 'אין נתוני טבלה לעונה שנבחרה'}
            tableSx={sx.leagueTable}
          />

          <LeagueActionsPanel
            selectedSeasonKey={selectedSeasonKey}
            seasonOptions={seasonOptions}
            selectedBirthYear={league.birthYear}
            birthYearOptions={birthYearOptions}
            onSeasonChange={setSelectedSeasonKey}
            onBirthYearChange={setSelectedBirthYear}
            attackPriorityFilter={attackPriorityFilter}
            defensePriorityFilter={defensePriorityFilter}
            onAttackPriorityFilterChange={setAttackPriorityFilter}
            onDefensePriorityFilterChange={setDefensePriorityFilter}
            onLoad={handleOpenImport}
          />
        </Box>
      </Box>

      <DataImportModal
        open={importOpen}
        title='טעינת נתוני ליגה'
        description={`${league.name} - עונה ${league.seasonKey}`}
        confirmLabel='אישור טעינה'
        columns={importColumns}
        rows={importRows}
        pasteValue={importPasteValue}
        pastePlaceholder={LEAGUE_IMPORT_PLACEHOLDER}
        onPasteChange={setImportPasteValue}
        onPaste={handlePreviewImport}
        onCellChange={handleImportCellChange}
        busy={importBusy}
        onConfirm={handleConfirmImport}
        onClose={handleCloseImport}
      />
    </PlayersDatabaseLayout>
  )
}







