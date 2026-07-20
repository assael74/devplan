// features/playersDatabase/ui/pages/LeaguesCenterPage.js

import * as React from 'react'
import {
  Box,
  Button,
  Card,
  IconButton,
  Input,
  Option,
  Select,
  Stack,
  Tooltip,
  Typography,
} from '@mui/joy'
import { useNavigate } from 'react-router-dom'

import PlayersDatabaseLayout from '../layout/PlayersDatabaseLayout.js'
import Breadcrumbs from '../layout/Breadcrumbs.js'
import StatCard from '../components/cards/StatCard.js'
import DataTable from '../components/tables/DataTable.js'
import StatusPill from '../components/status/StatusPill.js'
import { CreateSeasonModal } from '../components/modals/index.js'
import { iconUi } from '../../../../ui/core/icons/iconUi.js'
import { useSnackbar } from '../../../../ui/core/feedback/snackbar/SnackbarProvider.js'
import { mapFirestoreErrorToDetails } from '../../../../ui/core/feedback/snackbar/snackbar.format.js'
import { SNACK_STATUS } from '../../../../ui/core/feedback/snackbar/snackbar.model.js'
import {
  ensureLeagueDoc,
  upsertLeagueSeason,
} from '../../services/write/index.js'
import { useLeagueCenter } from '../hooks/useLeagueCenter.js'
import {
  buildPlayersDatabaseBreadcrumbs,
  PLAYERS_DATABASE_UI_ROUTES,
} from '../logic/routeBuilders.js'
import { centerSx as sx } from './sx/center.sx.js'

const HERO_BAR_HEIGHTS = [20, 34, 48, 28]

const clean = value => String(value ?? '').trim()

const buildMissingItems = summary => [
  {
    id: 'unopened',
    label: 'ליגות מהקטלוג שעדיין לא נפתחו',
    value: summary.unopenedCatalogLeagues,
  },
  {
    id: 'tables',
    label: 'ליגות בלי טבלה מלאה',
    value: summary.totalLeagues - summary.fullTables,
  },
  {
    id: 'teams',
    label: 'ליגות עם טעינת שחקנים חלקית',
    value: summary.partialTeams,
  },
  {
    id: 'profiles',
    label: 'שחקנים עם פרופיל סקאוט',
    value: summary.profiledPlayers,
  },
]

const buildServiceLeague = row => ({
  ...(row?.catalog || {}),
  ...(row?.sourceLeague || {}),
  id: clean(row?.leagueId || row?.id),
  name: clean(row?.leagueName || row?.catalog?.name || row?.sourceLeague?.name),
  ageGroupId: clean(row?.ageGroupId || row?.catalog?.ageGroupId),
  ageGroupLabel: clean(row?.ageGroupLabel || row?.catalog?.ageGroupLabel),
  region: clean(row?.catalog?.region || row?.sourceLeague?.region),
  level: row?.catalog?.level ?? row?.sourceLeague?.level ?? null,
})

function CenterHeroGraphic() {
  return (
    <Box sx={sx.heroGraphic}>
      <Box sx={sx.heroGlobe} />

      <Box sx={{ ...sx.floatCard, ...sx.floatChartCard }}>
        <Box sx={sx.barChart}>
          {HERO_BAR_HEIGHTS.map((height, index) => (
            <Box
              key={index}
              sx={{
                ...sx.barItem,
                height,
              }}
            />
          ))}
        </Box>
      </Box>

      <Box sx={{ ...sx.floatCard, ...sx.floatTrendCard }}>
        <Box sx={sx.trendLine} />
      </Box>

      <Box sx={{ ...sx.floatCard, ...sx.floatProfileCard }}>
        <Box sx={sx.profileAvatar} />

        <Stack
          spacing={0.75}
          sx={sx.profileContent}
        >
          <Box sx={sx.profileLine} />
          <Box sx={sx.profileLine} />

          <Typography
            level='body-xs'
            sx={sx.profileNumbers}
          >
            17&nbsp;&nbsp;2,184&nbsp;&nbsp;87%
          </Typography>
        </Stack>
      </Box>
    </Box>
  )
}

function MissingPanel({ items }) {
  return (
    <Card sx={sx.missingPanel}>
      <Stack sx={sx.missingContent}>
        <Typography
          level='title-lg'
          sx={sx.panelTitle}
        >
          מה חסר לי?
        </Typography>

        <Stack
          className='dpScrollThin'
          spacing={0.75}
          sx={sx.missingList}
        >
          {items.map(item => (
            <Box
              key={item.id}
              sx={sx.missingItem}
            >
              <Box sx={sx.missingDot} />

              <Typography sx={sx.missingTitle}>
                {item.label}
              </Typography>

              <Typography sx={sx.missingValue}>
                {item.value}
              </Typography>
            </Box>
          ))}
        </Stack>
      </Stack>
    </Card>
  )
}

