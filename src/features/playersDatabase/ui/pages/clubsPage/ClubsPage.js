import { useCallback, useState } from 'react'
import {
  Box,
  Button,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from '@mui/joy'
import { useNavigate } from 'react-router-dom'

import PlayersDatabaseLayout from '../../layout/PlayersDatabaseLayout.js'
import PageContentPanel from '../../components/page/PageContentPanel.js'
import PageHeader from '../../components/page/PageHeader.js'
import JsonViewerModal from '../../components/modals/JsonViewerModal.js'
import useClubsPage from '../../hooks/useClubsPage.js'
import {
  buildPlayersDatabaseBreadcrumbs,
  PLAYERS_DATABASE_UI_ROUTES,
} from '../../logic/routeBuilders.js'
import { iconUi } from '../../../../../ui/core/icons/iconUi.js'
import ClubsCollection from './components/ClubsCollection.js'
import ClubsFilters from './components/ClubsFilters.js'
import { downloadClubsMasterJson } from './logic/clubsMasterDownload.logic.js'
import { clubsPageSx as sx } from './sx/clubsPage.sx.js'

export default function ClubsPage() {
  const navigate = useNavigate()
  const model = useClubsPage()
  const [expandedClubId, setExpandedClubId] = useState(null)
  const [clubsMasterJsonOpen, setClubsMasterJsonOpen] = useState(false)

  const breadcrumbs = buildPlayersDatabaseBreadcrumbs([
    { label: 'מועדונים' },
  ])

  const handleOpenTeam = useCallback(team => {
    if (!team?.leagueId || !team?.teamId) return

    navigate(PLAYERS_DATABASE_UI_ROUTES.team({
      leagueId: team.leagueId,
      teamId: team.teamId,
      fromClubs: true,
    }))
  }, [navigate])

  const handleOpenClub = useCallback(club => {
    if (!club?.clubId) return

    navigate(PLAYERS_DATABASE_UI_ROUTES.club(club.clubId))
  }, [navigate])

  const handleToggleClub = useCallback(clubId => {
    setExpandedClubId(currentId => (
      currentId === clubId ? null : clubId
    ))
  }, [])

  const handleOpenClubsMasterJson = () => setClubsMasterJsonOpen(true)

  const actions = (
    <Stack direction='row' spacing={1}>
      <Button
        variant='outlined'
        startDecorator={iconUi({ id: 'back', size: 'sm' })}
        onClick={() => navigate(PLAYERS_DATABASE_UI_ROUTES.entry)}
      >
        חזרה לדף הפתיחה
      </Button>
    </Stack>
  )

  const clubsHeaderActions = (
    <Tooltip title='הורדת מסמך מאסטר מועדונים כ-JSON'>
      <span>
        <IconButton
          size='sm'
          variant='outlined'
          disabled={!model.clubsMasterDoc}
          aria-label='הורדת מסמך מאסטר מועדונים כ-JSON'
          onClick={handleOpenClubsMasterJson}
        >
          {iconUi({ id: 'dataShow', size: 'sm' })}
        </IconButton>
      </span>
    </Tooltip>
  )

  const summaryText = [
    model.seasonLabel,
    `${model.summary.clubsCount} מועדונים`,
    `${model.summary.teamsCount} קבוצות`,
    `${model.summary.clubsWithScoutProfilesCount} עם פרופילי סקאוט`,
  ].join(' · ')

  return (
    <PlayersDatabaseLayout>
      <Box sx={sx.page}>
        <PageHeader breadcrumbs={breadcrumbs} actions={actions}>
          <Box>
            <Typography level='h1' sx={sx.pageTitle}>
              מועדונים
            </Typography>
          </Box>
        </PageHeader>

        <Box sx={sx.contentGrid}>
          <Box sx={[sx.mainColumn, sx.clubsMainColumn]}>
            <PageContentPanel
              title='מועדונים וקבוצות'
              subtitle={summaryText}
              headerActions={clubsHeaderActions}
              panelSx={sx.clubsPanel}
              contentSx={sx.panelContent}
              contentClassName='dpScrollThin'
            >
              <ClubsCollection
                groups={model.groups}
                loading={model.loading}
                error={model.error}
                expandedClubId={expandedClubId}
                onToggleClub={handleToggleClub}
                onOpenTeam={handleOpenTeam}
                onOpenClub={handleOpenClub}
              />
            </PageContentPanel>
          </Box>

          <ClubsFilters model={model} />
        </Box>

        <JsonViewerModal
          open={clubsMasterJsonOpen}
          title='Clubs Master · נתוני JSON'
          description='תצוגה לקריאה בלבד של מסמך מאסטר המועדונים'
          data={model.clubsMasterDoc || {}}
          onClose={() => setClubsMasterJsonOpen(false)}
          onDownload={() => downloadClubsMasterJson(model.clubsMasterDoc || {})}
        />
      </Box>
    </PlayersDatabaseLayout>
  )
}
