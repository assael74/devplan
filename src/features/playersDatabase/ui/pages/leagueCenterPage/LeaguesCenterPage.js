// features/playersDatabase/ui/pages/leagueCenterPage/LeaguesCenterPage.js

import * as React from 'react'
import { Box } from '@mui/joy'
import { useNavigate } from 'react-router-dom'

import PlayersDatabaseLayout from '../../layout/PlayersDatabaseLayout.js'
import { useLeagueCenter } from '../../hooks/useLeagueCenter.js'
import {
  buildPlayersDatabaseBreadcrumbs,
  PLAYERS_DATABASE_UI_ROUTES,
} from '../../logic/routeBuilders.js'
import LeagueCenterHeader from './LeagueCenterHeader.js'
import LeagueCenterContext from './LeagueCenterContext.js'
import LeagueCenterOverview from './LeagueCenterOverview.js'
import LeagueCenterTable from './LeagueCenterTable.js'
import LeagueCenterWorkQueue from './LeagueCenterWorkQueue.js'
import LeagueCenterSeasonModal from './LeagueCenterSeasonModal.js'
import { WriteFlowReportModal } from '../../components/modals/index.js'
import useLeagueSeasonCreate from './hooks/useLeagueSeasonCreate.js'
import { buildLeagueCenterColumns } from './logic/leagueCenter.columns.js'
import { buildWorkQueueItems } from './logic/leagueCenter.logic.js'
import { leaguesCenterPageSx as sx } from './sx/leaguesCenterPage.sx.js'

export default function LeaguesCenterPage() {
  const navigate = useNavigate()
  const model = useLeagueCenter()
  const seasonCreate = useLeagueSeasonCreate({ onSuccess: model.reload })
  const breadcrumbs = buildPlayersDatabaseBreadcrumbs([
    { label: 'ניהול נתוני ליגות' },
  ])

  const columns = React.useMemo(() => buildLeagueCenterColumns({
    onCreateSeason: seasonCreate.open,
    onOpenLeague: row => {
      const rowSeasonKey = row.seasonKey && row.seasonKey !== 'all'
        ? row.seasonKey
        : row.seasonId
      const leagueSeasonKey = rowSeasonKey || (
        model.seasonKey !== 'all' ? model.seasonKey : ''
      )
      const leaguePath = PLAYERS_DATABASE_UI_ROUTES.league(
        row.leagueId,
        {
          seasonKey: leagueSeasonKey,
          birthYear: row.birthYear || model.birthYear,
          level: row.level || model.leagueLevel,
          centerSeasonKey: model.seasonKey,
          centerBirthYear: model.birthYear,
          centerLevel: model.leagueLevel,
        }
      )

      navigate(leaguePath)
    },
  }), [
    model.birthYear,
    model.leagueLevel,
    model.seasonKey,
    navigate,
    seasonCreate.open,
  ])

  const workItems = React.useMemo(
    () => buildWorkQueueItems(model.summary),
    [model.summary]
  )

  const handleWorkItemSelect = item => {
    model.setDataStatus(item.status || 'all')
  }

  return (
    <PlayersDatabaseLayout>
      <Box sx={sx.page}>
        <LeagueCenterHeader
          breadcrumbs={breadcrumbs}
          onNavigateToSearch={() => navigate(PLAYERS_DATABASE_UI_ROUTES.search)}
          onNavigateToEntry={() => navigate(PLAYERS_DATABASE_UI_ROUTES.entry)}
        />

        <LeagueCenterContext model={model} />

        <Box sx={sx.contentGrid}>
          <Box sx={sx.mainColumn}>
            <LeagueCenterOverview summary={model.summary} />
            <LeagueCenterTable columns={columns} model={model} />
          </Box>

          <LeagueCenterWorkQueue
            items={workItems}
            onSelect={handleWorkItemSelect}
          />
        </Box>
      </Box>

      <LeagueCenterSeasonModal
        controller={seasonCreate}
        defaultSeasonKey={model.seasonKey}
      />

      <WriteFlowReportModal
        open={Boolean(seasonCreate.writeReport)}
        report={seasonCreate.writeReport}
        onClose={seasonCreate.closeWriteReport}
      />
    </PlayersDatabaseLayout>
  )
}
