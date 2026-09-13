import {
  Box,
  Button,
  CircularProgress,
  Stack,
  Typography,
} from '@mui/joy'
import { useNavigate, useParams } from 'react-router-dom'

import PlayersDatabaseLayout from '../../layout/PlayersDatabaseLayout.js'
import PageContentPanel from '../../components/page/PageContentPanel.js'
import PageHeader from '../../components/page/PageHeader.js'
import {
  buildPlayersDatabaseBreadcrumbs,
  PLAYERS_DATABASE_UI_ROUTES,
} from '../../logic/routeBuilders.js'
import useClubPage from './hooks/useClubPage.js'
import ClubDevelopment from './components/ClubDevelopment.js'
import ClubHeader from './components/ClubHeader.js'
import ClubOpportunities from './components/ClubOpportunities.js'
import ClubOverview from './components/ClubOverview.js'
import ClubSeasons from './components/ClubSeasons.js'
import ClubTransfers from './components/ClubTransfers.js'
import { clubPageSx as sx } from './sx/clubPage.sx.js'

export default function ClubPage() {
  const navigate = useNavigate()
  const { clubId = '' } = useParams()
  const model = useClubPage({ clubId })

  const breadcrumbs = buildPlayersDatabaseBreadcrumbs([
    {
      label: 'מועדונים',
      to: PLAYERS_DATABASE_UI_ROUTES.clubs,
    },
    {
      label: model.club?.name || 'מועדון',
    },
  ])

  const actions = (
    <Stack direction='row' spacing={1}>
      <Button
        variant='outlined'
        onClick={() => navigate(PLAYERS_DATABASE_UI_ROUTES.clubs)}
      >
        חזרה למועדונים
      </Button>
    </Stack>
  )

  const handleOpenTeam = team => {
    if (!team?.league?.leagueId || !team?.teamId) return

    navigate(PLAYERS_DATABASE_UI_ROUTES.team({
      leagueId: team.league.leagueId,
      teamId: team.teamId,
      seasonKey: team.seasonKey,
      fromLeague: team.league.leagueId,
    }))
  }

  let content = null

  if (model.loading) {
    content = (
      <Box sx={sx.stateBox}>
        <CircularProgress size='sm' />
        <Typography level='body-sm'>
          טוען מועדון...
        </Typography>
      </Box>
    )
  } else if (model.error) {
    content = (
      <Box sx={sx.stateBox}>
        <Typography level='body-sm' color='danger'>
          {model.error}
        </Typography>
      </Box>
    )
  } else if (model.notFound) {
    content = (
      <Box sx={sx.stateBox}>
        <Typography level='title-sm'>
          המועדון לא נמצא
        </Typography>
        <Typography level='body-sm'>
          ייתכן שהמועדון אינו קיים במסמך המאסטר.
        </Typography>
      </Box>
    )
  } else {
    content = (
      <Box sx={sx.sections}>
        <ClubHeader model={model.page.header} />

        <PageContentPanel title='תמונת מצב'>
          <ClubOverview model={model.page.overview} />
        </PageContentPanel>

        <PageContentPanel title='אותות לבדיקה'>
          <ClubOpportunities model={model.page.opportunities} />
        </PageContentPanel>

        <PageContentPanel title='תנועת שחקנים'>
          <ClubTransfers model={model.page.transfers} />
        </PageContentPanel>

        <PageContentPanel title='עונות'>
          <ClubSeasons
            model={model.page.seasons}
            onOpenTeam={handleOpenTeam}
          />
        </PageContentPanel>

        <PageContentPanel title='התפתחות לפי שנתון'>
          <ClubDevelopment model={model.page.development} />
        </PageContentPanel>
      </Box>
    )
  }

  const isStateView = model.loading || model.error || model.notFound

  return (
    <PlayersDatabaseLayout>
      <Box sx={sx.page}>
        <PageHeader breadcrumbs={breadcrumbs} actions={actions}>
          <Box>
            <Typography level='h1' sx={sx.pageTitle}>
              {model.club?.name || 'מועדון'}
            </Typography>
          </Box>
        </PageHeader>

        {isStateView ? (
          <PageContentPanel title='פרטי מועדון'>
            {content}
          </PageContentPanel>
        ) : content}
      </Box>
    </PlayersDatabaseLayout>
  )
}
