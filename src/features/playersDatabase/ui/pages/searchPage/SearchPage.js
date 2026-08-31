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
import {
  previewMissingPlayerDocumentRepair,
  repairMissingPlayerDocuments,
  runPlayerDatabaseAudit,
} from '../../../services/audit/index.js'
import { searchPageSx as sx } from './sx/searchPage.sx.js'

const clean = value => String(
  value === undefined || value === null ? '' : value
).trim()

const getRowTeamDocumentId = row => clean(
  row?.teamDocumentId ||
  row?.birthTeamDocumentId ||
  row?.birthTeamId ||
  row?.teamId
)

const getRowSeasonKey = row => clean(
  row?.seasonKey ||
  row?.seasonId
)

const buildPartialAuditDefaults = rows => {
  const safeRows = Array.isArray(rows)
    ? rows
    : []

  const scopeKeys = [
    ...new Set(
      safeRows
        .map(row => {
          const teamDocumentId = getRowTeamDocumentId(row)
          const seasonKey = getRowSeasonKey(row)

          return teamDocumentId && seasonKey
            ? `${teamDocumentId}::${seasonKey}`
            : ''
        })
        .filter(Boolean)
    ),
  ]

  if (scopeKeys.length !== 1) {
    return {
      teamDocumentId: '',
      seasonKey: '',
    }
  }

  const [teamDocumentId, seasonKey] = scopeKeys[0].split('::')

  return {
    teamDocumentId,
    seasonKey,
  }
}

function SearchPageContent() {
  const location = useLocation()
  const navigate = useNavigate()
  const [reportNameOpen, setReportNameOpen] = React.useState(false)
  const [auditOpen, setAuditOpen] = React.useState(false)
  const [auditBusy, setAuditBusy] = React.useState(false)
  const [auditError, setAuditError] = React.useState('')
  const [auditResult, setAuditResult] = React.useState(null)
  const [repairPlan, setRepairPlan] = React.useState(null)
  const [repairPreviewBusy, setRepairPreviewBusy] = React.useState(false)
  const search = useSearchPage()

  const partialAuditDefaults = React.useMemo(
    () => buildPartialAuditDefaults(search.rows),
    [search.rows]
  )

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

  const handleAuditOpen = () => {
    setAuditOpen(true)
    setAuditError('')
  }

  const handleAuditRun = async scope => {
    if (auditBusy) return

    setAuditBusy(true)
    setAuditError('')

    try {
      const result = await runPlayerDatabaseAudit({ scope })
      setAuditResult(result)
    } catch (error) {
      console.error('[playersDatabase] Data audit failed:', error)
      setAuditError(
        error instanceof Error
          ? error.message
          : 'בדיקת מצב הנתונים נכשלה'
      )
    } finally {
      setAuditBusy(false)
    }
  }

  const handleRepairRequest = async findings => {
    if (auditBusy || repairPreviewBusy) return
    setRepairPreviewBusy(true)
    setAuditError('')
    try {
      const plan = await previewMissingPlayerDocumentRepair({ findings })
      if (!plan.playersCount) {
        setAuditError('לא נמצאו מסמכי שחקן חסרים שמוכנים לתיקון.')
        return
      }
      setRepairPlan({ findings: Array.isArray(findings) ? findings : [], ...plan })
    } catch (error) {
      console.error('[playersDatabase] Player document repair preview failed:', error)
      setAuditError(error instanceof Error ? error.message : 'טעינת רשימת התיקון נכשלה')
    } finally {
      setRepairPreviewBusy(false)
    }
  }

  const handleRepairConfirm = async () => {
    if (!repairPlan?.findings?.length || auditBusy) return
    setAuditBusy(true)
    setAuditError('')
    try {
      await repairMissingPlayerDocuments({ findings: repairPlan.findings })
      const result = await runPlayerDatabaseAudit({ scope: auditResult?.scope })
      setAuditResult(result)
      setRepairPlan(null)
    } catch (error) {
      console.error('[playersDatabase] Player document repair failed:', error)
      setAuditError(error instanceof Error ? error.message : 'תיקון מסמכי השחקן נכשל')
    } finally {
      setAuditBusy(false)
    }
  }

  return (
    <>
      <Box sx={sx.page}>
        <SearchHeader
          breadcrumbs={breadcrumbs}
          onLeagues={() => navigate(PLAYERS_DATABASE_UI_ROUTES.leagues())}
          onReport={() => setReportNameOpen(true)}
          onScoutAudit={handleAuditOpen}
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
        open={auditOpen}
        busy={auditBusy || repairPreviewBusy}
        error={auditError}
        result={auditResult}
        defaultTeamDocumentId={partialAuditDefaults.teamDocumentId}
        defaultSeasonKey={partialAuditDefaults.seasonKey}
        onRun={handleAuditRun}
        onRepair={handleRepairRequest}
        onClose={() => setAuditOpen(false)}
      />

      <ConfirmModal
        open={Boolean(repairPlan)}
        busy={auditBusy}
        title='תיקון מסמכי שחקן חסרים'
        message={`נמצאו ${repairPlan?.playersCount || 0} מסמכי שחקן חסרים ב־${repairPlan?.groupsCount || 0} קבוצות. רק הפריטים המפורטים כאן נטענו ואושרו לתיקון.`}
        confirmLabel='בצע תיקון'
        cancelLabel='ביטול'
        onConfirm={handleRepairConfirm}
        onClose={() => !auditBusy && setRepairPlan(null)}
      >
        <Stack spacing={1} sx={{ maxHeight: 300, overflowY: 'auto' }}>
          {(repairPlan?.groups || []).map(group => <Sheet key={`${group.leagueId}-${group.seasonKey}-${group.teamDocumentId}`} variant='soft' sx={{ p: 1.25, borderRadius: 'sm' }}>
            {group.players.map(player => <Typography key={player.playerDocumentId} level='body-sm'>
              {player.fullName || player.playerDocumentId} — {group.teamName || 'קבוצה ללא שם'}{Number(group.teamSlot) > 1 ? ` · סלוט ${group.teamSlot}` : ''} · {group.leagueName || group.leagueId} · {group.seasonKey} · {group.ageGroup || 'קבוצת גיל לא ידועה'} · שנתון {group.birthYear || 'לא ידוע'}
            </Typography>)}
            <Typography level='body-xs' color='success'>נטען ומוכן לתיקון</Typography>
          </Sheet>)}
        </Stack>
      </ConfirmModal>
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
