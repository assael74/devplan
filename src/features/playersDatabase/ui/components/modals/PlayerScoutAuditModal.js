// src/features/playersDatabase/ui/components/modals/PlayerScoutAuditModal.js

import * as React from 'react'
import {
  Box,
  Button,
  Chip,
  Stack,
  Table,
  Typography,
} from '@mui/joy'

import RegularModal from './RegularModal.js'
import { iconUi } from '../../../../../ui/core/icons/iconUi.js'
import { playerScoutAuditSx as sx } from './sx/playerScoutAudit.sx.js'
import {
  buildPlayerScoutCollectionHealth,
  buildPlayerScoutHealthSummary,
  getPlayerScoutIssueDefinition,
} from './playerScoutAuditHealth.model.js'

const clean = value => String(
  value === undefined || value === null ? '' : value
).trim()

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

function HealthKpiCard({ label, value, description, tone = 'neutral' }) {
  return (
    <Box sx={[sx.healthKpiCard, sx.summaryTone[tone]]}>
      <Box sx={sx.healthKpiTopRow}>
        <Typography level='title-sm' sx={sx.sectionTitle}>
          {label}
        </Typography>

        <Typography level='h2' sx={sx.healthKpiValue}>
          {value}
        </Typography>
      </Box>

      <Typography level='body-xs' sx={sx.healthKpiDescription}>
        {description}
      </Typography>
    </Box>
  )
}

