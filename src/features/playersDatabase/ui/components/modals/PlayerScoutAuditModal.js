// src/features/playersDatabase/ui/components/modals/PlayerScoutAuditModal.js

import * as React from 'react'
import {
  Box,
  Button,
  Chip,
  Input,
  Stack,
  Table,
  Typography,
} from '@mui/joy'

import RegularModal from './RegularModal.js'
import { iconUi } from '../../../../../ui/core/icons/iconUi.js'
import { playerScoutAuditSx as sx } from './sx/playerScoutAudit.sx.js'

const clean = value => String(
  value === undefined || value === null ? '' : value
).trim()

const ISSUE_LABELS = {
  birth_team_mismatch: 'פער מול החישוב החדש',
  missing_player_document: 'מסמך שחקן חסר',
  player_document_mismatch: 'פער במסמך שחקן',
  missing_search_index: 'אינדקס שחקן חסר',
  search_index_mismatch: 'פער באינדקס שחקן',
  missing_team_performance_context: 'חסר הקשר ביצועי קבוצה',
  birth_team_reliability_mismatch: 'פער באמינות במסמך קבוצה',
  player_document_reliability_mismatch: 'פער באמינות במסמך שחקן',
  search_index_reliability_mismatch: 'פער באמינות באינדקס',
  current_season_status_invalid: 'סטטוס עונה נוכחית חסר או לא תקין',
  history_season_status_invalid: 'סטטוס עונת עבר לא תקין',
  player_schema_outdated: 'Schema שחקן דורש עדכון',
  player_season_context_outdated: 'הקשר עונה במסמך השחקן דורש סנכרון',
  team_player_schema_outdated: 'Schema שחקן בקבוצה דורש עדכון',
  team_player_state_outdated: 'Scout State בקבוצה לא מסונכרן',
  player_narrative_schema_invalid: 'מבנה סיפור השחקן לא תקין',
  search_index_schema_outdated: 'Schema אינדקס שחקן דורש עדכון',
  team_scout_state_mismatch: 'Current Scout State בקבוצה לא מסונכרן',
  player_scout_state_mismatch: 'Current Scout State במסמך שחקן לא מסונכרן',
  search_index_scout_projection_mismatch: 'פער ב-Scout projection באינדקס',
  team_stats_measurement_outdated: 'Full Stats measurement לא מסונכרן',
  player_measurement_history_outdated: 'Measurement History במסמך שחקן לא מסונכרנת',
  player_tracking_mismatch: 'Tracking reasons לא מסונכרנים',
  player_season_status_mismatch: 'סטטוס עונה במסמך שחקן לא מסונכרן',
  search_index_season_status_mismatch: 'סטטוס עונה באינדקס לא מסונכרן',
}

const joinValues = values => (
  Array.isArray(values) && values.length
    ? values.join(', ')
    : '-'
)

function SummaryCard({ label, value, tone = 'neutral' }) {
  return (
    <Box sx={[sx.summaryCard, sx.summaryTone[tone]]}>
      <Typography level='body-xs' sx={sx.summaryLabel}>
        {label}
      </Typography>

      <Typography level='h3' sx={sx.summaryValue}>
        {value}
      </Typography>
    </Box>
  )
}

function ProfileCounts({ title, values }) {
  const entries = Object.entries(values || {})

  return (
    <Box sx={sx.profileCounts}>
      <Typography level='title-sm' sx={sx.sectionTitle}>
        {title}
      </Typography>

      {entries.length ? (
        <Stack direction='row' spacing={0.75} sx={sx.profileChips}>
          {entries.map(([profileId, count]) => (
            <Chip
              key={profileId}
              size='sm'
              variant='soft'
            >
              {profileId}: {count}
            </Chip>
          ))}
        </Stack>
      ) : (
        <Typography level='body-sm' sx={sx.emptyText}>
          אין
        </Typography>
      )}
    </Box>
  )
}

