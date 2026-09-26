// src/features/playersDatabase/ui/pages/searchPage/SearchPage.js

import * as React from 'react'
import { Box, Sheet, Stack, Typography } from '@mui/joy'
import {
  useLocation,
  useNavigate,
} from 'react-router-dom'

import PlayersDatabaseLayout from '../../layout/PlayersDatabaseLayout.js'
import {
  buildPlayersDatabaseBreadcrumbs,
  PLAYERS_DATABASE_UI_ROUTES,
} from '../../logic/routeBuilders.js'
import SearchHeader from './SearchHeader.js'
import SearchWorkspace from './SearchWorkspace.js'
import useSearchPage from './hooks/useSearchPage.js'
import { useSearchReport } from './report/index.js'
import {
  ConfirmModal,
  PlayerDatabaseAuditModal,
  ReportNameModal,
} from '../../components/modals/index.js'
import useSearchAudit from './hooks/useSearchAudit.js'
import { searchPageSx as sx } from './sx/searchPage.sx.js'

function SearchPageContent() {
  const location = useLocation()
  const navigate = useNavigate()
  const [reportNameOpen, setReportNameOpen] = React.useState(false)
  const search = useSearchPage()
  const audit = useSearchAudit({
    rows: search.rows,
  })

  const searchReport = useSearchReport({
    rows: search.rows,
    queryFilters: search.queryFilters,
    queryActiveItems: search.queryActiveItems,
    resultFilters: search.resultFilters,
    summary: search.summary,
    loadedEntityType: search.loadedEntityType,
  })

  const breadcrumbs = buildPlayersDatabaseBreadcrumbs([
    { label: 'חיפוש במאגר' },
  ])

  const handleEntityOpen = row => {
    const navigationState = {
      state: {
        from: `${location.pathname}${location.search}`,
        fromPage: 'search',
      },
    }

    if (row.entityType === 'birthTeamSeason') {
      navigate(
        PLAYERS_DATABASE_UI_ROUTES.team({
          leagueId: row.leagueId,
          teamId: row.birthTeamId || row.teamId || row.id,
          seasonKey: row.seasonKey,
        }),
        navigationState
      )
      return
    }

    navigate(
      PLAYERS_DATABASE_UI_ROUTES.player({
        playerId: row.playerDocumentId || row.id,
        seasonKey: row.seasonKey,
        teamId: row.teamId,
        leagueId: row.leagueId,
      }),
      navigationState
    )
  }

  const handleCreateReport = async reportDetails => {
    const published = await searchReport.publishAndOpen(reportDetails)

    if (published) {
      setReportNameOpen(false)
    }
  }


  return (
    <>
      <Box sx={sx.page}>
        <SearchHeader
          breadcrumbs={breadcrumbs}
          onLeagues={() => navigate(PLAYERS_DATABASE_UI_ROUTES.leagues())}
          onReport={() => setReportNameOpen(true)}
          onScoutAudit={audit.openAudit}
          reportDisabled={!search.hasLoaded || !search.rows.length}
        />

        <SearchWorkspace
          search={search}
          onEntityOpen={handleEntityOpen}
        />
      </Box>

      <ReportNameModal
        open={reportNameOpen}
        busy={searchReport.busy}
        error={searchReport.error}
        entityType={search.loadedEntityType}
        onClose={() => setReportNameOpen(false)}
        onConfirm={handleCreateReport}
      />

      <PlayerDatabaseAuditModal
        open={audit.open}
        busy={audit.busy || audit.repairPreviewBusy}
        error={audit.error}
        result={audit.result}
        repairProgress={audit.repairProgress}
        recentWriteActions={audit.recentWriteActions}
        recentWriteActionsBusy={audit.recentWriteActionsBusy}
        defaultTeamDocumentId={audit.partialAuditDefaults.teamDocumentId}
        defaultSeasonKey={audit.partialAuditDefaults.seasonKey}
        onRun={audit.runAudit}
        onRunWriteAction={audit.runAuditForWriteAction}
        onScopeChange={audit.handleScopeChange}
        onRepair={audit.requestRepair}
        onDeleteOrphanPlayerIndexes={audit.requestOrphanPlayerIndexDelete}
        onRepairPlayerIndexes={audit.repairPlayerIndexes}
        onRepairRosterTeamProjectionFromCanonical={audit.repairRosterTeamProjectionFromCanonical}
        onRepairTeamIndexes={audit.repairTeamIndexes}
        onRetryMovementCounterparts={audit.retryMovementCounterparts}
        onResetOrphanTeamIndexes={audit.resetOrphanTeamIndexes}
        onRepairClubProjections={audit.repairClubProjections}
        onRepairClubCompetitionPaths={audit.repairClubCompetitionPaths}
        onRepairClubsMaster={audit.repairClubsMaster}
        onRefreshClubProjections={audit.refreshClubProjections}
        onRefreshClubsMaster={audit.refreshClubsMaster}
        onPlayerOpen={audit.openPlayer}
        onTeamOpen={audit.openTeam}
        onLeagueOpen={audit.openLeague}
        onLeaguesCenterOpen={audit.openLeaguesCenter}
        onClose={audit.closeAudit}
      />

      <ConfirmModal
        open={Boolean(audit.repairPlan)}
        busy={audit.busy}
        title='תיקון מסמכי שחקן חסרים'
        message={`נמצאו ${audit.repairPlan?.playersCount || 0} מסמכי שחקן חסרים ב־${audit.repairPlan?.groupsCount || 0} קבוצות. רק הפריטים המפורטים כאן נטענו ואושרו לתיקון.`}
        confirmLabel='בצע תיקון'
        cancelLabel='ביטול'
        onConfirm={audit.confirmRepair}
        onClose={() => !audit.busy && audit.clearRepairPlan()}
      >
        <Stack spacing={1} sx={sx.repairPlanList}>
          {(audit.repairPlan?.groups || []).map(group => <Sheet key={`${group.leagueId}-${group.seasonKey}-${group.teamDocumentId}`} variant='soft' sx={sx.repairPlanGroup}>
            {group.players.map(player => <Typography key={player.playerDocumentId} level='body-sm'>
              {player.fullName || player.playerDocumentId} — {group.teamName || 'קבוצה ללא שם'}{Number(group.teamSlot) > 1 ? ` · סלוט ${group.teamSlot}` : ''} · {group.leagueName || group.leagueId} · {group.seasonKey} · {group.ageGroup || 'קבוצת גיל לא ידועה'} · שנתון {group.birthYear || 'לא ידוע'}
            </Typography>)}
            <Typography level='body-xs' color='success'>נטען ומוכן לתיקון</Typography>
          </Sheet>)}
        </Stack>
      </ConfirmModal>

      <ConfirmModal
        open={Boolean(audit.orphanIndexDeletePlan)}
        busy={audit.busy}
        title='מחיקת אינדקסי שחקנים יתומים'
        message={`הפעולה תמחק רק ${audit.orphanIndexDeletePlan?.length || 0} מסמכי Player SearchIndex שסומנו באודיט. לפני כל מחיקה תתבצע בדיקה חוזרת שהשחקן עדיין אינו מופיע ב-Team Season. מסמכי שחקן וסגל לא יימחקו.`}
        confirmLabel='מחק אינדקסים יתומים'
        cancelLabel='ביטול'
        onConfirm={audit.confirmOrphanPlayerIndexDelete}
        onClose={() => !audit.busy && audit.clearOrphanIndexDeletePlan()}
      />

    </>
  )
}

export default function SearchPage() {
  return (
    <PlayersDatabaseLayout>
      <SearchPageContent />
    </PlayersDatabaseLayout>
  )
}
