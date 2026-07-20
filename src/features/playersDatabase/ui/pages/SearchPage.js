// features/playersDatabase/ui/pages/SearchPage.js

import * as React from 'react'
import {
  Box,
  Button,
  Card,
  Stack,
  Typography,
} from '@mui/joy'
import { useNavigate } from 'react-router-dom'

import PlayersDatabaseLayout from '../layout/PlayersDatabaseLayout.js'
import Breadcrumbs from '../layout/Breadcrumbs.js'
import StatCard from '../components/cards/StatCard.js'
import FiltersBar from '../components/filters/FiltersBar.js'
import DataTable from '../components/tables/DataTable.js'

import { useSearchPage } from '../hooks/useSearchPage.js'
import {
  buildPlayersDatabaseBreadcrumbs,
  PLAYERS_DATABASE_UI_ROUTES,
} from '../logic/routeBuilders.js'

import { iconUi } from '../../../../ui/core/icons/iconUi.js'
import playerImage from '../../../../ui/core/images/playerImage.jpg'
import { searchSx as sx } from './sx/search.sx.js'

const ACTIVE_FILTERS = [
  {
    label: 'פרופיל ראשי',
    value: 'יוצר משחק',
  },
  {
    label: 'רמת ליגה',
    value: 'ליגה לאומית',
  },
  {
    label: 'ביצועי קבוצה',
    value: 'טובים מאוד ומעלה',
  },
  {
    label: 'אמינות',
    value: 'גבוהה ומעלה',
  },
]

function ActivityPanel() {
  return (
    <Card sx={sx.activityPanel}>
      <Typography
        level='title-lg'
        sx={sx.panelTitle}
      >
        הצלבת פעילות
      </Typography>

      <Stack
        spacing={1}
        className='dpScrollThin'
        sx={sx.activityList}
      >
        {ACTIVE_FILTERS.map(item => (
          <Box
            key={item.label}
            sx={sx.activityItem}
          >
            <Typography
              level='body-xs'
              sx={sx.activityLabel}
            >
              {item.label}
            </Typography>

            <Typography
              level='title-sm'
              sx={sx.activityValue}
            >
              {item.value}
            </Typography>
          </Box>
        ))}
      </Stack>
    </Card>
  )
}

export default function SearchPage() {
  const navigate = useNavigate()
  const model = useSearchPage()

  const breadcrumbs = buildPlayersDatabaseBreadcrumbs([
    {
      label: 'חיפוש מועמדים',
    },
  ])

  const columns = [
    {
      key: 'avatar',
      label: '',
      sx: sx.avatarColumn,
      render: row => (
        <Box
          component='img'
          src={row.avatarUrl || playerImage}
          alt=''
          sx={sx.playerAvatar}
        />
      ),
    },
    {
      key: 'playerName',
      label: 'שחקן',
      sx: sx.playerColumn,
    },
    {
      key: 'teamName',
      label: 'קבוצה',
      sx: sx.teamColumn,
    },
    {
      key: 'leagueName',
      label: 'ליגה',
      sx: sx.leagueColumn,
    },
    {
      key: 'primaryProfile',
      label: 'פרופיל ראשי',
      sx: sx.primaryProfileColumn,
    },
    {
      key: 'secondaryProfile',
      label: 'פרופיל משני',
      sx: sx.secondaryProfileColumn,
    },
    {
      key: 'reliability',
      label: 'אמינות',
      sx: sx.reliabilityColumn,
    },
    {
      key: 'score',
      label: 'ציון התאמה',
      sx: sx.scoreColumn,
    },
    {
      key: 'note',
      label: 'הערת הקשר',
      sx: sx.noteColumn,
    },
    {
      key: 'actions',
      label: 'פעולות',
      sx: sx.actionsColumn,
      render: row => (
        <Button
          size='sm'
          variant='outlined'
          sx={sx.tableButton}
          onClick={() => {
            navigate(
              PLAYERS_DATABASE_UI_ROUTES.player(row.id)
            )
          }}
        >
          כניסה לשחקן
        </Button>
      ),
    },
  ]

  const handleNavigateToLeagues = () => {
    navigate(PLAYERS_DATABASE_UI_ROUTES.leagues)
  }

  const handleNavigateToEntry = () => {
    navigate(PLAYERS_DATABASE_UI_ROUTES.entry)
  }

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
              חיפוש מועמדים
            </Typography>
          </Stack>

          <Stack
            direction='row'
            spacing={1}
            sx={sx.headerActions}
          >
            <Button
              sx={sx.primaryButton}
              onClick={handleNavigateToLeagues}
            >
              פריסת ליגות
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

        <Card sx={sx.filtersPanel}>
          <FiltersBar
            searchValue={model.query}
            onSearchChange={model.setQuery}
          />
        </Card>

        <Box sx={sx.statsGrid}>
          <StatCard
            title='תוצאות נמצאו'
            value={model.summary.total}
            caption='לפי נתוני הדמו הנוכחיים'
            iconId='players'
          />

          <StatCard
            title='אמינות גבוהה ומעלה'
            value={model.summary.highReliability}
            caption='שחקנים עם נתון יציב'
            iconId='defensive'
          />

          <StatCard
            title='סופר מעניינים'
            value={model.summary.interesting}
            caption='ציון 80 ומעלה'
            iconId='targets'
          />

          <StatCard
            title='שחקנים שמורים'
            value={model.summary.saved}
            caption='רשימות עבודה'
            iconId='liveTagging'
          />
        </Box>

        <Box sx={sx.contentGrid}>
          <Card sx={sx.resultsPanel}>
            <Box sx={sx.resultsHeader}>
              <Typography
                level='title-lg'
                sx={sx.panelTitle}
              >
                תוצאות חיפוש
              </Typography>

              <Typography
                level='body-xs'
                sx={sx.resultsCount}
              >
                {model.summary.total} תוצאות
              </Typography>
            </Box>

            <DataTable
              className='dpScrollThin'
              columns={columns}
              rows={model.results}
              getRowKey={row => row.id}
              wrapSx={sx.tableWrap}
              tableSx={sx.resultsTable}
            />
          </Card>

          <ActivityPanel />
        </Box>
      </Box>
    </PlayersDatabaseLayout>
  )
}