export default function PlayerScoutAuditModal({
  open,
  busy,
  error,
  audit,
  repairBusy,
  repairPreview,
  repairResult,
  engineRefreshPreview,
  engineRefreshResult,
  partialAuditDefaults,
  onRunFull,
  onRunPartial,
  onDownload,
  onRepairPreview,
  onRepairApply,
  onEngineRefreshPreview,
  onEngineRefreshApply,
  onClose,
}) {
  const [teamDocumentId, setTeamDocumentId] = React.useState('')
  const [seasonKey, setSeasonKey] = React.useState('')

  React.useEffect(() => {
    if (!open) return

    setTeamDocumentId(
      clean(partialAuditDefaults?.teamDocumentId)
    )
    setSeasonKey(
      clean(partialAuditDefaults?.seasonKey)
    )
  }, [
    open,
    partialAuditDefaults?.teamDocumentId,
    partialAuditDefaults?.seasonKey,
  ])

  const summary = audit?.summary || {}
  const issues = Array.isArray(audit?.issues)
    ? audit.issues
    : []
  const previewSummary = repairPreview?.summary || {}
  const enginePreviewSummary = engineRefreshPreview?.summary || {}
  const engineFieldCounts = enginePreviewSummary.fieldCounts || {}
  const auditCost = audit?.cost?.audit || {}
  const runtimeCost = audit?.cost?.runtime || {}
  const runtimeFlows = runtimeCost.flows || {}
  const runtimeRisks = Array.isArray(runtimeCost.risks) ? runtimeCost.risks : []
  const repairCost = repairPreview?.cost || {}
  const repairReads = repairCost.reads || {}
  const repairWrites = repairCost.writes || {}
  const repairAffected = repairCost.affected || {}
  const repairVerification = repairCost.verification || {}
  const repairRoutes = Array.isArray(repairPreview?.repairRoutes)
    ? repairPreview.repairRoutes
    : []
  const shadow = audit?.shadow || null
  const shadowSummary = shadow?.summary || {}
  const shadowChangedRows = Array.isArray(shadow?.changedRows)
    ? shadow.changedRows.slice(0, 100)
    : []
  const partialAuditDisabled = (
    busy ||
    repairBusy ||
    !clean(teamDocumentId) ||
    !clean(seasonKey)
  )
  const actionableIssues = issues.filter(issue => issue.repairable !== false)
  const visibleIssues = actionableIssues.slice(0, 250)
  const narrativeIssues = issues.filter(issue => (
    issue.type === 'player_narrative_schema_invalid'
  ))
  const repairableIssuesCount = Number(summary.repairableIssuesCount || 0)
  const engineDiagnosticIssuesCount = Number(summary.engineDiagnosticIssuesCount || 0)
  const schemaReportOnlyIssuesCount = Number(summary.schemaReportOnlyIssuesCount || 0)
  const quietDetails = [
    `Measurement ${summary.measurementIssuesCount || 0}`,
    `Tracking ${summary.trackingIssuesCount || 0}`,
    `Projection ${summary.projectionIssuesCount || 0}`,
    `Current State ${summary.stateIssuesCount || 0}`,
    `Profile diff ${summary.rowsWithProfileDiff || 0}`,
    `Reads ${auditCost.reads?.total || 0}`,
  ].join(' · ')

  const handlePartialRun = () => {
    onRunPartial({
      teamDocumentId: clean(teamDocumentId),
      seasonKey: clean(seasonKey),
    })
  }

  return (
    <RegularModal
      open={open}
      title='Audit פרופילי Scout'
      description='בחר את היקף הבדיקה. פתיחת המודאל אינה מבצעת קריאות Firestore.'
      iconId='search'
      size='xl'
      busy={busy}
      hideFooter
      headerActions={(
        <Stack direction='row' spacing={0.75}>
          <Button
            size='sm'
            variant='soft'
            disabled={!audit || busy || repairBusy}
            onClick={onDownload}
          >
            הורד JSON
          </Button>

          <Button
            size='sm'
            variant='outlined'
            color='primary'
            loading={repairBusy}
            disabled={!audit || busy || repairBusy || !engineDiagnosticIssuesCount}
            onClick={onEngineRefreshPreview}
          >
            Refresh Engine Preview
          </Button>

          <Button
            size='sm'
            variant='solid'
            color='primary'
            loading={repairBusy}
            disabled={!engineRefreshPreview || busy || repairBusy}
            onClick={onEngineRefreshApply}
          >
            רענן Engine State
          </Button>

          <Button
            size='sm'
            variant='outlined'
            color='warning'
            loading={repairBusy}
            disabled={!audit || busy || repairBusy}
            onClick={onRepairPreview}
          >
            Repair Preview
          </Button>

          <Button
            size='sm'
            variant='solid'
            color='danger'
            loading={repairBusy}
            disabled={!repairPreview || busy || repairBusy}
            onClick={onRepairApply}
          >
            בצע Repair
          </Button>
        </Stack>
      )}
      contentSx={sx.modalContent}
      onClose={onClose}
    >
      <Box sx={sx.content}>
        <Box sx={sx.auditChoiceGrid}>
          <Box sx={sx.auditChoiceCard}>
            <Box sx={sx.auditChoiceCopy}>
              <Typography level='title-md' sx={sx.sectionTitle}>
                Audit חלקי
              </Typography>

              <Typography level='body-sm' sx={sx.auditChoiceDescription}>
                בודק רק קבוצה ועונה אחת. החישוב משווה את שחקני אותה קבוצה בין dbBirthTeams, dbPlayers ו-dbSearchIndexes, בלי לסרוק את יתר מאגר השחקנים.
              </Typography>
            </Box>

            <Box sx={sx.partialAuditFields}>
              <Input
                size='sm'
                value={teamDocumentId}
                placeholder='teamDocumentId'
                disabled={busy || repairBusy}
                onChange={event => setTeamDocumentId(event.target.value)}
              />

              <Input
                size='sm'
                value={seasonKey}
                placeholder='עונה, לדוגמה 25/26'
                disabled={busy || repairBusy}
                onChange={event => setSeasonKey(event.target.value)}
              />
            </Box>

            <Button
              variant='solid'
              loading={busy}
              disabled={partialAuditDisabled}
              startDecorator={
                !busy
                  ? iconUi({
                      id: 'search',
                      size: 'sm',
                    })
                  : null
              }
              onClick={handlePartialRun}
            >
              הרץ Audit חלקי
            </Button>
          </Box>

          <Box sx={sx.auditChoiceCard}>
            <Box sx={sx.auditChoiceCopy}>
              <Typography level='title-md' sx={sx.sectionTitle}>
                Audit מלא
              </Typography>

              <Typography level='body-sm' sx={sx.auditChoiceDescription}>
                סורק את כל מאגר הקבוצות, השחקנים והאינדקסים. הבדיקה מיועדת לביקורת מערכת כוללת ועלולה לבצע מספר גדול של קריאות Firestore.
              </Typography>
            </Box>

            <Button
              variant='outlined'
              loading={busy}
              disabled={busy || repairBusy}
              startDecorator={
                !busy
                  ? iconUi({
                      id: 'search',
                      size: 'sm',
                    })
                  : null
              }
              onClick={onRunFull}
            >
              הרץ Audit מלא
            </Button>
          </Box>
        </Box>

        {error ? (
          <Typography level='body-sm' color='danger'>
            {error}
          </Typography>
        ) : null}

        {audit ? (
          <Box sx={sx.auditStatusBox}>
            <Box sx={sx.auditStatusHeader}>
              <Box>
                <Typography level='title-md' sx={sx.sectionTitle}>
                  מצב האודיט
                </Typography>
                <Typography level='body-xs' sx={sx.auditChoiceDescription}>
                  המספרים הראשיים מציגים מה ניתן לתקן עכשיו. אבחוני מנוע ו-Schema לדיווח בלבד אינם חלק מה-Repair.
                </Typography>
              </Box>

              <Chip
                size='sm'
                variant='soft'
                color={repairableIssuesCount ? 'warning' : 'success'}
              >
                {repairableIssuesCount ? 'דורש טיפול' : 'אין פערים לתיקון'}
              </Chip>
            </Box>

            <Box sx={sx.summaryGrid}>
              <SummaryCard
                label='שורות שחושבו מחדש'
                value={summary.checkedTeamPlayerRows || 0}
              />
              <SummaryCard
                label='לתיקון עכשיו'
                value={repairableIssuesCount}
                tone={repairableIssuesCount ? 'warning' : 'success'}
              />
              <SummaryCard
                label='פערי סנכרון'
                value={summary.syncIssuesCount || 0}
                tone={summary.syncIssuesCount ? 'warning' : 'success'}
              />
              <SummaryCard
                label='Schema לתיקון'
                value={summary.schemaAutoRepairIssuesCount || 0}
                tone={summary.schemaAutoRepairIssuesCount ? 'warning' : 'success'}
              />
              <SummaryCard
                label='אבחון מנוע'
                value={engineDiagnosticIssuesCount}
                tone='neutral'
              />
              <SummaryCard
                label='דיווח בלבד'
                value={schemaReportOnlyIssuesCount}
                tone='neutral'
              />
            </Box>

            <Typography level='body-xs' sx={sx.costNote}>
              {quietDetails}
            </Typography>
          </Box>
        ) : null}

        {audit?.cost?.audit ? (
          <Typography level='body-xs' sx={sx.costNote}>
            מסמכים שנמצאו: קבוצות {auditCost.documentsObserved?.teamDocuments || 0} · dbPlayers {auditCost.documentsObserved?.playerDocuments || 0} · Player SearchIndex {auditCost.documentsObserved?.playerSearchIndexes || 0} · Team SearchIndex {auditCost.documentsObserved?.teamSearchIndexes || 0}. Player document lookups: {auditCost.documentsObserved?.playerDocumentLookups || 0}.
          </Typography>
        ) : null}

        {audit?.cost?.runtime ? (
          <Box component='details' sx={sx.detailsBox}>
            <Box component='summary' sx={sx.detailsSummary}>
              <Typography level='title-sm' sx={sx.sectionTitle}>
                בדיקת עלויות Runtime
              </Typography>
              <Typography level='body-xs' sx={sx.repairCostBreakdown}>
                הערכת עלויות תפעוליות לפי המסמכים שכבר נקראו
              </Typography>
            </Box>

            <Typography level='body-xs' sx={sx.repairCostBreakdown}>
              האומדן משתמש רק במסמכים שכבר נקראו באודיט. הוא אינו מבצע Firestore reads נוספים לצורך תמחור.
            </Typography>

            <Box sx={sx.repairCostGrid}>
              <SummaryCard
                label='Full Stats · Reads מינימום'
                value={runtimeFlows.fullStatsLoad?.readsMinimum || 0}
              />
              <SummaryCard
                label='Full Stats · Writes מקסימום'
                value={runtimeFlows.fullStatsLoad?.writesMaximum || 0}
                tone={runtimeFlows.fullStatsLoad?.writesMaximum ? 'warning' : 'success'}
              />
              <SummaryCard
                label='Team Context · Reads מינימום'
                value={runtimeFlows.teamContextUpdate?.readsMinimum || 0}
              />
              <SummaryCard
                label='Team Context · Writes מקסימום'
                value={runtimeFlows.teamContextUpdate?.writesMaximum || 0}
                tone={runtimeFlows.teamContextUpdate?.writesMaximum ? 'warning' : 'success'}
              />
              <SummaryCard
                label='Role Edit · Reads/Writes'
                value={`${runtimeFlows.roleEdit?.readsTypical || 0}/${runtimeFlows.roleEdit?.writesTypical || 0}`}
              />
              <SummaryCard
                label='Verification · Reads/Writes'
                value={`${runtimeFlows.verificationUpdate?.readsTypical || 0}/${runtimeFlows.verificationUpdate?.writesTypical || 0}`}
              />
              <SummaryCard
                label='Profile Mutation · Reads/Writes'
                value={`${runtimeFlows.manualProfileMutation?.readsTypical || 0}/${runtimeFlows.manualProfileMutation?.writesTypical || 0}`}
              />
              <SummaryCard
                label='Story open · Reads'
                value={`0-${runtimeFlows.storyOpen?.readsMaximum || 0}`}
              />
            </Box>

            <Typography level='body-xs' sx={sx.repairCostBreakdown}>
              Full Stats אינו כולל באומדן את עלות Identity Resolution המשתנה. שאילתות Player SearchIndex ברמת מועדון מוצגות כמינימום בלבד.
            </Typography>

            {runtimeRisks.length ? (
              <Stack spacing={0.5}>
                {runtimeRisks.map(risk => (
                  <Typography
                    key={risk.id}
                    level='body-xs'
                    sx={sx.repairNote}
                  >
                    {risk.severity === 'high' ? 'P1' : 'P2'} · {risk.message}
                  </Typography>
                ))}
              </Stack>
            ) : null}
          </Box>
        ) : null}

        {shadow ? (
          <Box component='details' sx={sx.shadowBox}>
            <Box component='summary' sx={sx.shadowHeader}>
              <Box>
                <Typography level='title-md' sx={sx.sectionTitle}>
                  V2 פעיל — השוואה מול Legacy
                </Typography>
                <Typography level='body-xs' sx={sx.shadowNote}>
                  Read-only · ללא כתיבות וללא Firestore reads נוספים. מגמת Closing Gap בין snapshots עדיין אינה נכללת בהשוואה זו.
                </Typography>
              </Box>

              <Chip size='sm' variant='soft' color='primary'>
                {shadow.engineVersion || 'scouting-v2-shadow'}
              </Chip>
            </Box>

            <Box sx={sx.shadowSummaryGrid}>
              <SummaryCard
                label='Legacy עם Profile'
                value={shadowSummary.v1ProfiledPlayers || 0}
              />
              <SummaryCard
                label='V2 פעיל עם Profile'
                value={shadowSummary.v2ProfiledPlayers || 0}
              />
              <SummaryCard
                label='שחקנים שהשתנו'
                value={shadowSummary.changedProfilePlayers || 0}
                tone={shadowSummary.changedProfilePlayers ? 'warning' : 'success'}
              />
              <SummaryCard
                label='נוסף ב-V2 הפעיל'
                value={shadowSummary.v2AddedProfilePlayers || 0}
              />
              <SummaryCard
                label='קיים רק ב-Legacy'
                value={shadowSummary.v2RemovedProfilePlayers || 0}
                tone={shadowSummary.v2RemovedProfilePlayers ? 'warning' : 'success'}
              />
              <SummaryCard
                label='Near Profile'
                value={shadowSummary.nearProfilePlayers || 0}
              />
              <SummaryCard
                label='Next Best Check'
                value={shadowSummary.playersWithNextBestCheck || 0}
              />
              <SummaryCard
                label='Contract issues'
                value={shadowSummary.contractIssuePlayers || 0}
                tone={shadowSummary.contractIssuePlayers ? 'danger' : 'success'}
              />
            </Box>

            <Box sx={sx.profileCountsGrid}>
              <ProfileCounts
                title='Profiles שנוספו ב-V2 הפעיל'
                values={shadowSummary.addedProfilesById}
              />
              <ProfileCounts
                title='Profiles שקיימים רק ב-Legacy'
                values={shadowSummary.removedProfilesById}
              />
            </Box>

            <Typography level='body-xs' sx={sx.shadowNote}>
              Team Gate: open_context {shadowSummary.teamGateModeCounts?.open_context || 0} · legacy_filter {shadowSummary.teamGateModeCounts?.legacy_filter || 0} · לא זמין {shadowSummary.teamGateModeCounts?.unavailable || 0}.
            </Typography>

            {shadowChangedRows.length ? (
              <Box className='dpScrollThin' sx={sx.shadowTableWrap}>
                <Table size='sm' stickyHeader sx={sx.shadowTable}>
                  <thead>
                    <tr>
                      <th>שחקן</th>
                      <th>קבוצה</th>
                      <th>עונה</th>
                      <th>Legacy</th>
                      <th>V2 פעיל</th>
                      <th>Primary</th>
                      <th>Near</th>
                      <th>Opportunity</th>
                      <th>Gate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shadowChangedRows.map((row, index) => (
                      <tr key={`${row.scopeKey}-${row.playerId}-${index}`}>
                        <td>{row.displayName || row.playerId || '-'}</td>
                        <td>{row.teamName || '-'}</td>
                        <td>{row.seasonKey || '-'}</td>
                        <td>{joinValues(row.v1ProfileIds)}</td>
                        <td>{joinValues(row.v2ProfileIds)}</td>
                        <td>{row.primaryProfileId || '-'}</td>
                        <td>{row.nearestProfile?.profileId || '-'}</td>
                        <td>{row.opportunityStatus || '-'}</td>
                        <td>{row.teamGateMode || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Box>
            ) : (
              <Typography level='body-sm' sx={sx.emptyText}>
                אין שינויי Profile בין Legacy ל-V2 הפעיל בסקופ שנבדק.
              </Typography>
            )}
          </Box>
        ) : null}

        {engineRefreshPreview ? (
          <Box sx={sx.repairBox}>
            <Box sx={sx.repairHeader}>
              <Typography level='title-sm' sx={sx.sectionTitle}>
                Refresh Engine State Preview
              </Typography>
              <Chip size='sm' color='primary' variant='soft'>
                scoutVerification נשמר
              </Chip>
            </Box>

            <Box sx={sx.repairGrid}>
              <SummaryCard
                label='מסמכי שחקן'
                value={enginePreviewSummary.affectedPlayerDocuments || 0}
              />
              <SummaryCard
                label='עונות שחקן'
                value={enginePreviewSummary.affectedPlayerSeasons || 0}
              />
              <SummaryCard
                label='Reads מקסימום'
                value={engineRefreshPreview.cost?.readsMaximum || 0}
              />
              <SummaryCard
                label='Writes מקסימום'
                value={engineRefreshPreview.cost?.writesMaximum || 0}
              />
            </Box>

            <ProfileCounts
              title='שדות Engine לעדכון'
              values={engineFieldCounts}
            />

            <Typography level='body-xs' sx={sx.costNote}>
              מתעדכנים רק שדות Engine Computed State. לא נוגעים ב-scoutVerification, בפרופילים ידניים או ב-SearchIndex. אין Audit אימות אוטומטי לאחר הכתיבה כדי לחסוך קריאות.
            </Typography>
          </Box>
        ) : null}

        {engineRefreshResult ? (
          <Box sx={sx.repairBox}>
            <Typography level='title-sm' sx={sx.sectionTitle}>
              Refresh Engine State הושלם
            </Typography>

            <Typography level='body-sm'>
              {engineRefreshResult.playerDocumentsUpdated || 0} מסמכי שחקן עודכנו · {engineRefreshResult.playerSeasonsUpdated || 0} עונות עודכנו · {engineRefreshResult.skippedDocuments || 0} מסמכים דולגו.
            </Typography>
          </Box>
        ) : null}

        {repairPreview ? (
          <Box sx={sx.repairBox}>
            <Box sx={sx.repairHeader}>
              <Typography level='title-sm' sx={sx.sectionTitle}>
                Repair Preview
              </Typography>
              <Chip size='sm' color='warning' variant='soft'>
                עדיין לא בוצעו כתיבות
              </Chip>
            </Box>

            <Box sx={sx.repairGrid}>
              <SummaryCard
                label='Scopes לתיקון'
                value={previewSummary.affectedTeamSeasonScopes || 0}
              />
              <SummaryCard
                label='מסמכי קבוצה'
                value={previewSummary.affectedTeamDocuments || 0}
              />
              <SummaryCard
                label='dbPlayers ליצור'
                value={previewSummary.playerDocsMissingBeforeRepair || 0}
              />
              <SummaryCard
                label='dbPlayers לסנכרן'
                value={previewSummary.playerDocsExistingWithDiff || 0}
              />
              <SummaryCard
                label='SearchIndex'
                value={previewSummary.searchIndexDocumentsWithDiff || 0}
              />
              <SummaryCard
                label='Schema לתיקון'
                value={previewSummary.schemaIssues || 0}
              />
            </Box>

            <Typography level='body-xs' sx={sx.costNote}>
              לא לתיקון: Schema report-only {previewSummary.nonRepairableSchemaIssues || 0} · Current State {previewSummary.stateIssues || 0} · Measurement {previewSummary.measurementIssues || 0} · Tracking {previewSummary.trackingIssues || 0} · Projection {previewSummary.projectionIssues || 0}
            </Typography>

            {repairRoutes.length ? (
              <Box sx={sx.repairCostBox}>
                <Typography level='title-sm' sx={sx.sectionTitle}>
                  מסלולי תיקון: מקור → יעד
                </Typography>

                <Stack spacing={0.75}>
                  {repairRoutes.map(route => (
                    <Box
                      key={`${route.source}-${route.target}`}
                      sx={sx.repairRouteRow}
                    >
                      <Typography level='body-sm'>
                        {route.source} → {route.target}
                      </Typography>

                      <Typography level='body-xs' sx={sx.repairCostBreakdown}>
                        {route.issuesCount || 0} פערים · {joinValues(route.issueTypes)}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </Box>
            ) : null}

            <Box sx={sx.repairCostBox}>
              <Typography level='title-sm' sx={sx.sectionTitle}>
                עלות משוערת ל-Apply Repair
              </Typography>

              <Box sx={sx.repairCostGrid}>
                <SummaryCard
                  label={repairReads.processEstimateIsMinimum
                    ? 'Reads מינימום לתהליך'
                    : 'Reads לכל התהליך'}
                  value={repairReads.processEstimateIsMinimum
                    ? `לפחות ${repairReads.processEstimatedMin || 0}`
                    : `${repairReads.processEstimatedMin || 0}-${repairReads.processEstimatedMax || 0}`}
                />
                <SummaryCard
                  label='Writes מקסימום'
                  value={repairWrites.estimatedMax || 0}
                  tone={repairWrites.estimatedMax ? 'warning' : 'success'}
                />
                <SummaryCard
                  label='פעולות שחקן'
                  value={repairAffected.playerOperations || 0}
                />
                <SummaryCard
                  label='Schema documents'
                  value={repairAffected.schemaPlayerDocuments || 0}
                />
              </Box>

              <Typography level='body-xs' sx={sx.repairCostBreakdown}>
                Apply reads: {repairReads.applyEstimateIsMinimum ? 'לפחות ' : ''}{repairReads.applyEstimated || 0} · Verification reads: {repairVerification.runsAutomatically
                  ? `${repairReads.verificationEstimatedMin || 0}-${repairReads.verificationEstimatedMax || 0}`
                  : 'לא רץ אוטומטית'}
              </Typography>

              <Typography level='body-xs' sx={sx.repairCostBreakdown}>
                Apply breakdown: קבוצה {repairReads.teamDocuments || 0} · שחקנים {repairReads.playerDocuments || 0} · Schema {repairReads.schemaPlayerDocuments || 0} · SearchIndex {repairReads.searchIndexEstimateExact ? '' : 'לפחות '}{repairReads.searchIndexes || 0}
              </Typography>

              <Typography level='body-xs' sx={sx.repairCostBreakdown}>
                Writes מקסימום: קבוצה {repairWrites.teamDocuments || 0} · שחקנים {repairWrites.playerDocumentsMax || 0} · Schema {repairWrites.schemaPlayerDocumentsMax || 0} · SearchIndex {repairWrites.searchIndexesMax || 0}
              </Typography>
            </Box>

            <Typography level='body-xs' sx={sx.repairNote}>
              מסמכי שחקן חסרים הם מועמדים בלבד. יצירה תתבצע רק אם החישוב מחדש משאיר לשחקן Scout Profile. {repairReads.searchIndexEstimateExact === false
                ? 'לפחות אחד מה-SearchIndex queries של Apply פועל ברמת מועדון. לכן ערכי ה-reads המוצגים הם מינימום בלבד; המערכת לא מבצעת קריאה נוספת לכל המועדון רק כדי לחשב אומדן עלות.'
                : 'אומדן ה-SearchIndex תואם להיקף שנצפה באודיט.'} {repairAffected.schemaOnlyRepair
                ? 'ב-Repair שמכיל רק Schema לא רץ Verification Audit אוטומטי לאחר Apply.'
                : ''}
            </Typography>
          </Box>
        ) : null}

        {repairResult ? (
          <Box sx={sx.repairResultBox}>
            <Typography level='title-sm' sx={sx.sectionTitle}>
              Repair הושלם
            </Typography>
            <Typography level='body-sm'>
              {repairResult.teamDocumentsUpdated || 0} מסמכי קבוצה עודכנו · {' '}
              {repairResult.playerDocumentsCreated || 0} מסמכי שחקן נוצרו · {' '}
              {repairResult.playerDocumentsUpdated || 0} מסמכי שחקן סונכרנו · {' '}
              {repairResult.playerSchemaDocumentsUpdated || 0} מסמכי שחקן תוקנו ב-Schema · {' '}
              {repairResult.searchIndexRowsUpdated || 0} אינדקסים עודכנו
            </Typography>
          </Box>
        ) : null}

        {audit ? (
          <Box component='details' sx={sx.detailsBox}>
            <Box component='summary' sx={sx.detailsSummary}>
              <Typography level='title-sm' sx={sx.sectionTitle}>
                אבחון פרופילים
              </Typography>
              <Typography level='body-xs' sx={sx.repairCostBreakdown}>
                פערי Discovery/Engine שאינם חלק מ-Repair אוטומטי
              </Typography>
            </Box>

            <Box sx={sx.profileCountsGrid}>
              <ProfileCounts
                title='פרופילים חסרים לפי סוג'
                values={summary.missingProfilesById}
              />
              <ProfileCounts
                title='פרופילים מיותרים לפי סוג'
                values={summary.extraProfilesById}
              />
            </Box>
          </Box>
        ) : null}

        {!busy && audit && !issues.length ? (
          <Box sx={sx.successBox}>
            <Typography level='title-md' sx={sx.successTitle}>
              לא נמצאו פערים
            </Typography>
            <Typography level='body-sm'>
              החישוב לפי החוקים הנוכחיים תואם למסמכים הקיימים.
            </Typography>
          </Box>
        ) : null}

        {narrativeIssues.length ? (
          <Box sx={sx.issuesSection}>
            <Box sx={sx.issuesHeader}>
              <Typography level='title-sm' sx={sx.sectionTitle}>
                Narrative לבדיקה
              </Typography>
              <Typography level='body-xs' sx={sx.issueCount}>
                {narrativeIssues.length} מסמכים · ללא תיקון אוטומטי
              </Typography>
            </Box>

            <Stack spacing={0.5}>
              {narrativeIssues.slice(0, 20).map((issue, index) => (
                <Typography
                  key={`${issue.playerId}-${index}`}
                  level='body-xs'
                >
                  {clean(issue.fullName) || clean(issue.playerId) || '-'} · {joinValues(
                    issue.missingFields || issue.invalidTypes?.map(item => item.field)
                  )}
                </Typography>
              ))}
            </Stack>
          </Box>
        ) : null}

        {actionableIssues.length ? (
          <Box sx={sx.issuesSection}>
            <Box sx={sx.issuesHeader}>
              <Typography level='title-sm' sx={sx.sectionTitle}>
                פערים לתיקון
              </Typography>
              <Typography level='body-xs' sx={sx.issueCount}>
                מציג {visibleIssues.length} מתוך {actionableIssues.length}
              </Typography>
            </Box>

            <Box className='dpScrollThin' sx={sx.tableWrap}>
              <Table size='sm' stickyHeader sx={sx.table}>
                <thead>
                  <tr>
                    <th>שחקן</th>
                    <th>עונה</th>
                    <th>קבוצה</th>
                    <th>סוג</th>
                    <th>חסרים</th>
                    <th>פערים / מיותרים</th>
                    <th>מקור</th>
                  </tr>
                </thead>

                <tbody>
                  {visibleIssues.map((issue, index) => (
                    <tr key={`${issue.type}-${issue.playerId}-${issue.seasonId}-${index}`}>
                      <td>{clean(issue.fullName) || clean(issue.playerId) || '-'}</td>
                      <td>{clean(issue.seasonKey || issue.seasonId) || '-'}</td>
                      <td>{clean(issue.teamName) || '-'}</td>
                      <td>{ISSUE_LABELS[issue.type] || issue.type}</td>
                      <td>{joinValues(
                        issue.missingProfiles || issue.missingFields
                      )}</td>
                      <td>{joinValues(
                        issue.extraProfiles ||
                        issue.unexpectedFields ||
                        issue.mismatchedFields
                      )}</td>
                      <td>{clean(issue.source) || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Box>
          </Box>
        ) : null}
      </Box>
    </RegularModal>
  )
}
