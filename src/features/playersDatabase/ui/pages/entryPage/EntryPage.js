// features/playersDatabase/ui/pages/entryPage/EntryPage.js

import { Box, Stack, Typography } from '@mui/joy'
import { useNavigate } from 'react-router-dom'

import PlayersDatabaseLayout from '../../layout/PlayersDatabaseLayout.js'
import StatCard from '../../components/cards/StatCard.js'
import InfoPanel from '../../components/cards/InfoPanel.js'
import {
  buildPlayersDatabaseBreadcrumbs,
  PLAYERS_DATABASE_UI_ROUTES,
} from '../../logic/routeBuilders.js'
import { usePlayersDatabaseEntry } from '../../hooks/usePlayersDatabaseEntry.js'
import EntryHeader from './EntryHeader.js'
import EntryRouteCards from './EntryRouteCards.js'
import { entryPageSx as pageSx } from './sx/entryPage.sx.js'
import { entryContentSx as contentSx } from './sx/entryContent.sx.js'

const formatCount = value => {
  const nextValue = Number(value)
  return Number.isFinite(nextValue) ? nextValue.toLocaleString('en-US') : '0'
}

export default function EntryPage() {
  const navigate = useNavigate()
  const entry = usePlayersDatabaseEntry()
  const breadcrumbs = buildPlayersDatabaseBreadcrumbs([
    { label: 'מאגר שחקנים חיצוני' },
  ])

  return (
    <PlayersDatabaseLayout>
      <Box sx={pageSx.page}>
        <EntryHeader breadcrumbs={breadcrumbs} />

        <EntryRouteCards
          onNavigateToLeagues={() => navigate(PLAYERS_DATABASE_UI_ROUTES.leagues)}
          onNavigateToSearch={() => navigate(PLAYERS_DATABASE_UI_ROUTES.search)}
        />

        <Box sx={contentSx.infoGrid}>
          <InfoPanel title='סיכום מסמך האב'>
            <Box sx={contentSx.statsGrid}>
              <StatCard
                title='שחקנים'
                value={formatCount(entry.summary.playersCount)}
                caption='במסמך האב'
                iconId='players'
              />
              <StatCard
                title='קבוצות'
                value={formatCount(entry.summary.teamsCount)}
                caption='בכל העונות'
                iconId='teams'
              />
              <StatCard
                title='ליגות'
                value={formatCount(entry.summary.leaguesCount)}
                caption='בלשכה המרכזית'
                iconId='playersDatabase'
              />
              <StatCard
                title='עם פרופיל סקאוט'
                value={formatCount(entry.summary.playersWithScoutProfileCount)}
                caption='לפחות אחד'
                iconId='stats'
              />
            </Box>
          </InfoPanel>

          <InfoPanel title='מה אפשר לעשות כאן?'>
            <Stack spacing={1.1} className='dpScrollThin' sx={contentSx.capabilities}>
              <Typography level='body-md'>
                לזהות קבוצות חריגות לפי ביצועים מול מיקום בטבלה.
              </Typography>
              <Typography level='body-md'>
                לטענן סגלים וסטטיסטיקות בלי לפתוח מסמכי שחקן כל פעם.
              </Typography>
              <Typography level='body-md'>
                לאתר מועדונים לפי פרופילי סקאוט ושכבת עונה.
              </Typography>
            </Stack>
          </InfoPanel>
        </Box>
      </Box>
    </PlayersDatabaseLayout>
  )
}