export default function LeaguesCenterPage() {
  const navigate = useNavigate()
  const { notify } = useSnackbar()
  const model = useLeagueCenter()
  const [seasonModalLeague, setSeasonModalLeague] = React.useState(null)
  const [seasonCreateBusy, setSeasonCreateBusy] = React.useState(false)

  const breadcrumbs = buildPlayersDatabaseBreadcrumbs([
    { label: 'מרכז ליגות' },
  ])

  const columns = [
    {
      key: 'name',
      label: 'ליגה',
    },
    {
      key: 'ageGroup',
      label: 'גיל',
    },
    {
      key: 'seasonKey',
      label: 'עונה',
    },
    {
      key: 'teamsCount',
      label: 'קבוצות',
    },
    {
      key: 'tableStatus',
      label: 'טבלה',
      render: row => <StatusPill value={row.tableStatus} />,
    },
    {
      key: 'teamsStatus',
      label: 'שחקנים',
      render: row => <StatusPill value={row.teamsStatus} />,
    },
    {
      key: 'statsStatus',
      label: 'סטטיסטיקות',
      render: row => <StatusPill value={row.statsStatus} />,
    },
    {
      key: 'playersWithProfiles',
      label: 'שחקנים בפרופיל',
    },
    {
      key: 'actions',
      label: '',
    },
  ]

  const handleNavigateToSearch = () => {
    navigate(PLAYERS_DATABASE_UI_ROUTES.search)
  }

  const handleNavigateToEntry = () => {
    navigate(PLAYERS_DATABASE_UI_ROUTES.entry)
  }

  const handleCreateSeason = async payload => {
    const row = payload?.league || seasonModalLeague
    const league = buildServiceLeague(row)
    const season = payload?.season || {}

    setSeasonCreateBusy(true)

    try {
      await ensureLeagueDoc(league)

      const result = await upsertLeagueSeason({
        league,
        season: {
          ...season,
          leagueId: league.id,
        },
        target: season.target,
      })

      notify({
        status: SNACK_STATUS.SUCCESS,
        title: 'העונה נוצרה',
        message: `${league.name || 'ליגה'} - ${result.seasonKey}`,
      })

      setSeasonModalLeague(null)
      navigate(PLAYERS_DATABASE_UI_ROUTES.league(league.id))
    } catch (error) {
      notify({
        status: SNACK_STATUS.ERROR,
        title: 'יצירת העונה נכשלה',
        message: league.name || 'ליגה',
        details: mapFirestoreErrorToDetails(error),
      })
    } finally {
      setSeasonCreateBusy(false)
    }
  }

  const displayColumns = columns.map(column => {
    if (column.key === 'actions') {
      return {
        ...column,
        sx: sx.actionsColumn,
        headerSx: sx.centerColumn,
        cellSx: sx.centerColumn,
        render: row => {
          const showCreateSeason = !row.hasSelectedSeason

          return (
            <Stack
              direction='row'
              spacing={0.5}
              sx={sx.rowActions}
            >
              {showCreateSeason ? (
                <Tooltip title='יצירת עונה'>
                  <IconButton
                    size='sm'
                    variant='outlined'
                    sx={sx.actionIconButton}
                    onClick={() => setSeasonModalLeague(row)}
                  >
                    {iconUi({ id: 'addSeason', size: 'sm' })}
                  </IconButton>
                </Tooltip>
              ) : (
                <Box sx={sx.actionIconPlaceholder} />
              )}

              <Tooltip title='כניסה לליגה'>
                <IconButton
                  disabled={!row.hasLeagueDoc}
                  size='sm'
                  variant='outlined'
                  sx={sx.actionIconButton}
                  onClick={() => navigate(PLAYERS_DATABASE_UI_ROUTES.league(row.leagueId))}
                >
                  {iconUi({ id: 'viewLeague', size: 'sm' })}
                </IconButton>
              </Tooltip>
            </Stack>
          )
        },
      }
    }

    if (column.key === 'name') {
      return {
        ...column,
        sx: sx.leagueNameColumn,
        headerSx: sx.leagueNameHeader,
        cellSx: sx.leagueNameCell,
      }
    }

    if (column.key === 'ageGroup') {
      return {
        ...column,
        key: 'birthYear',
        label: 'שנתון',
        sx: sx.compactColumn,
        headerSx: sx.centerColumn,
        cellSx: sx.centerColumn,
      }
    }

    if (column.key === 'seasonKey') {
      return {
        ...column,
        sx: sx.seasonColumn,
        headerSx: sx.centerColumn,
        cellSx: sx.centerColumn,
      }
    }

    if (column.key === 'teamsCount' || column.key === 'playersWithProfiles') {
      return {
        ...column,
        sx: sx.countColumn,
        headerSx: sx.centerColumn,
        cellSx: sx.centerColumn,
      }
    }

    return {
      ...column,
      headerSx: sx.centerColumn,
      cellSx: sx.centerColumn,
    }
  })

  return (
    <PlayersDatabaseLayout>
      <Box sx={sx.page}>
        <Box sx={sx.header}>
          <Stack sx={sx.headerCopy}>
            <Breadcrumbs items={breadcrumbs} />

            <Typography
              level='h1'
              sx={sx.pageTitle}
            >
              מרכז ליגות
            </Typography>
          </Stack>

          <Stack
            direction='row'
            spacing={1}
            sx={sx.headerActions}
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
              onClick={handleNavigateToEntry}
            >
              חזרה לדף הפתיחה
            </Button>
          </Stack>
        </Box>

        <Box sx={sx.statsGrid}>
          <StatCard
            title='ליגות במערכת'
            value={model.summary.totalLeagues}
            caption='כל הליגות הפעילות'
            iconId='playersDatabase'
            tone='info'
          />

          <StatCard
            title='ליגות עם טבלה מלאה'
            value={model.summary.fullTables}
            caption='מוכנות לחישוב ביצועי קבוצות'
            iconId='defensive'
            tone='success'
          />

          <StatCard
            title='ליגות חלקיות'
            value={model.summary.partialTeams}
            caption='חסר סגל או סטטיסטיקות'
            iconId='warning'
            tone='warning'
          />

          <StatCard
            title='שחקנים מסומנים'
            value={model.summary.profiledPlayers}
            caption='עם פרופיל סקאוט'
            iconId='players'
            tone='neutral'
          />
        </Box>

        <Card sx={sx.filtersCard}>
          <Stack
            direction={{ xs: 'column', lg: 'row' }}
            spacing={1}
            sx={sx.filtersRow}
          >
            <Input
              placeholder='חיפוש ליגה...'
              value={model.query}
              sx={sx.searchInput}
              onChange={event => model.setQuery(event.target.value)}
            />

            <Select
              value={model.ageGroup}
              sx={sx.filterSelect}
              onChange={(event, value) => model.setAgeGroup(value || 'all')}
            >
              <Option value='all'>כל קבוצות הגיל</Option>
              {model.ageGroupOptions.map(option => (
                <Option
                  key={option.value}
                  value={option.value}
                >
                  {option.label}
                </Option>
              ))}
            </Select>

            <Select
              value={model.leagueFilter}
              sx={sx.filterSelect}
              onChange={(event, value) => model.setLeagueFilter(value || 'all')}
            >
              <Option value='all'>כל הליגות</Option>
              {model.leagueOptions.map(option => (
                <Option
                  key={option.value}
                  value={option.value}
                >
                  {option.label}
                </Option>
              ))}
            </Select>

            <Select
              value={model.birthYear}
              sx={sx.filterSelect}
              onChange={(event, value) => model.setBirthYear(value || 'all')}
            >
              <Option value='all'>כל השנתונים</Option>
              {model.birthYearOptions.map(year => (
                <Option
                  key={year}
                  value={year}
                >
                  {year}
                </Option>
              ))}
            </Select>

            <Select
              value={model.seasonKey}
              sx={sx.filterSelect}
              onChange={(event, value) => model.setSeasonKey(value || '26/27')}
            >
              {model.seasonOptions.map(seasonKey => (
                <Option
                  key={seasonKey}
                  value={seasonKey}
                >
                  {seasonKey}
                </Option>
              ))}
            </Select>
          </Stack>
        </Card>

        <Box sx={sx.contentGrid}>
          <DataTable
            columns={displayColumns}
            rows={model.leagues}
            getRowKey={row => `${row.id}_${row.seasonKey}`}
            emptyText={model.loading ? 'טוען ליגות...' : model.error || 'לא נמצאו מסמכי ליגות קיימים'}
            wrapSx={sx.tableScroll}
            bodyScrollSx={sx.tableBodyScroll}
          />

          <MissingPanel items={buildMissingItems(model.summary)} />
        </Box>
      </Box>

      <CreateSeasonModal
        open={Boolean(seasonModalLeague)}
        league={seasonModalLeague}
        defaultSeasonKey={model.seasonKey}
        lockSeason
        lockTarget
        busy={seasonCreateBusy}
        onClose={() => {
          if (seasonCreateBusy) return
          setSeasonModalLeague(null)
        }}
        onConfirm={handleCreateSeason}
      />
    </PlayersDatabaseLayout>
  )
}
