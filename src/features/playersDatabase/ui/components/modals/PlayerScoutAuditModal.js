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
  history_season_status_invalid: 'סטטוס עונת עבר לא תקין',
  player_schema_outdated: 'Schema שחקן דורש עדכון',
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
  partialAuditDefaults,
  onRunFull,
  onRunPartial,
  onDownload,
  onRepairPreview,
  onRepairApply,
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
  const visibleIssues = issues.slice(0, 250)
  const previewSummary = repairPreview?.summary || {}
  const auditCost = audit?.cost?.audit || {}
  const repairCost = repairPreview?.cost || {}
  const repairReads = repairCost.reads || {}
  const repairWrites = repairCost.writes || {}
  const repairAffected = repairCost.affected || {}
  const repairVerification = repairCost.verification || {}
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
          <Box sx={sx.summaryGrid}>
            <SummaryCard
              label='שורות שחושבו מחדש'
              value={summary.checkedTeamPlayerRows || 0}
            />
            <SummaryCard
              label='שחקנים עם פער'
              value={summary.rowsWithProfileDiff || 0}
              tone={summary.rowsWithProfileDiff ? 'danger' : 'success'}
            />
            <SummaryCard
              label='פרופילים חסרים'
              value={summary.missingProfilesCount || 0}
              tone={summary.missingProfilesCount ? 'danger' : 'success'}
            />
            <SummaryCard
              label='פרופילים מיותרים'
              value={summary.extraProfilesCount || 0}
              tone={summary.extraProfilesCount ? 'warning' : 'success'}
            />
            <SummaryCard
              label='פערי סנכרון'
              value={summary.syncIssuesCount || 0}
              tone={summary.syncIssuesCount ? 'warning' : 'success'}
            />
            <SummaryCard
              label='Schema לעדכון'
              value={summary.schemaIssuesCount || 0}
              tone={summary.schemaIssuesCount ? 'warning' : 'success'}
            />
            <SummaryCard
              label='Firestore reads באודיט'
              value={auditCost.reads?.total || 0}
            />
            <SummaryCard
              label='שורות שדולגו'
              value={summary.skippedRows || 0}
              tone={summary.skippedRows ? 'warning' : 'neutral'}
            />
          </Box>
        ) : null}

        {audit?.cost?.audit ? (
          <Typography level='body-xs' sx={sx.costNote}>
            מסמכים שנמצאו: קבוצות {auditCost.documentsObserved?.teamDocuments || 0} · dbPlayers {auditCost.documentsObserved?.playerDocuments || 0} · Player SearchIndex {auditCost.documentsObserved?.playerSearchIndexes || 0} · Team SearchIndex {auditCost.documentsObserved?.teamSearchIndexes || 0}. Player document lookups: {auditCost.documentsObserved?.playerDocumentLookups || 0}.
          </Typography>
        ) : null}

        {shadow ? (
          <Box sx={sx.shadowBox}>
            <Box sx={sx.shadowHeader}>
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
                label='מסמכי קבוצה'
                value={previewSummary.affectedTeamDocuments || 0}
              />
              <SummaryCard
                label='קבוצה-עונה'
                value={previewSummary.affectedTeamSeasonScopes || 0}
              />
              <SummaryCard
                label='dbPlayers חסרים לפני Repair'
                value={previewSummary.playerDocsMissingBeforeRepair || 0}
              />
              <SummaryCard
                label='dbPlayers קיימים עם פער'
                value={previewSummary.playerDocsExistingWithDiff || 0}
              />
              <SummaryCard
                label='Search Index חסר/עם פער'
                value={previewSummary.searchIndexDocumentsWithDiff || 0}
              />
              <SummaryCard
                label='Schema שחקן לעדכון'
                value={previewSummary.schemaIssues || 0}
              />
            </Box>

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
              {repairResult.playerDocumentsUpdated || 0} מסמכי שחקן עודכנו · {' '}
              {repairResult.searchIndexRowsUpdated || 0} אינדקסים עודכנו
            </Typography>
          </Box>
        ) : null}

        {audit ? (
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

        {issues.length ? (
          <Box sx={sx.issuesSection}>
            <Box sx={sx.issuesHeader}>
              <Typography level='title-sm' sx={sx.sectionTitle}>
                פערים שנמצאו
              </Typography>
              <Typography level='body-xs' sx={sx.issueCount}>
                מציג {visibleIssues.length} מתוך {issues.length}
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
                    <th>מיותרים</th>
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
                      <td>{joinValues(issue.extraProfiles)}</td>
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