function HealthIssueGroups({ groups }) {
  if (!groups.length) {
    return (
      <Box sx={sx.healthClearBox}>
        <Typography level='title-sm' sx={sx.sectionTitle}>
          לא נמצאו בעיות מערכת
        </Typography>
        <Typography level='body-sm' sx={sx.auditChoiceDescription}>
          לא נמצאו פערי סנכרון, מבנה או מצב מנוע שדורשים פעולה.
        </Typography>
      </Box>
    )
  }

  return (
    <Box sx={sx.healthFindingsSection}>
      <Typography level='title-md' sx={sx.sectionTitle}>
        מה נמצא?
      </Typography>

      <Stack spacing={0.75}>
        {groups.map(group => (
          <Box key={group.id} sx={sx.healthFindingGroup}>
            <Box sx={sx.healthFindingHeader}>
              <Box>
                <Typography level='title-sm' sx={sx.sectionTitle}>
                  {group.title}
                </Typography>
                <Typography level='body-xs' sx={sx.healthFindingDescription}>
                  {group.description}
                </Typography>
              </Box>

              <Chip size='sm' variant='soft' color={group.tone}>
                {group.count}
              </Chip>
            </Box>

            <Typography level='body-xs' sx={sx.healthFindingImpact}>
              אם לא מתקנים: {group.impact}
            </Typography>

            <Stack spacing={0.5}>
              {group.entries.slice(0, 5).map(item => (
                <Box key={item.type} sx={sx.healthFindingRow}>
                  <Box sx={sx.healthFindingCopy}>
                    <Typography level='body-sm' sx={sx.healthFindingTitle}>
                      {item.title}
                    </Typography>
                    <Typography level='body-xs' sx={sx.healthFindingDescription}>
                      {item.explanation}
                    </Typography>
                  </Box>

                  <Typography level='body-sm' sx={sx.healthFindingCount}>
                    {item.count}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Box>
        ))}
      </Stack>
    </Box>
  )
}

function CollectionHealthStatus({ items }) {
  return (
    <Box sx={sx.collectionHealthBox}>
      <Box>
        <Typography level='title-sm' sx={sx.sectionTitle}>
          מצב לפי אזור במערכת
        </Typography>
        <Typography level='body-xs' sx={sx.healthFindingDescription}>
          מציג באיזה חלק של המערכת נמצאו הבעיות. המספרים אינם מדד נוסף, אלא דרך לאתר את מקור הבעיה.
        </Typography>
      </Box>

      <Box sx={sx.collectionHealthGrid}>
        {items.map(item => (
          <Box key={item.id} sx={sx.collectionHealthRow}>
            <Box sx={sx.collectionHealthCopy}>
              <Typography level='body-sm' sx={sx.healthFindingTitle}>
                {item.title}
              </Typography>
              <Typography level='body-xs' sx={sx.healthFindingDescription}>
                {item.checked} מסמכים נבדקו
              </Typography>
            </Box>

            <Chip
              size='sm'
              variant='soft'
              color={item.issues ? 'warning' : 'success'}
            >
              {item.issues ? `${item.issues} בעיות` : 'תקין'}
            </Chip>
          </Box>
        ))}
      </Box>
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
  documentRewritePreview,
  documentRewriteResult,
  onRunFull,
  onDownload,
  onRepairPreview,
  onRepairApply,
  onEngineRefreshPreview,
  onEngineRefreshApply,
  onDocumentRewritePreview,
  onDocumentRewriteApply,
  onClose,
}) {
  const summary = audit?.summary || {}
  const issues = Array.isArray(audit?.issues)
    ? audit.issues
    : []
  const previewSummary = repairPreview?.summary || {}
  const enginePreviewSummary = engineRefreshPreview?.summary || {}
  const engineFieldCounts = enginePreviewSummary.fieldCounts || {}
  const rewriteSummary = documentRewritePreview?.summary || {}
  const rewriteCost = documentRewritePreview?.cost || {}
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
  const actionableIssues = issues.filter(issue => issue.repairable !== false)
  const visibleIssues = actionableIssues.slice(0, 250)
  const narrativeIssues = issues.filter(issue => (
    issue.type === 'player_narrative_schema_invalid'
  ))
  const schemaReportOnlyIssuesCount = Number(summary.schemaReportOnlyIssuesCount || 0)
  const health = buildPlayerScoutHealthSummary({ issues, summary })
  const collectionHealth = buildPlayerScoutCollectionHealth({ issues, auditCost })
  const needsVerification = !!(
    repairResult || engineRefreshResult || documentRewriteResult
  )
  const quietDetails = [
    `פערי מדידה ${summary.measurementIssuesCount || 0}`,
    `פערי מעקב שחקנים ${summary.trackingIssuesCount || 0}`,
    `פערי אינדקס חיפוש ${summary.projectionIssuesCount || 0}`,
    `פערי מצב מנוע ${summary.stateIssuesCount || 0}`,
    `פערי פרופיל ${summary.rowsWithProfileDiff || 0}`,
    `קריאות למסד הנתונים ${auditCost.reads?.total || 0}`,
  ].join(' · ')


  let primaryAction = {
    label: audit ? 'הרץ בדיקה מחדש' : 'הרץ בדיקת מערכת',
    description: 'בדיקה מלאה של הקבוצות, מסמכי השחקנים והאינדקסים.',
    onClick: onRunFull,
    color: 'primary',
  }

  if (needsVerification) {
    primaryAction = {
      label: 'אמת את התיקון',
      description: 'הפעולה האחרונה הסתיימה. הרץ בדיקה מלאה כדי לוודא שלא נשארו פערים.',
      onClick: onRunFull,
      color: 'primary',
    }
  } else if (repairPreview && health.repairableCount) {
    primaryAction = {
      label: 'בצע את התיקון המוצע',
      description: 'התיקון יטפל רק בפערים שהבדיקה סימנה כניתנים לתיקון אוטומטי.',
      onClick: onRepairApply,
      color: 'warning',
    }
  } else if (health.repairableCount) {
    primaryAction = {
      label: 'הצג תיקון מוצע',
      description: 'לפני כתיבה תוצג רשימת היעדים והערכת העלות.',
      onClick: onRepairPreview,
      color: 'warning',
    }
  } else if (engineRefreshPreview && health.engineCount) {
    primaryAction = {
      label: 'רענן את מצב המנוע',
      description: 'יעודכנו רק שדות מצב הסקאוטינג שהבדיקה זיהתה כמיושנים.',
      onClick: onEngineRefreshApply,
      color: 'primary',
    }
  } else if (health.engineCount) {
    primaryAction = {
      label: 'בדוק תיקון מצב מנוע',
      description: 'תוצג תצוגה מקדימה לפני כל כתיבה.',
      onClick: onEngineRefreshPreview,
      color: 'primary',
    }
  }

  return (
    <RegularModal
      open={open}
      title='בדיקת תקינות סקאוטינג'
      description='בדיקה שוטפת שמוודאת שהמידע מסונכרן, שמבנה הנתונים תקין ושמצב הסקאוטינג מעודכן.'
      iconId='search'
      size='xl'
      busy={busy}
      hideFooter
      contentSx={sx.modalContent}
      onClose={onClose}
    >
      <Box sx={sx.content}>
        {!audit ? (
          <Box sx={sx.healthStartBox}>
            <Box sx={sx.healthStartCopy}>
              <Typography level='title-md' sx={sx.sectionTitle}>
                בדיקת מערכת מלאה
              </Typography>
              <Typography level='body-sm' sx={sx.auditChoiceDescription}>
                הבדיקה משווה בין מסמכי הקבוצות, מסמכי השחקנים ואינדקס החיפוש, ומסבירה מה לא תקין ומה נדרש לעשות. הבדיקה עצמה אינה משנה נתונים.
              </Typography>
            </Box>

            <Button
              variant='solid'
              color='primary'
              loading={busy}
              disabled={busy || repairBusy}
              startDecorator={!busy ? iconUi({ id: 'search', size: 'sm' }) : null}
              onClick={onRunFull}
            >
              הרץ בדיקת מערכת
            </Button>
          </Box>
        ) : null}

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
                  מצב המערכת
                </Typography>
                <Typography level='body-sm' sx={sx.auditChoiceDescription}>
                  {health.isHealthy
                    ? 'הבדיקה לא מצאה בעיה שדורשת פעולה.'
                    : `נמצאו ${health.attentionCount} בעיות שדורשות בדיקה או תיקון.`}
                </Typography>
              </Box>

              <Chip
                size='sm'
                variant='soft'
                color={health.isHealthy ? 'success' : 'warning'}
              >
                {health.isHealthy ? 'המערכת תקינה' : 'נדרש טיפול'}
              </Chip>
            </Box>

            <Box sx={sx.summaryGrid}>
              <HealthKpiCard
                label='דורש טיפול'
                value={health.attentionCount}
                description='כל הבעיות שהמערכת יודעת לתקן או שדורשות חישוב מחדש של מצב הסקאוטינג.'
                tone={health.attentionCount ? 'warning' : 'success'}
              />
              <HealthKpiCard
                label='בעיות סנכרון'
                value={health.syncCount}
                description='אותו מידע אינו תואם בין מסמך הקבוצה, מסמך השחקן או אינדקס החיפוש.'
                tone={health.syncCount ? 'warning' : 'success'}
              />
              <HealthKpiCard
                label='בעיות מבנה'
                value={health.schemaCount}
                description='מסמך חסר שדה נדרש או שמבנה הנתונים שלו אינו תואם למבנה הנוכחי.'
                tone={health.schemaCount ? 'warning' : 'success'}
              />
            </Box>

            <Box sx={sx.primaryActionBox}>
              <Box sx={sx.primaryActionCopy}>
                <Typography level='title-sm' sx={sx.sectionTitle}>
                  הפעולה המומלצת עכשיו
                </Typography>
                <Typography level='body-xs' sx={sx.auditChoiceDescription}>
                  {primaryAction.description}
                </Typography>
              </Box>

              <Button
                variant='solid'
                color={primaryAction.color}
                loading={busy || repairBusy}
                disabled={busy || repairBusy}
                onClick={primaryAction.onClick}
              >
                {primaryAction.label}
              </Button>
            </Box>

            <HealthIssueGroups groups={health.groups} />

            <CollectionHealthStatus items={collectionHealth} />

            <Typography level='body-xs' sx={sx.costNote}>
              פירוט הבדיקה: {quietDetails} · מידע לבדיקה בלבד {schemaReportOnlyIssuesCount}
            </Typography>
          </Box>
        ) : null}

        {audit?.cost?.audit ? (
          <Typography level='body-xs' sx={sx.costNote}>
            מסמכים שנבדקו: קבוצות {auditCost.documentsObserved?.teamDocuments || 0} · שחקנים {auditCost.documentsObserved?.playerDocuments || 0} · אינדקס שחקנים {auditCost.documentsObserved?.playerSearchIndexes || 0} · אינדקס קבוצות {auditCost.documentsObserved?.teamSearchIndexes || 0} · בדיקות התאמה למסמכי שחקן {auditCost.documentsObserved?.playerDocumentLookups || 0}.
          </Typography>
        ) : null}

        <Box component='details' sx={sx.advancedToolsBox}>
          <Box component='summary' sx={sx.detailsSummary}>
            <Box>
              <Typography level='title-sm' sx={sx.sectionTitle}>
                כלים מתקדמים
              </Typography>
              <Typography level='body-xs' sx={sx.repairCostBreakdown}>
                הורדת נתוני הבדיקה וכלים מיוחדים לשינוי מבנה המערכת. בדרך כלל אין צורך להשתמש בהם.
              </Typography>
            </Box>
          </Box>

          <Box sx={sx.advancedToolsGrid}>
            <Box sx={sx.advancedToolCard}>
              <Typography level='title-sm' sx={sx.sectionTitle}>
                נתוני הבדיקה
              </Typography>
              <Typography level='body-xs' sx={sx.auditChoiceDescription}>
                הורד את תוצאת הבדיקה המלאה לצורך בדיקה טכנית או תיעוד.
              </Typography>

              <Button
                size='sm'
                variant='outlined'
                color='neutral'
                disabled={!audit || busy || repairBusy}
                startDecorator={iconUi({ id: 'download', size: 'sm' })}
                onClick={onDownload}
              >
                הורד נתוני בדיקה
              </Button>
            </Box>

            <Box sx={sx.advancedToolCard}>
              <Typography level='title-sm' sx={sx.sectionTitle}>
                מיגרציה ושכתוב מסמכים
              </Typography>
              <Typography level='body-xs' sx={sx.auditChoiceDescription}>
                כלי מיוחד לשינוי מבנה מסמכים. אינו חלק מתחזוקה שוטפת.
              </Typography>

              <Button
                size='sm'
                variant={documentRewritePreview ? 'solid' : 'outlined'}
                color='warning'
                loading={repairBusy}
                disabled={!audit || busy || repairBusy}
                onClick={documentRewritePreview
                  ? onDocumentRewriteApply
                  : onDocumentRewritePreview}
              >
                {documentRewritePreview ? 'בצע שכתוב מסמכים' : 'הצג שכתוב מוצע'}
              </Button>
            </Box>
          </Box>
        </Box>

        {audit?.cost?.runtime ? (
          <Box component='details' sx={sx.detailsBox}>
            <Box component='summary' sx={sx.detailsSummary}>
              <Typography level='title-sm' sx={sx.sectionTitle}>
                בדיקת עלויות פעולות
              </Typography>
              <Typography level='body-xs' sx={sx.repairCostBreakdown}>
                הערכת מספר הקריאות והכתיבות שפעולות שונות עשויות לבצע
              </Typography>
            </Box>

            <Typography level='body-xs' sx={sx.repairCostBreakdown}>
              האומדן משתמש רק במסמכים שכבר נקראו בבדיקה ואינו מבצע קריאות נוספות למסד הנתונים רק לצורך ההערכה.
            </Typography>

            <Box sx={sx.repairCostGrid}>
              <SummaryCard
                label='טעינת סטטיסטיקה מלאה · קריאות מינימום'
                value={runtimeFlows.fullStatsLoad?.readsMinimum || 0}
              />
              <SummaryCard
                label='טעינת סטטיסטיקה מלאה · כתיבות מקסימום'
                value={runtimeFlows.fullStatsLoad?.writesMaximum || 0}
                tone={runtimeFlows.fullStatsLoad?.writesMaximum ? 'warning' : 'success'}
              />
              <SummaryCard
                label='עדכון הקשר קבוצה · קריאות מינימום'
                value={runtimeFlows.teamContextUpdate?.readsMinimum || 0}
              />
              <SummaryCard
                label='עדכון הקשר קבוצה · כתיבות מקסימום'
                value={runtimeFlows.teamContextUpdate?.writesMaximum || 0}
                tone={runtimeFlows.teamContextUpdate?.writesMaximum ? 'warning' : 'success'}
              />
              <SummaryCard
                label='עריכת תפקיד · קריאות/כתיבות'
                value={`${runtimeFlows.roleEdit?.readsTypical || 0}/${runtimeFlows.roleEdit?.writesTypical || 0}`}
              />
              <SummaryCard
                label='עדכון אימות · קריאות/כתיבות'
                value={`${runtimeFlows.verificationUpdate?.readsTypical || 0}/${runtimeFlows.verificationUpdate?.writesTypical || 0}`}
              />
              <SummaryCard
                label='שינוי פרופיל ידני · קריאות/כתיבות'
                value={`${runtimeFlows.manualProfileMutation?.readsTypical || 0}/${runtimeFlows.manualProfileMutation?.writesTypical || 0}`}
              />
              <SummaryCard
                label='פתיחת סיפור · קריאות'
                value={`0-${runtimeFlows.storyOpen?.readsMaximum || 0}`}
              />
            </Box>

            <Typography level='body-xs' sx={sx.repairCostBreakdown}>
              טעינת סטטיסטיקה מלאה אינה כוללת באומדן את עלות התאמת זהויות השחקנים, שמשתנה לפי המקרה. חיפושים באינדקס ברמת מועדון מוצגים כמינימום בלבד.
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
                  המנוע החדש פעיל — השוואה מול המנוע הישן
                </Typography>
                <Typography level='body-xs' sx={sx.shadowNote}>
                  בדיקה בלבד, ללא שינוי נתונים וללא קריאות נוספות למסד הנתונים. השוואת השיפור בין שתי טעינות הסטטיסטיקה האחרונות עדיין אינה נכללת בבדיקה הזו.
                </Typography>
              </Box>

              <Chip size='sm' variant='soft' color='primary'>
                {shadow.engineVersion || 'scouting-v2-shadow'}
              </Chip>
            </Box>

            <Box sx={sx.shadowSummaryGrid}>
              <SummaryCard
                label='המנוע הישן עם פרופיל'
                value={shadowSummary.v1ProfiledPlayers || 0}
              />
              <SummaryCard
                label='המנוע החדש עם פרופיל'
                value={shadowSummary.v2ProfiledPlayers || 0}
              />
              <SummaryCard
                label='שחקנים שהשתנו'
                value={shadowSummary.changedProfilePlayers || 0}
                tone={shadowSummary.changedProfilePlayers ? 'warning' : 'success'}
              />
              <SummaryCard
                label='נוסף במנוע החדש'
                value={shadowSummary.v2AddedProfilePlayers || 0}
              />
              <SummaryCard
                label='קיים רק במנוע הישן'
                value={shadowSummary.v2RemovedProfilePlayers || 0}
                tone={shadowSummary.v2RemovedProfilePlayers ? 'warning' : 'success'}
              />
              <SummaryCard
                label='קרוב לפרופיל'
                value={shadowSummary.nearProfilePlayers || 0}
              />
              <SummaryCard
                label='הבדיקה הבאה המומלצת'
                value={shadowSummary.playersWithNextBestCheck || 0}
              />
              <SummaryCard
                label='בעיות במבנה הנתונים'
                value={shadowSummary.contractIssuePlayers || 0}
                tone={shadowSummary.contractIssuePlayers ? 'danger' : 'success'}
              />
            </Box>

            <Box sx={sx.profileCountsGrid}>
              <ProfileCounts
                title='פרופילים שנוספו במנוע החדש'
                values={shadowSummary.addedProfilesById}
              />
              <ProfileCounts
                title='פרופילים שקיימים רק במנוע הישן'
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
                      <th>מנוע ישן</th>
                      <th>מנוע חדש</th>
                      <th>פרופיל ראשי</th>
                      <th>קרוב לפרופיל</th>
                      <th>מידיות</th>
                      <th>הקשר</th>
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
                לא נמצאו שינויי פרופיל בין המנוע הישן למנוע החדש בתחום שנבדק.
              </Typography>
            )}
          </Box>
        ) : null}

        {engineRefreshPreview ? (
          <Box sx={sx.repairBox}>
            <Box sx={sx.repairHeader}>
              <Typography level='title-sm' sx={sx.sectionTitle}>
                תצוגה מקדימה לרענון מצב המנוע
              </Typography>
              <Chip size='sm' color='primary' variant='soft'>
                אימותי הסקאוט נשמרים
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
                label='קריאות מקסימום'
                value={engineRefreshPreview.cost?.readsMaximum || 0}
              />
              <SummaryCard
                label='כתיבות מקסימום'
                value={engineRefreshPreview.cost?.writesMaximum || 0}
              />
            </Box>

            <ProfileCounts
              title='שדות מצב מנוע לעדכון'
              values={engineFieldCounts}
            />

            <Typography level='body-xs' sx={sx.costNote}>
              מתעדכנים רק השדות שהמנוע מחשב. לא נוגעים באימותים ידניים, בפרופילים ידניים או באינדקס החיפוש. לאחר הכתיבה לא רצה בדיקת אימות אוטומטית כדי לחסוך קריאות.
            </Typography>
          </Box>
        ) : null}

        {engineRefreshResult ? (
          <Box sx={sx.repairBox}>
            <Typography level='title-sm' sx={sx.sectionTitle}>
              רענון מצב המנוע הושלם
            </Typography>

            <Typography level='body-sm'>
              {engineRefreshResult.playerDocumentsUpdated || 0} מסמכי שחקן עודכנו · {engineRefreshResult.playerSeasonsUpdated || 0} עונות עודכנו · {engineRefreshResult.skippedDocuments || 0} מסמכים דולגו.
            </Typography>
          </Box>
        ) : null}

        {documentRewritePreview ? (
          <Box sx={sx.repairBox}>
            <Box sx={sx.repairHeader}>
              <Typography level='title-sm' sx={sx.sectionTitle}>
                תצוגה מקדימה לשכתוב מסמכים
              </Typography>
              <Chip size='sm' color='warning' variant='soft'>
                ללא קריאות נוספות בזמן הכתיבה
              </Chip>
            </Box>

            <Box sx={sx.repairGrid}>
              <SummaryCard
                label='מסמכים לשכתוב'
                value={rewriteSummary.documentsToRewrite || 0}
              />
              <SummaryCard
                label='דולגו מטעמי בטיחות'
                value={rewriteSummary.documentsSkippedForSafety || 0}
                tone={rewriteSummary.documentsSkippedForSafety ? 'warning' : 'success'}
              />
              <SummaryCard
                label='מסמכי קבוצה'
                value={rewriteSummary.teamDocuments || 0}
              />
              <SummaryCard
                label='מסמכי שחקן'
                value={rewriteSummary.playerDocuments || 0}
              />
              <SummaryCard
                label='אינדקס שחקנים'
                value={rewriteSummary.playerSearchIndexes || 0}
              />
              <SummaryCard
                label='אינדקס קבוצות'
                value={rewriteSummary.teamSearchIndexes || 0}
              />
              <SummaryCard
                label='שדות להוספה'
                value={rewriteSummary.fieldsAdded || 0}
              />
              <SummaryCard
                label='שדות להסרה'
                value={rewriteSummary.fieldsRemoved || 0}
                tone={rewriteSummary.fieldsRemoved ? 'warning' : 'success'}
              />
              <SummaryCard
                label='כתיבות'
                value={rewriteCost.writesMaximum || 0}
                tone={rewriteCost.writesMaximum ? 'warning' : 'success'}
              />
            </Box>

            <Typography level='body-xs' sx={sx.costNote}>
              השכתוב משתמש במסמכים שכבר נקראו בבדיקה. בזמן הביצוע צפויות {rewriteCost.reads || 0} קריאות ועד {rewriteCost.writesMaximum || 0} כתיבות, המחולקות ל-{rewriteCost.batches || 0} קבוצות כתיבה. כל מסמך מוחלף לפי מבנה הנתונים המרכזי: שדות חסרים מתווספים, שדות ישנים מוסרים ומצב הסקאוטינג מחושב מחדש כאשר יש מספיק מידע. מסמכים שאין להם התאמה חד-משמעית מדולגים ואינם נכתבים.
            </Typography>

            <Typography level='body-xs' sx={sx.repairNote}>
              לא רצה בדיקת אימות אוטומטית לאחר השכתוב כדי לחסוך קריאות. כאשר רוצים לאמת את התוצאה, יש להריץ בדיקת מערכת מלאה מחדש.
            </Typography>
          </Box>
        ) : null}

        {documentRewriteResult ? (
          <Box sx={sx.repairResultBox}>
            <Typography level='title-sm' sx={sx.sectionTitle}>
              שכתוב המסמכים הושלם
            </Typography>
            <Typography level='body-sm'>
              {documentRewriteResult.writesPerformed || 0} מסמכים שוכתבו ב-{documentRewriteResult.batchesCommitted || 0} קבוצות כתיבה · קריאות נוספות: {documentRewriteResult.readsPerformed || 0}.
            </Typography>
          </Box>
        ) : null}

        {repairPreview ? (
          <Box sx={sx.repairBox}>
            <Box sx={sx.repairHeader}>
              <Typography level='title-sm' sx={sx.sectionTitle}>
                תצוגה מקדימה לתיקון
              </Typography>
              <Chip size='sm' color='warning' variant='soft'>
                עדיין לא בוצעו כתיבות
              </Chip>
            </Box>

            <Box sx={sx.repairGrid}>
              <SummaryCard
                label='תחומי קבוצה ועונה לתיקון'
                value={previewSummary.affectedTeamSeasonScopes || 0}
              />
              <SummaryCard
                label='מסמכי קבוצה'
                value={previewSummary.affectedTeamDocuments || 0}
              />
              <SummaryCard
                label='מסמכי שחקן ליצור'
                value={previewSummary.playerDocsMissingBeforeRepair || 0}
              />
              <SummaryCard
                label='מסמכי שחקן לסנכרן'
                value={previewSummary.playerDocsExistingWithDiff || 0}
              />
              <SummaryCard
                label='אינדקס חיפוש'
                value={previewSummary.searchIndexDocumentsWithDiff || 0}
              />
              <SummaryCard
                label='מבנה מסמך לתיקון'
                value={previewSummary.schemaIssues || 0}
              />
            </Box>

            <Typography level='body-xs' sx={sx.costNote}>
              לא לתיקון אוטומטי: בעיות מבנה לדיווח בלבד {previewSummary.nonRepairableSchemaIssues || 0} · מצב מנוע {previewSummary.stateIssues || 0} · מדידות {previewSummary.measurementIssues || 0} · מעקב שחקנים {previewSummary.trackingIssues || 0} · אינדקס חיפוש {previewSummary.projectionIssues || 0}
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
                עלות משוערת לביצוע התיקון
              </Typography>

              <Box sx={sx.repairCostGrid}>
                <SummaryCard
                  label={repairReads.processEstimateIsMinimum
                    ? 'קריאות מינימום לתהליך'
                    : 'קריאות לכל התהליך'}
                  value={repairReads.processEstimateIsMinimum
                    ? `לפחות ${repairReads.processEstimatedMin || 0}`
                    : `${repairReads.processEstimatedMin || 0}-${repairReads.processEstimatedMax || 0}`}
                />
                <SummaryCard
                  label='כתיבות מקסימום'
                  value={repairWrites.estimatedMax || 0}
                  tone={repairWrites.estimatedMax ? 'warning' : 'success'}
                />
                <SummaryCard
                  label='פעולות שחקן'
                  value={repairAffected.playerOperations || 0}
                />
                <SummaryCard
                  label='מסמכי מבנה'
                  value={repairAffected.schemaPlayerDocuments || 0}
                />
              </Box>

              <Typography level='body-xs' sx={sx.repairCostBreakdown}>
                קריאות בזמן התיקון: {repairReads.applyEstimateIsMinimum ? 'לפחות ' : ''}{repairReads.applyEstimated || 0} · קריאות לבדיקת אימות: {repairVerification.runsAutomatically
                  ? `${repairReads.verificationEstimatedMin || 0}-${repairReads.verificationEstimatedMax || 0}`
                  : 'לא רץ אוטומטית'}
              </Typography>

              <Typography level='body-xs' sx={sx.repairCostBreakdown}>
                פירוט הקריאות: קבוצה {repairReads.teamDocuments || 0} · שחקנים {repairReads.playerDocuments || 0} · מבנה {repairReads.schemaPlayerDocuments || 0} · אינדקס חיפוש {repairReads.searchIndexEstimateExact ? '' : 'לפחות '}{repairReads.searchIndexes || 0}
              </Typography>

              <Typography level='body-xs' sx={sx.repairCostBreakdown}>
                כתיבות מקסימום: קבוצה {repairWrites.teamDocuments || 0} · שחקנים {repairWrites.playerDocumentsMax || 0} · מבנה {repairWrites.schemaPlayerDocumentsMax || 0} · אינדקס חיפוש {repairWrites.searchIndexesMax || 0}
              </Typography>
            </Box>

            <Typography level='body-xs' sx={sx.repairNote}>
              מסמכי שחקן חסרים הם מועמדים בלבד. יצירה תתבצע רק אם החישוב מחדש משאיר לשחקן פרופיל סקאוטינג. {repairReads.searchIndexEstimateExact === false
                ? 'לפחות אחד מחיפושי אינדקס החיפוש בזמן התיקון פועל ברמת מועדון. לכן מספר הקריאות המוצג הוא מינימום בלבד; המערכת לא מבצעת קריאה נוספת לכל המועדון רק כדי לחשב אומדן עלות.'
                : 'אומדן אינדקס החיפוש תואם להיקף שנצפה בבדיקה.'} {repairAffected.schemaOnlyRepair
                ? 'בתיקון שמכיל רק בעיות מבנה לא רצה בדיקת אימות אוטומטית לאחר הביצוע.'
                : ''}
            </Typography>
          </Box>
        ) : null}

        {repairResult ? (
          <Box sx={sx.repairResultBox}>
            <Typography level='title-sm' sx={sx.sectionTitle}>
              התיקון הושלם
            </Typography>
            <Typography level='body-sm'>
              {repairResult.teamDocumentsUpdated || 0} מסמכי קבוצה עודכנו · {' '}
              {repairResult.playerDocumentsCreated || 0} מסמכי שחקן נוצרו · {' '}
              {repairResult.playerDocumentsUpdated || 0} מסמכי שחקן סונכרנו · {' '}
              {repairResult.playerSchemaDocumentsUpdated || 0} מסמכי שחקן תוקנו במבנה המסמך · {' '}
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
                פערי גילוי ומנוע שאינם חלק מתיקון אוטומטי
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

        {narrativeIssues.length ? (
          <Box component='details' sx={sx.detailsBox}>
            <Box component='summary' sx={sx.issuesHeader}>
              <Typography level='title-sm' sx={sx.sectionTitle}>
                סיפורי שחקן לבדיקה
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
          <Box component='details' sx={sx.detailsBox}>
            <Box component='summary' sx={sx.issuesHeader}>
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
                      <td>{getPlayerScoutIssueDefinition(issue.type).title}</td>
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
