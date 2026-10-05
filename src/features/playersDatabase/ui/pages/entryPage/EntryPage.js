// src/features/playersDatabase/ui/pages/entryPage/EntryPage.js

import { Box } from '@mui/joy'
import { useNavigate } from 'react-router-dom'

import PlayersDatabaseLayout from '../../layout/PlayersDatabaseLayout.js'
import KpiCard from '../../components/kpi/KpiCard.js'
import InfoPanel from '../../components/page/InfoPanel.js'
import {
  buildPlayersDatabaseBreadcrumbs,
  PLAYERS_DATABASE_UI_ROUTES,
} from '../../logic/routeBuilders.js'
import { usePlayersDatabaseEntry } from './hooks/usePlayersDatabaseEntry.js'
import EntryHeader from './EntryHeader.js'
import EntryRouteCards from './EntryRouteCards.js'
import { entryPageSx as sx } from './sx/entryPage.sx.js'

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
      <Box sx={sx.page}>
        <EntryHeader
          breadcrumbs={breadcrumbs}
          onNavigateToDataOps={() => navigate(PLAYERS_DATABASE_UI_ROUTES.dataOps)}
        />

        <EntryRouteCards
          onNavigateToLeagues={() => navigate(PLAYERS_DATABASE_UI_ROUTES.leagues())}
          onNavigateToSearch={() => navigate(PLAYERS_DATABASE_UI_ROUTES.search)}
          onNavigateToClubs={() => navigate(PLAYERS_DATABASE_UI_ROUTES.clubs)}
        />

        <Box sx={sx.infoGrid}>
          <InfoPanel title='סיכום מרכז הליגות'>
            <Box sx={sx.statsGrid}>
              <KpiCard
                title='ליגות'
                value={formatCount(entry.summary.leaguesCount)}
                caption='במרכז הליגות'
                iconId='playersDatabase'
              />
              <KpiCard
                title='עונות'
                value={formatCount(entry.summary.seasonsCount)}
                caption='בכל הליגות'
                iconId='stats'
              />
              <KpiCard
                title='קבוצות'
                value={formatCount(entry.summary.teamsCount)}
                caption='בכל העונות'
                iconId='teams'
              />
              <KpiCard
                title='קבוצות עם סטטס'
                value={formatCount(entry.summary.teamsWithStatsCount)}
                caption='לפי מצב התיעוד'
                iconId='stats'
              />
            </Box>
          </InfoPanel>
        </Box>
      </Box>
    </PlayersDatabaseLayout>
  )
}
