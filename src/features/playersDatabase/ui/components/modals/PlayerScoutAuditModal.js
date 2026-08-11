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
              label='שורות שדולגו'
              value={summary.skippedRows || 0}
              tone={summary.skippedRows ? 'warning' : 'neutral'}
            />
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
                label='Search Index עם פער'
                value={previewSummary.searchIndexDocumentsWithDiff || 0}
              />
            </Box>

            <Typography level='body-xs' sx={sx.repairNote}>
              מסמכי שחקן חסרים הם מועמדים בלבד. יצירה תתבצע רק אם החישוב מחדש משאיר לשחקן Scout Profile.
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
                      <td>{joinValues(issue.missingProfiles)}</td>
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
