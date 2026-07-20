// features/playersDatabase/ui/pages/EntryPage.js

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
import InfoPanel from '../components/cards/InfoPanel.js'

import {
  buildPlayersDatabaseBreadcrumbs,
  PLAYERS_DATABASE_UI_ROUTES,
} from '../logic/routeBuilders.js'

import { entrySx as sx } from './sx/entry.sx.js'

const PREVIEW_BAR_HEIGHTS = [18, 30, 44, 28]

function DataPreviewGraphic() {
  return (
    <Box
      aria-hidden='true'
      sx={sx.previewGraphic}
    >
      <Box sx={sx.previewCircle} />

      <Box sx={sx.previewChartCard}>
        <Box sx={sx.previewChartBars}>
          {PREVIEW_BAR_HEIGHTS.map((height, index) => (
            <Box
              key={index}
              sx={{
                ...sx.previewChartBar,
                height,
              }}
            />
          ))}
        </Box>
      </Box>

      <Box sx={sx.previewLineCard}>
        <Box sx={sx.previewLine} />
      </Box>

      <Box sx={sx.previewPlayerCard}>
        <Box sx={sx.previewPlayerAvatar} />

        <Stack
          spacing={0.4}
          sx={sx.previewPlayerContent}
        >
          <Box sx={sx.previewPlayerTitle} />
          <Box sx={sx.previewPlayerText} />

          <Typography
            level='body-xs'
            sx={sx.previewPlayerScore}
          >
            87%
          </Typography>
        </Stack>
      </Box>
    </Box>
  )
}

function SearchVisual() {
  return (
    <Box
      aria-hidden='true'
      sx={sx.routeVisual}
    >
      <Box sx={sx.searchCircle} />
      <Box sx={sx.searchHandle} />
      <Box sx={sx.searchHead} />
      <Box sx={sx.searchBody} />
    </Box>
  )
}

function LeagueVisual() {
  return (
    <Box
      aria-hidden='true'
      sx={sx.leagueVisual}
    >
      <Box sx={sx.leagueLineTop} />
      <Box sx={sx.leagueLineLeft} />
      <Box sx={sx.leagueLineRight} />

      <Box sx={sx.leagueNodeTop} />
      <Box sx={sx.leagueNodeLeft} />
      <Box sx={sx.leagueNodeRight} />

      <Box sx={sx.leagueMainNode}>
        <Typography
          level='title-lg'
          sx={sx.leagueMainValue}
        >
          +190
        </Typography>

        <Typography
          level='body-xs'
          sx={sx.leagueMainLabel}
        >
          ליגות
        </Typography>
      </Box>
    </Box>
  )
}

function RouteCardVisual({ variant }) {
  if (variant === 'search') {
    return <SearchVisual />
  }

  return <LeagueVisual />
}

function ActionHeroCard({
  title,
  text,
  buttonLabel,
  onClick,
  variant,
}) {
  return (
    <Card sx={sx.actionCard}>
      <RouteCardVisual variant={variant} />

      <Stack
        spacing={0.75}
        sx={sx.actionContent}
      >
        <Typography
          level='h2'
          sx={sx.actionTitle}
        >
          {title}
        </Typography>

        <Typography
          level='body-md'
          sx={sx.actionText}
        >
          {text}
        </Typography>
      </Stack>

      <Button
        color='neutral'
        variant='solid'
        onClick={onClick}
        sx={sx.actionButton}
      >
        {buttonLabel}
      </Button>
    </Card>
  )
}

export default function EntryPage() {
  const navigate = useNavigate()

  const breadcrumbs = buildPlayersDatabaseBreadcrumbs([
    {
      label: 'מאגר שחקנים חיצוני',
    },
  ])

  const handleNavigateToLeagues = () => {
    navigate(PLAYERS_DATABASE_UI_ROUTES.leagues)
  }

  const handleNavigateToSearch = () => {
    navigate(PLAYERS_DATABASE_UI_ROUTES.search)
  }

  return (
    <PlayersDatabaseLayout>
      <Box sx={sx.page}>
        <Box sx={sx.header}>
          <Box sx={sx.headerVisual}>
            <DataPreviewGraphic />
          </Box>

          <Stack
            spacing={1.25}
            sx={sx.headerContent}
          >
            <Breadcrumbs items={breadcrumbs} />

            <Typography
              level='h1'
              sx={sx.pageTitle}
            >
              מאגר שחקנים חיצוני
            </Typography>

            <Typography
              level='body-lg'
              sx={sx.pageDescription}
            >
              כל המידע במקום אחד: ליגות, קבוצות, סגלים,
              סטטיסטיקות ואיתור מועמדים שמתאימים לפרופיל
              הסקאוט שלכם.
            </Typography>
          </Stack>
        </Box>

        <Box sx={sx.actionsGrid}>
          <ActionHeroCard
            title='פריסת ליגות'
            text='ניתוח ליגות, ביצועי קבוצות וטעינת שחקנים.'
            buttonLabel='הצג ליגות'
            variant='leagues'
            onClick={handleNavigateToLeagues}
          />

          <ActionHeroCard
            title='חיפוש מועמדים'
            text='חיפוש, הצלבות ופרופילי סקאוט לפי נתונים שהוטענו.'
            buttonLabel='התחל חיפוש'
            variant='search'
            onClick={handleNavigateToSearch}
          />
        </Box>

        <Box sx={sx.infoGrid}>
          <InfoPanel title='סקירת דאטה עולמית'>
            <Box sx={sx.statsGrid}>
              <StatCard
                title='שחקנים'
                value='1.2M+'
                caption='מאגר עולמי'
                iconId='players'
              />

              <StatCard
                title='קבוצות'
                value='450K+'
                caption='סגלים וקבוצות'
                iconId='teams'
              />

              <StatCard
                title='ליגות'
                value='190+'
                caption='מסגרות פעילות'
                iconId='playersDatabase'
              />

              <StatCard
                title='משחקים'
                value='15M+'
                caption='נתוני סטטיסטיקה'
                iconId='stats'
              />
            </Box>
          </InfoPanel>

          <InfoPanel title='מה אפשר לעשות כאן?'>
            <Stack
              spacing={1.1}
              className='dpScrollThin'
              sx={sx.capabilities}
            >
              <Typography level='body-md'>
                לזהות קבוצות חריגות לפי ביצועים מול מיקום בטבלה.
              </Typography>

              <Typography level='body-md'>
                לטעון סגלים וסטטיסטיקות בלי לפתוח מסמכי שחקן לכל אחד.
              </Typography>

              <Typography level='body-md'>
                לאתר מועמדים לפי פרופילי סקאוט ושכבת אינדקס שטוחה.
              </Typography>
            </Stack>
          </InfoPanel>
        </Box>
      </Box>
    </PlayersDatabaseLayout>
  )
}
