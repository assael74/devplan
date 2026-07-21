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
import EntryHeader from './EntryHeader.js'
import EntryRouteCards from './EntryRouteCards.js'
import { entryPageSx as pageSx } from './sx/entryPage.sx.js'
import { entryContentSx as contentSx } from './sx/entryContent.sx.js'

export default function EntryPage() {
  const navigate = useNavigate()
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
          <InfoPanel title='סקירת דאטה עולמית'>
            <Box sx={contentSx.statsGrid}>
              <StatCard title='שחקנים' value='1.2M+' caption='מאגר עולמי' iconId='players' />
              <StatCard title='קבוצות' value='450K+' caption='סגלים וקבוצות' iconId='teams' />
              <StatCard title='ליגות' value='190+' caption='מסגרות פעילות' iconId='playersDatabase' />
              <StatCard title='משחקים' value='15M+' caption='נתוני סטטיסטיקה' iconId='stats' />
            </Box>
          </InfoPanel>

          <InfoPanel title='מה אפשר לעשות כאן?'>
            <Stack spacing={1.1} className='dpScrollThin' sx={contentSx.capabilities}>
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
