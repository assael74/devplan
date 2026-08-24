// src/features/playersDatabase/ui/components/modals/PlayerScoutAuditModal.js

import * as React from 'react'
import {
  Box,
  Button,
  Checkbox,
  Chip,
  Input,
  IconButton,
  Stack,
  Table,
  Tooltip,
  Typography,
} from '@mui/joy'

import RegularModal from './RegularModal.js'
import exportDataTableRowsToXlsx from '../tables/dataTable/dataTable.export.js'
import { buildPlayerScoutSafeClassClosurePlan } from '../../../services/audit/playerScoutSafeClassClosurePlan.js'
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

const REGULAR_DEFAULT_BATCH_DOCUMENTS = 25
const MIGRATION_DEFAULT_BATCH_DOCUMENTS = 25
const ENGINE_DEFAULT_BATCH_DOCUMENTS = 10

const joinValues = values => (
  Array.isArray(values) && values.length
    ? values.join(', ')
    : '-'
)

const formatMissingPlayerDocumentReason = issue => {
  if (issue?.type !== 'missing_player_document') return ''

  const reasons = Array.isArray(issue.computedTrackingReasons)
    ? issue.computedTrackingReasons
    : Array.isArray(issue.expectedTrackingReasons)
      ? issue.expectedTrackingReasons
      : []

  return joinValues(reasons.map(clean).filter(Boolean))
}

const formatMissingPlayerDocumentProfiles = issue => {
  if (issue?.type !== 'missing_player_document') return ''

  const profileDetails = Array.isArray(issue.scoutProfileDetails)
    ? issue.scoutProfileDetails
    : []
  const profileLabels = profileDetails
    .map(profile => clean(profile.profileLabel || profile.profileId))
    .filter(Boolean)
  const profileIds = Array.isArray(issue.professionalProfileIds) &&
    issue.professionalProfileIds.length
    ? issue.professionalProfileIds
    : issue.scoutProfileIds

  return joinValues(
    profileLabels.length
      ? profileLabels
      : (Array.isArray(profileIds) ? profileIds.map(clean).filter(Boolean) : [])
  )
}

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
          לא נמצאו פערי סנכרון, מבנה או מצב סקאוטינג שדורשים פעולה.
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
        <Typography level='title-md' sx={sx.sectionTitle}>
          מצב לפי אוסף נתונים
        </Typography>
        <Typography level='body-xs' sx={sx.healthFindingDescription}>
          בכל אוסף מוצגים מספר המסמכים שנבדקו, כמה מהם תואמים בדיוק למצב הצפוי ומה דורש יישור.
        </Typography>
      </Box>

      <Box sx={sx.collectionHealthGrid}>
        {items.map(item => (
          <Box key={item.id} sx={sx.collectionHealthCard}>
            <Box sx={sx.collectionHealthHeader}>
              <Box sx={sx.collectionHealthCopy}>
                <Typography level='title-sm' sx={sx.healthFindingTitle}>
                  {item.title}
                </Typography>
                <Typography level='body-xs' sx={sx.collectionName}>
                  {item.collectionName}
                </Typography>
              </Box>

              <Chip
                size='sm'
                variant='soft'
                color={item.affected || item.missing ? 'warning' : 'success'}
              >
                {item.exactRate}% תואם
              </Chip>
            </Box>

            <Box sx={sx.collectionMetricGrid}>
              <Box sx={sx.collectionMetric}>
                <Typography level='body-xs' sx={sx.summaryLabel}>
                  נבדקו
                </Typography>
                <Typography level='title-md' sx={sx.collectionMetricValue}>
                  {item.checked}
                </Typography>
              </Box>
              <Box sx={sx.collectionMetric}>
                <Typography level='body-xs' sx={sx.summaryLabel}>
                  תואמים בדיוק
                </Typography>
                <Typography level='title-md' sx={sx.collectionMetricValue}>
                  {item.exact}
                </Typography>
              </Box>
              <Box sx={sx.collectionMetric}>
                <Typography level='body-xs' sx={sx.summaryLabel}>
                  דורשים יישור
                </Typography>
                <Typography level='title-md' sx={sx.collectionMetricValue}>
                  {item.affected}
                </Typography>
              </Box>
              <Box sx={sx.collectionMetric}>
                <Typography level='body-xs' sx={sx.summaryLabel}>
                  חסרים
                </Typography>
                <Typography level='title-md' sx={sx.collectionMetricValue}>
                  {item.missing}
                </Typography>
              </Box>
            </Box>

            {item.issueEntries.length ? (
              <Stack spacing={0.4}>
                {item.issueEntries.slice(0, 4).map(entry => (
                  <Box key={entry.type} sx={sx.collectionIssueRow}>
                    <Typography level='body-xs' sx={sx.healthFindingDescription}>
                      {entry.title}
                    </Typography>
                    <Typography level='body-xs' sx={sx.healthFindingCount}>
                      {entry.count}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            ) : (
              <Typography level='body-xs' color='success'>
                לא נמצאו חריגות באוסף הזה.
              </Typography>
            )}
          </Box>
        ))}
      </Box>
    </Box>
  )
}


function DataHealthOverview({ health, collectionHealth, scopeLabel }) {
  return (
    <Box sx={sx.dataHealthOverview}>
      <Box sx={sx.dataHealthHeader}>
        <Box>
          <Typography level='title-lg' sx={sx.sectionTitle}>
            מצב הדאטה
          </Typography>
          <Typography level='body-sm' sx={sx.auditChoiceDescription}>
            {scopeLabel}. התאמה מלאה פירושה שהמסמך שנבדק תואם למצב שהמערכת מצפה לקבל ממנו.
          </Typography>
        </Box>

        <Chip
          size='lg'
          variant='soft'
          color={health.isHealthy ? 'success' : 'warning'}
        >
          {health.exactRate}% תואם
        </Chip>
      </Box>

      <Box sx={sx.dataHealthSummaryGrid}>
        <HealthKpiCard
          label='תואמים בדיוק'
          value={health.exactDocuments}
          description={`מתוך ${health.checkedDocuments} מסמכים שנבדקו.`}
          tone='success'
        />
        <HealthKpiCard
          label='דורשים יישור'
          value={health.affectedDocuments}
          description='מסמכים קיימים שנמצא בהם לפחות פער אחד מול המצב הצפוי.'
          tone={health.affectedDocuments ? 'warning' : 'success'}
        />
        <HealthKpiCard
          label='מסמכים חסרים'
          value={health.missingDocuments}
          description='מסמכים שהבדיקה קבעה שאמורים להתקיים אך לא נמצאו.'
          tone={health.missingDocuments ? 'danger' : 'success'}
        />
        <HealthKpiCard
          label='דורש בדיקה'
          value={health.reviewCount}
          description='חריגות שהמערכת זיהתה אך אינה מסווגת כרגע לתיקון אוטומטי בטוח.'
          tone={health.reviewCount ? 'warning' : 'success'}
        />
      </Box>

      <CollectionHealthStatus items={collectionHealth} />
      <HealthIssueGroups groups={health.groups} />
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

const numberOf = value => Number(value || 0)

const GLOBAL_SAFE_REPAIR_CLASS_LABELS = {
  directRepair: 'תיקון ישיר',
  engineRefresh: 'רענון מצב סקאוטינג',
  migration: 'מיגרציה',
  regularRepair: 'תיקון רגיל',
}

const isSafeGlobalRepairClass = repairClass => (
  ['directRepair', 'engineRefresh', 'migration', 'regularRepair'].includes(clean(repairClass))
)

const buildGlobalTargetIssueEntries = ({ target, issueMap, repairClass } = {}) => {
  const entriesByIssueId = new Map()

  ;(Array.isArray(target?.rowTargets) ? target.rowTargets : []).forEach(rowTarget => {
    const issueId = clean(rowTarget?.issueId)
    if (!issueId) return

    entriesByIssueId.set(issueId, {
      issueId,
      repairClass: clean(rowTarget?.repairClass || repairClass),
      issueType: clean(rowTarget?.type || issueMap.get(issueId)?.type),
      issue: issueMap.get(issueId),
    })
  })

  ;(Array.isArray(target?.issueIds) ? target.issueIds : []).forEach(rawIssueId => {
    const issueId = clean(rawIssueId)
    if (!issueId || entriesByIssueId.has(issueId)) return

    const issue = issueMap.get(issueId)
    entriesByIssueId.set(issueId, {
      issueId,
      repairClass: clean(repairClass),
      issueType: clean(issue?.type),
      issue,
    })
  })

  return [...entriesByIssueId.values()]
}

const buildGlobalSafeRepairGroups = ({
  preview,
  globalAudit,
} = {}) => {
  const issueMap = new Map(
    (Array.isArray(globalAudit?.issues) ? globalAudit.issues : [])
      .filter(issue => clean(issue?.issueId))
      .map(issue => [clean(issue.issueId), issue])
  )
  const targets = [
    ...(Array.isArray(preview?.targetDocuments?.teams)
      ? preview.targetDocuments.teams
      : []),
    ...(Array.isArray(preview?.targetDocuments?.players)
      ? preview.targetDocuments.players
      : []),
    ...(Array.isArray(preview?.targetDocuments?.searchIndexes)
      ? preview.targetDocuments.searchIndexes
      : []),
  ]
  const groupsByKey = new Map()

  targets.forEach(target => {
    const repairClasses = Array.isArray(target?.repairClasses)
      ? target.repairClasses.map(clean).filter(Boolean)
      : []

    if (repairClasses.length !== 1 || !isSafeGlobalRepairClass(repairClasses[0])) {
      return
    }

    const repairClass = repairClasses[0]
    const documentId = clean(target?.documentId)

    buildGlobalTargetIssueEntries({ target, issueMap, repairClass }).forEach(entry => {
      const issueId = clean(entry.issueId)
      const issue = entry.issue
      const allowNonSelectableEngineRefresh = repairClass === 'engineRefresh'

      if (
        !issueId ||
        (!allowNonSelectableEngineRefresh && (
          issue?.repairable === false ||
          issue?.selectable === false
        ))
      ) {
        return
      }

      const issueType = clean(entry.issueType || issue?.type)
      const groupIssueType = issueType || `__${repairClass}`
      const key = `${repairClass}::${groupIssueType}`
      const title = issueType
        ? getPlayerScoutIssueDefinition(issueType).title || issueType
        : `${GLOBAL_SAFE_REPAIR_CLASS_LABELS[repairClass] || repairClass} בטוח`
      const current = groupsByKey.get(key) || {
        id: key,
        repairClass,
        issueType: groupIssueType,
        title,
        issueIds: new Set(),
        documentIds: new Set(),
      }

      current.issueIds.add(issueId)
      if (documentId) current.documentIds.add(documentId)
      groupsByKey.set(key, current)
    })
  })

  return [...groupsByKey.values()]
    .map(group => ({
      ...group,
      issueIds: [...group.issueIds],
      documentsCount: group.documentIds.size,
    }))
    .sort((a, b) => (
      `${a.repairClass}:${a.title}`.localeCompare(`${b.repairClass}:${b.title}`)
    ))
}

const buildGlobalOverlapRepairGroups = ({
  preview,
  globalAudit,
} = {}) => {
  const issueMap = new Map(
    (Array.isArray(globalAudit?.issues) ? globalAudit.issues : [])
      .filter(issue => clean(issue?.issueId))
      .map(issue => [clean(issue.issueId), issue])
  )
  const targets = [
    ...(Array.isArray(preview?.targetDocuments?.teams)
      ? preview.targetDocuments.teams
      : []),
    ...(Array.isArray(preview?.targetDocuments?.players)
      ? preview.targetDocuments.players
      : []),
    ...(Array.isArray(preview?.targetDocuments?.searchIndexes)
      ? preview.targetDocuments.searchIndexes
      : []),
  ]
  const groupsByKey = new Map()

  targets.forEach(target => {
    const repairClasses = Array.isArray(target?.repairClasses)
      ? target.repairClasses.map(clean).filter(Boolean)
      : []

    if (repairClasses.length <= 1) return

    const documentId = clean(target?.documentId)

    ;(Array.isArray(target?.rowTargets) ? target.rowTargets : []).forEach(rowTarget => {
      const issueId = clean(rowTarget?.issueId)
      const repairClass = clean(rowTarget?.repairClass)
      const issue = issueMap.get(issueId)
      const allowNonSelectableEngineRefresh = repairClass === 'engineRefresh'

      if (
        !issueId ||
        !isSafeGlobalRepairClass(repairClass) ||
        (!allowNonSelectableEngineRefresh && (
          issue?.repairable === false ||
          issue?.selectable === false
        ))
      ) {
        return
      }

      const issueType = clean(rowTarget?.type || issue?.type)
      if (!issueType) return

      const key = `${repairClass}::${issueType}`
      const current = groupsByKey.get(key) || {
        id: key,
        repairClass,
        issueType,
        title: getPlayerScoutIssueDefinition(issueType).title || issueType,
        issueIds: new Set(),
        documentIds: new Set(),
      }

      current.issueIds.add(issueId)
      if (documentId) current.documentIds.add(documentId)
      groupsByKey.set(key, current)
    })
  })

  return [...groupsByKey.values()]
    .map(group => ({
      ...group,
      issueIds: [...group.issueIds],
      documentsCount: group.documentIds.size,
    }))
    .sort((a, b) => (
      `${a.repairClass}:${a.title}`.localeCompare(`${b.repairClass}:${b.title}`)
    ))
}

function GlobalRepairPreviewPanel({
  busy,
  repairBusy,
  globalAudit,
  preview,
  directRepairResult,
  regularRepairResult,
  selectedRepairResult,
  overlapRepairResult,
  onRunFull,
  onRunPreview,
  onDirectRepairApply,
  onRegularRepairApply,
  onSelectedRepairApply,
  onSafeDependencyOverlapRepairApply,
  onOverlapRepairApply,
}) {
  const [selectedGlobalSafeIssueIds, setSelectedGlobalSafeIssueIds] = React.useState([])
  const [selectedGlobalOverlapIssueIds, setSelectedGlobalOverlapIssueIds] = React.useState([])
  const [dependencyBatchSize, setDependencyBatchSize] = React.useState(5)

  React.useEffect(() => {
    setDependencyBatchSize(5)
  }, [globalAudit])

  const cost = preview?.cost || {}
  const previewStale = preview?.stale === true
  const targetDocuments = preview?.targetDocuments || {}
  const duplicateWritePrevention = preview?.duplicateWritePrevention || {}
  const selectedSummary = preview?.selectedIssuesSummary || {}
  const byClass = selectedSummary.byClass || {}
  const directCost = preview?.directRepairPreview?.cost || {}
  const engineCost = preview?.engineRefreshPreview?.cost || {}
  const migrationCost = preview?.migrationPlan?.preview?.cost || {}
  const regularCost = preview?.regularRepairPreview?.cost || {}
  const actualWrites = preview?.actualDocumentWrites || {}
  const safeRepairCandidates = preview?.safeRepairCandidates || {}
  const safeByClass = safeRepairCandidates.byClass || {}
  const blockedByOverlap = safeRepairCandidates.blockedByOverlap || {}
  const globalSummary = globalAudit?.summary || {}
  const globalCost = globalAudit?.cost?.audit || {}
  const globalObserved = globalCost.documentsObserved || {}
  const globalReadSafety = globalAudit?.cost?.readSafety || {}
  const migrationWrites = numberOf(migrationCost?.writes?.estimatedMax)
  const regularWrites = numberOf(regularCost?.writes?.estimatedMax)
  const uniqueTeamTargets = Array.isArray(targetDocuments.teams)
    ? targetDocuments.teams.length
    : 0
  const uniquePlayerTargets = Array.isArray(targetDocuments.players)
    ? targetDocuments.players.length
    : 0
  const uniqueSearchTargets = Array.isArray(targetDocuments.searchIndexes)
    ? targetDocuments.searchIndexes.length
    : 0
  const overlapsCount = numberOf(duplicateWritePrevention.overlapsCount)
  const readSafety = preview?.auditSummary?.cost?.readSafety || {}
  const safetyLimit = numberOf(readSafety.safetyLimit || readSafety.hardLimit)
  const auditReads = numberOf(cost.auditReads)
  const safetyPercent = safetyLimit
    ? Math.min(100, Math.round((auditReads / safetyLimit) * 100))
    : 0
  const hasReusableGlobalAudit = globalAudit?.mode === 'read-only'
  const safeDirectDocuments = Number(
    safeByClass.directRepair?.documentsCount || 0
  )
  const safeDirectIssues = Number(
    safeByClass.directRepair?.issuesCount || 0
  )
  const safeRegularIssues = Number(
    safeByClass.regularRepair?.issuesCount || 0
  )
  const deferredIssueIdSet = React.useMemo(
    () => new Set(
      (Array.isArray(preview?.deferredIssueIds) ? preview.deferredIssueIds : [])
        .map(clean)
        .filter(Boolean)
    ),
    [preview]
  )
  const safeNonOverlapTargets = [
    ...(Array.isArray(targetDocuments.teams) ? targetDocuments.teams : []),
    ...(Array.isArray(targetDocuments.players) ? targetDocuments.players : []),
    ...(Array.isArray(targetDocuments.searchIndexes) ? targetDocuments.searchIndexes : []),
  ].filter(target => {
    const repairClasses = Array.isArray(target?.repairClasses)
      ? target.repairClasses
      : []
    const issueIds = Array.isArray(target?.issueIds) ? target.issueIds : []

    return repairClasses.length === 1 &&
      issueIds.length > 0 &&
      !issueIds.some(issueId => deferredIssueIdSet.has(clean(issueId)))
  })
  const safeRegularTargets = safeNonOverlapTargets.filter(target => (
    target.repairClasses[0] === 'regularRepair'
  ))
  const safeMigrationTargets = safeNonOverlapTargets.filter(target => (
    target.repairClasses[0] === 'migration'
  ))
  const safeEngineTargets = safeNonOverlapTargets.filter(target => (
    target.repairClasses[0] === 'engineRefresh'
  ))
  const safeEnginePlan = React.useMemo(
    () => buildPlayerScoutSafeClassClosurePlan({
      preview,
      repairClass: 'engineRefresh',
      maxDocuments: ENGINE_DEFAULT_BATCH_DOCUMENTS,
    }),
    [preview]
  )
  const selectedSafeClassTargets = (targets, maxDocuments) => (
    Number(maxDocuments) > 0
      ? targets.slice(0, Math.floor(Number(maxDocuments)))
      : targets
  )
  const selectedSafeClassIssueIds = (targets, maxDocuments) => [
    ...new Set(
      selectedSafeClassTargets(targets, maxDocuments)
        .flatMap(target => Array.isArray(target?.issueIds) ? target.issueIds : [])
        .map(clean)
        .filter(Boolean)
    ),
  ]

  const safeDependencyOverlapCandidates = preview?.safeDependencyOverlapCandidates || {}
  const dependencyTargets = Array.isArray(safeDependencyOverlapCandidates.targets)
    ? safeDependencyOverlapCandidates.targets
    : []
  const actionableDependencyTargets = dependencyTargets.filter(target => (
    !(Array.isArray(target?.issueIds) ? target.issueIds : [])
      .some(issueId => deferredIssueIdSet.has(clean(issueId)))
  ))
  const actionableDependencyIssueIds = [
    ...new Set(
      actionableDependencyTargets
        .flatMap(target => target.issueIds)
        .map(clean)
        .filter(Boolean)
    ),
  ]
  const safeRepairGroups = React.useMemo(
    () => buildGlobalSafeRepairGroups({
      preview,
      globalAudit,
    })
      .map(group => ({
        ...group,
        issueIds: group.issueIds.filter(issueId => !deferredIssueIdSet.has(issueId)),
      }))
      .filter(group => group.issueIds.length),
    [deferredIssueIdSet, globalAudit, preview]
  )
  const safeIssueIdSet = React.useMemo(
    () => new Set(safeRepairGroups.flatMap(group => group.issueIds)),
    [safeRepairGroups]
  )
  const selectedSafeIssueIds = [
    ...new Set(
      selectedGlobalSafeIssueIds
        .map(clean)
        .filter(issueId => safeIssueIdSet.has(issueId))
    ),
  ]
  const allSafeIssueIds = [...safeIssueIdSet]
  const defaultSafeBatchIssueIds = [
    ...new Set(
      safeNonOverlapTargets
        .slice(0, 5)
        .flatMap(target => Array.isArray(target?.issueIds) ? target.issueIds : [])
        .map(clean)
        .filter(issueId => safeIssueIdSet.has(issueId))
    ),
  ]
  const overlapRepairGroups = React.useMemo(
    () => buildGlobalOverlapRepairGroups({
      preview,
      globalAudit,
    })
      .map(group => ({
        ...group,
        issueIds: group.issueIds.filter(issueId => !deferredIssueIdSet.has(issueId)),
      }))
      .filter(group => group.issueIds.length),
    [deferredIssueIdSet, globalAudit, preview]
  )
  const overlapIssueIdSet = React.useMemo(
    () => new Set(overlapRepairGroups.flatMap(group => group.issueIds)),
    [overlapRepairGroups]
  )
  const selectedOverlapIssueIds = [
    ...new Set(
      selectedGlobalOverlapIssueIds
        .map(clean)
        .filter(issueId => overlapIssueIdSet.has(issueId))
    ),
  ]
  const selectedOverlapRepairClasses = [
    ...new Set(
      overlapRepairGroups
        .filter(group => group.issueIds.some(issueId => selectedOverlapIssueIds.includes(issueId)))
        .map(group => group.repairClass)
    ),
  ]
  const overlapSelectionHasMixedRoutes = selectedOverlapRepairClasses.length > 1
  const overlapResultSelectedIssues = numberOf(
    overlapRepairResult?.globalSelection?.selectedIssuesCount ||
      overlapRepairResult?.selection?.selectedIssuesCount
  )
  const overlapResultSearchIndexWrites = numberOf(
    overlapRepairResult?.searchIndexRowsCreated
  ) + numberOf(overlapRepairResult?.searchIndexRowsUpdated)
  const overlapResultPlayerSchemaDocumentsUpdated = numberOf(
    overlapRepairResult?.playerSchemaDocumentsUpdated
  )
  const overlapResultRemainingIssues = numberOf(
    overlapRepairResult?.targetedVerification?.remainingIssuesCount
  )
  const overlapResultVerifiedIssues = numberOf(
    overlapRepairResult?.targetedVerification?.verifiedIssuesCount
  )
  const overlapExecutionTelemetry = overlapRepairResult?.executionTelemetry || {}
  const overlapUniqueDocumentsWritten = overlapExecutionTelemetry.uniqueDocumentsWritten || {}
  const overlapWriteOperations = overlapExecutionTelemetry.writeOperations || {}
  const isSafeDependencyOverlapResult = (
    overlapRepairResult?.mode === 'global-safe-dependency-overlap-apply'
  )
  const regularExecutionTelemetry = regularRepairResult?.executionTelemetry || {}
  const regularUniqueDocumentsWritten = regularExecutionTelemetry.uniqueDocumentsWritten || {}
  const regularWriteOperations = regularExecutionTelemetry.writeOperations || {}
  const selectedExecutionTelemetry = selectedRepairResult?.executionTelemetry || {}
  const selectedUniqueDocumentsWritten = selectedExecutionTelemetry.uniqueDocumentsWritten || {}
  const selectedWriteOperations = selectedExecutionTelemetry.writeOperations || {}

  React.useEffect(() => {
    setSelectedGlobalSafeIssueIds([])
    setSelectedGlobalOverlapIssueIds([])
  }, [preview?.generatedAt, preview?.stale])

  React.useEffect(() => {
    setSelectedGlobalSafeIssueIds(current => (
      current.filter(issueId => safeIssueIdSet.has(clean(issueId)))
    ))
  }, [safeIssueIdSet])

  React.useEffect(() => {
    setSelectedGlobalOverlapIssueIds(current => (
      current.filter(issueId => overlapIssueIdSet.has(clean(issueId)))
    ))
  }, [overlapIssueIdSet])

  const toggleGlobalSafeGroup = group => {
    const groupIssueIds = group.issueIds.map(clean).filter(Boolean)
    const selectedSet = new Set(selectedGlobalSafeIssueIds.map(clean))
    const allSelected = groupIssueIds.every(issueId => selectedSet.has(issueId))

    if (allSelected) {
      setSelectedGlobalSafeIssueIds(
        selectedGlobalSafeIssueIds.filter(issueId => !groupIssueIds.includes(clean(issueId)))
      )
      return
    }

    setSelectedGlobalSafeIssueIds([
      ...new Set([
        ...selectedSet,
        ...groupIssueIds,
      ]),
    ])
  }

  const toggleGlobalOverlapGroup = group => {
    const groupIssueIds = group.issueIds.map(clean).filter(Boolean)
    const selectedSet = new Set(selectedGlobalOverlapIssueIds.map(clean))
    const allSelected = groupIssueIds.every(issueId => selectedSet.has(issueId))

    if (allSelected) {
      setSelectedGlobalOverlapIssueIds(
        selectedGlobalOverlapIssueIds.filter(issueId => !groupIssueIds.includes(clean(issueId)))
      )
      return
    }

    setSelectedGlobalOverlapIssueIds([
      ...new Set([
        ...selectedSet,
        ...groupIssueIds,
      ]),
    ])
  }

  return (
    <Box sx={sx.globalPreviewBox}>
      <Box sx={sx.auditStatusHeader}>
        <Box>
          <Typography level='title-md' sx={sx.sectionTitle}>
            Global Repair Preview
          </Typography>
          <Typography level='body-sm' sx={sx.auditChoiceDescription}>
            תצוגה מקדימה בלבד מעל בדיקה מלאה. אין כתיבה במסך הזה ואין שינוי במסד הנתונים.
            {hasReusableGlobalAudit ? ' קיימת בדיקה מלאה טעונה והיא תשמש ללא בדיקה נוספת.' : ''}
          </Typography>
        </Box>

        <Stack direction='row' spacing={0.75}>
          <Button
            size='sm'
            variant='outlined'
            color='warning'
            loading={busy}
            disabled={busy || repairBusy || typeof onRunFull !== 'function'}
            onClick={onRunFull}
          >
            בדוק את כל המערכת
          </Button>

          <Button
            size='sm'
            variant='solid'
            color='warning'
            loading={busy}
            disabled={busy || repairBusy || typeof onRunPreview !== 'function'}
            onClick={onRunPreview}
          >
            בנה תצוגה מקדימה מלאה
          </Button>
        </Stack>
      </Box>

      {hasReusableGlobalAudit ? (
        <Box sx={sx.repairCostGrid}>
          <SummaryCard
            label='חריגות בבדיקה המלאה'
            value={globalSummary.totalIssues || globalAudit?.issues?.length || 0}
            tone={(globalSummary.totalIssues || globalAudit?.issues?.length) ? 'warning' : 'success'}
          />
          <SummaryCard
            label='קריאות בבדיקה'
            value={globalCost.reads?.total || globalReadSafety.readsUsed || 0}
          />
          <SummaryCard
            label='מסמכי קבוצה שנקראו'
            value={globalObserved.teamDocuments || 0}
          />
          <SummaryCard
            label='מסמכי שחקן שנקראו'
            value={globalObserved.playerDocuments || 0}
          />
        </Box>
      ) : null}

      {preview?.valid === false ? (
        <Box sx={sx.globalSafetyBox}>
          <Typography level='title-sm' color='danger' sx={sx.sectionTitle}>
            התצוגה המקדימה המלאה לא נטענה
          </Typography>
          <Typography level='body-sm' sx={sx.auditChoiceDescription}>
            {preview.reason === 'GLOBAL_AUDIT_DATASET_EMPTY'
              ? 'הבדיקה החזירה מאגר ריק עם מספר קריאות מינימלי, ולכן התוצאה אינה מוצגת כמצב תקין.'
              : preview.reason === 'GLOBAL_AUDIT_SCOPED_SOURCE'
                ? 'המקור שנשלח לתצוגה המקדימה המלאה הוא בדיקה ממוקדת, ולכן הפעולה נחסמה.'
                : preview.reason === 'GLOBAL_AUDIT_PLAYER_DATASET_MISSING'
                  ? 'הבדיקה המלאה קראה מסמכי קבוצה אך לא מסמכי שחקנים. זו תוצאה חלקית ולכן לא ניתן להמשיך לתצוגה מקדימה מלאה.'
                  : preview.reason || 'תוצאת התצוגה המקדימה אינה תקינה.'}
          </Typography>
        </Box>
      ) : preview ? (
        <>
          <Box sx={sx.repairCostGrid}>
            <SummaryCard
              label='בדיקה · קריאות'
              value={auditReads}
              tone={safetyLimit && auditReads >= safetyLimit ? 'warning' : 'neutral'}
            />
            <SummaryCard
              label='ביצוע · קריאות מקסימום'
              value={cost.applyReadsMaximum || 0}
            />
            <SummaryCard
              label='אימות · קריאות מקסימום'
              value={cost.verificationReadsMaximum || 0}
            />
            <SummaryCard
              label='כתיבות מקסימום'
              value={cost.writesMaximum || 0}
              tone={cost.writesMaximum ? 'warning' : 'success'}
            />
          </Box>

          <Box sx={sx.repairCostGrid}>
            <SummaryCard
              label='כתיבות במסמכי קבוצה'
              value={actualWrites.uniqueTeamWrites ?? uniqueTeamTargets}
            />
            <SummaryCard
              label='כתיבות במסמכי שחקן'
              value={actualWrites.uniquePlayerWrites ?? uniquePlayerTargets}
            />
            <SummaryCard
              label='כתיבות במסמכי חיפוש'
              value={actualWrites.uniqueSearchIndexWrites ?? uniqueSearchTargets}
            />
            <SummaryCard
              label='סך מסמכים לכתיבה'
              value={actualWrites.totalActualDocumentWrites ?? (
                uniqueTeamTargets + uniquePlayerTargets + uniqueSearchTargets
              )}
              tone={actualWrites.totalActualDocumentWrites ? 'warning' : 'success'}
            />
          </Box>

          <Box sx={sx.repairCostGrid}>
            <SummaryCard
              label='מיגרציה · כתיבות'
              value={migrationWrites}
              tone={migrationWrites ? 'warning' : 'success'}
            />
            <SummaryCard
              label='רענון מצב סקאוטינג · כתיבות'
              value={engineCost.writesMaximum || 0}
              tone={engineCost.writesMaximum ? 'warning' : 'success'}
            />
            <SummaryCard
              label='תיקון ישיר · כתיבות'
              value={directCost.writesMaximum || 0}
              tone={directCost.writesMaximum ? 'warning' : 'success'}
            />
            <SummaryCard
              label='תיקון רגיל · כתיבות'
              value={regularWrites}
              tone={regularWrites ? 'warning' : 'success'}
            />
            <SummaryCard
              label='מסמכי שחקן שאוחדו'
              value={actualWrites.playerDocumentsWithMergedScopes || 0}
              tone={actualWrites.playerDocumentsWithMergedScopes ? 'warning' : 'success'}
            />
            <SummaryCard
              label='חפיפות'
              value={overlapsCount}
              tone={overlapsCount ? 'danger' : 'success'}
            />
          </Box>

          <Box sx={sx.globalSafetyBox}>
            <Typography level='title-sm' sx={sx.sectionTitle}>
              מועמדים ללא חפיפה
            </Typography>
            <Typography level='body-xs' sx={sx.auditChoiceDescription}>
              ספירה תיאורטית לקריאה בלבד של מסמכים שנמצאים במסלול תיקון יחיד. ביצוע גורף אינו זמין מהמסך הזה.
            </Typography>
            <Box sx={sx.repairCostGrid}>
              <SummaryCard
                label='מיגרציה בטוחה · מסמכים/חריגות'
                value={`${safeByClass.migration?.documentsCount || 0}/${safeByClass.migration?.issuesCount || 0}`}
                tone={safeByClass.migration?.documentsCount ? 'warning' : 'success'}
              />
              <SummaryCard
                label='רענון בטוח · מסמכים/חריגות'
                value={`${safeByClass.engineRefresh?.documentsCount || 0}/${safeByClass.engineRefresh?.issuesCount || 0}`}
                tone={safeByClass.engineRefresh?.documentsCount ? 'warning' : 'success'}
              />
              <SummaryCard
                label='תיקון ישיר בטוח · מסמכים/חריגות'
                value={`${safeByClass.directRepair?.documentsCount || 0}/${safeByClass.directRepair?.issuesCount || 0}`}
                tone={safeByClass.directRepair?.documentsCount ? 'warning' : 'success'}
              />
              <SummaryCard
                label='תיקון רגיל בטוח · מסמכים/חריגות'
                value={`${safeByClass.regularRepair?.documentsCount || 0}/${safeByClass.regularRepair?.issuesCount || 0}`}
                tone={safeByClass.regularRepair?.documentsCount ? 'warning' : 'success'}
              />
              <SummaryCard
                label='חסום בגלל חפיפה · מסמכים/חריגות'
                value={`${blockedByOverlap.documentsCount || 0}/${blockedByOverlap.issuesCount || 0}`}
                tone={blockedByOverlap.documentsCount ? 'danger' : 'success'}
              />
            </Box>
          </Box>

          <Box sx={sx.globalSafetyBox}>
            <Typography level='title-sm' sx={sx.sectionTitle}>
              תקציב קריאות
            </Typography>
            <Typography level='body-xs' sx={sx.auditChoiceDescription}>
              הבדיקה השתמשה ב-{auditReads} קריאות{safetyLimit ? ` מתוך מגבלה ${safetyLimit}` : ''}.
              {safetyLimit ? ` ניצול משוער: ${safetyPercent}%.` : ' לא דווחה מגבלת קריאות בטוחה בתוצאה.'}
            </Typography>
          </Box>

          <Typography level='body-xs' sx={sx.repairCostBreakdown}>
            בחירה מלאה: מיגרציה {byClass.migration || 0} · רענון מצב סקאוטינג {byClass.engineRefresh || 0} · תיקון ישיר {byClass.directRepair || 0} · תיקון רגיל {byClass.regularRepair || 0}. רענון מצב הסקאוטינג אינו מריץ אימות אוטומטי במסלול הקיים, ולכן לא נוספו לו קריאות אימות כאן.
          </Typography>

          {overlapsCount ? (
            <Typography level='body-xs' color='danger' sx={sx.repairNote}>
              ביצוע גורף עתידי חייב להיחסם עד להכרעה מפורשת: נמצאו {overlapsCount} מסמכים שמופיעים ביותר ממסלול תיקון אחד.
            </Typography>
          ) : null}

          {previewStale ? (
            <Box sx={sx.globalSafetyBox}>
              <Typography level='title-sm' sx={sx.sectionTitle}>
                תצוגה מקדימה אחרי תיקון
              </Typography>
              <Typography level='body-xs' sx={sx.auditChoiceDescription}>
                בוצע תיקון לפי התצוגה המקדימה הזאת, ולכן כפתורי הביצוע מוסתרים עד בניית תצוגה מקדימה מחדש. אפשר ללחוץ `בנה תצוגה מקדימה מלאה` כדי לחשב מחדש מתוך הבדיקה המלאה שכבר נטענה, ללא בדיקה מלאה נוספת. זה אינו אימות מלא של מסד הנתונים, ולכן חריגות שלא אומתו יכולים להופיע עד הרצת `בדוק את כל המערכת`.
              </Typography>
            </Box>
          ) : null}

          {!previewStale && safeDirectDocuments ? (
            <Box sx={sx.repairActionBar}>
              <Box sx={sx.repairActionCopy}>
                <Typography level='title-sm' sx={sx.sectionTitle}>
                  תיקון ראשון בטוח
                </Typography>
                <Typography level='body-xs' sx={sx.auditChoiceDescription}>
                  תיקון ישיר במסמכי החיפוש בלבד: {safeDirectDocuments} מסמכים / {safeDirectIssues} חריגות, ללא כתיבות במסמכי קבוצה או שחקן וללא חפיפות.
                </Typography>
              </Box>

              <Button
                size='sm'
                variant='solid'
                color='warning'
                loading={repairBusy}
                disabled={
                  busy ||
                  repairBusy ||
                  typeof onDirectRepairApply !== 'function'
                }
                onClick={onDirectRepairApply}
              >
                תקן תיקון ישיר במסמכי החיפוש בלבד
              </Button>
            </Box>
          ) : null}

          {!previewStale && (
            safeRegularTargets.length ||
            safeMigrationTargets.length ||
            safeEngineTargets.length
          ) ? (
            <Box sx={sx.globalSafetyBox}>
              <Box sx={sx.auditStatusHeader}>
                <Box>
                  <Typography level='title-sm' sx={sx.sectionTitle}>
                    תיקונים בטוחים ללא חפיפה — קבוצה
                  </Typography>
                  <Typography level='body-xs' sx={sx.auditChoiceDescription}>
                    ברירות מחדל לפי מסלול: תיקון רגיל עד 25 מסמכים · מיגרציה עד 25 · רענון מצב סקאוטינג עד 10. כל מגבלות השירות נשארות פעילות.
                  </Typography>
                </Box>
              </Box>

              {safeRegularTargets.length ? (
                <Box sx={sx.repairActionBar}>
                  <Box sx={sx.repairActionCopy}>
                    <Typography level='title-sm' sx={sx.sectionTitle}>
                      תיקון רגיל ללא חפיפה
                    </Typography>
                    <Typography level='body-xs' sx={sx.auditChoiceDescription}>
                      זמינים {safeRegularTargets.length} מסמכים / {safeRegularIssues} חריגות · בקבוצה הבאה {selectedSafeClassTargets(safeRegularTargets, REGULAR_DEFAULT_BATCH_DOCUMENTS).length} מסמכים.
                    </Typography>
                  </Box>
                  <Button
                    size='sm'
                    variant='solid'
                    color='warning'
                    loading={repairBusy}
                    disabled={
                      busy ||
                      repairBusy ||
                      typeof onRegularRepairApply !== 'function'
                    }
                    onClick={() => onRegularRepairApply({
                      maxDocuments: REGULAR_DEFAULT_BATCH_DOCUMENTS,
                    })}
                  >
                    תקן קבוצה רגילה
                  </Button>
                </Box>
              ) : null}

              {safeMigrationTargets.length ? (
                <Box sx={sx.repairActionBar}>
                  <Box sx={sx.repairActionCopy}>
                    <Typography level='title-sm' sx={sx.sectionTitle}>
                      מיגרציה ללא חפיפה
                    </Typography>
                    <Typography level='body-xs' sx={sx.auditChoiceDescription}>
                      זמינים {safeMigrationTargets.length} מסמכים · בקבוצה הבאה {selectedSafeClassTargets(safeMigrationTargets, MIGRATION_DEFAULT_BATCH_DOCUMENTS).length} מסמכים.
                    </Typography>
                  </Box>
                  <Button
                    size='sm'
                    variant='solid'
                    color='warning'
                    loading={repairBusy}
                    disabled={
                      busy ||
                      repairBusy ||
                      typeof onSelectedRepairApply !== 'function'
                    }
                    onClick={() => onSelectedRepairApply({
                      selectedIssueIds: selectedSafeClassIssueIds(
                        safeMigrationTargets,
                        MIGRATION_DEFAULT_BATCH_DOCUMENTS
                      ),
                      maxDocuments: MIGRATION_DEFAULT_BATCH_DOCUMENTS,
                      repairLabel: 'מיגרציה ללא חפיפה',
                    })}
                  >
                    תקן קבוצת מיגרציה
                  </Button>
                </Box>
              ) : null}

              {safeEngineTargets.length ? (
                <Box sx={sx.repairActionBar}>
                  <Box sx={sx.repairActionCopy}>
                    <Typography level='title-sm' sx={sx.sectionTitle}>
                      רענון ללא חפיפה
                    </Typography>
                    <Typography level='body-xs' sx={sx.auditChoiceDescription}>
                      יעדי רענון גולמיים: {safeEnginePlan.rawActionableTargetsCount} · זמינים לפי קבוצת התלות: {safeEnginePlan.availableTargetsCount} · בקבוצה הבאה: {safeEnginePlan.selectedTargetsCount}.{safeEnginePlan.selectedTargetsCount === 0 && safeEnginePlan.smallestSelectableComponentDocuments > 0
                      ? ` הרכיב הקטן ביותר דורש ${safeEnginePlan.smallestSelectableComponentDocuments} מסמכים.`
                      : ''} הרענון לא ייחשב מאומת.
                    </Typography>
                  </Box>
                  <Button
                    size='sm'
                    variant='solid'
                    color='warning'
                    loading={repairBusy}
                    disabled={
                      busy ||
                      repairBusy ||
                      safeEnginePlan.selectedTargetsCount === 0 ||
                      typeof onSelectedRepairApply !== 'function'
                    }
                    onClick={() => onSelectedRepairApply({
                      repairClass: 'engineRefresh',
                      maxDocuments: ENGINE_DEFAULT_BATCH_DOCUMENTS,
                      repairLabel: 'רענון ללא חפיפה',
                    })}
                  >
                    תקן קבוצת רענון
                  </Button>
                </Box>
              ) : null}
            </Box>
          ) : null}

          {!previewStale && safeRepairGroups.length ? (
            <Box sx={sx.globalSafetyBox}>
              <Box sx={sx.auditStatusHeader}>
                <Box>
                  <Typography level='title-sm' sx={sx.sectionTitle}>
                    בחירת תיקונים בטוחים לפי סוג
                  </Typography>
                  <Typography level='body-xs' sx={sx.auditChoiceDescription}>
                    הבחירה נבנית מתוך התצוגה המקדימה הנוכחית בלבד. מסמכים עם חפיפה ומסמכים לדיווח בלבד אינם זמינים לבחירה.
                  </Typography>
                </Box>

                <Stack direction='row' spacing={0.75}>
                  <Button
                    size='sm'
                    variant='outlined'
                    color='neutral'
                    disabled={busy || repairBusy || !defaultSafeBatchIssueIds.length}
                    onClick={() => setSelectedGlobalSafeIssueIds(defaultSafeBatchIssueIds)}
                  >
                    בחר קבוצה של 5 מסמכים
                  </Button>
                  <Button
                    size='sm'
                    variant='outlined'
                    color='neutral'
                    disabled={busy || repairBusy || !selectedSafeIssueIds.length}
                    onClick={() => setSelectedGlobalSafeIssueIds([])}
                  >
                    נקה
                  </Button>
                </Stack>
              </Box>

              <Stack direction='row' spacing={0.75} sx={sx.profileChips}>
                {safeRepairGroups.map(group => {
                  const selectedSet = new Set(selectedSafeIssueIds)
                  const selectedCount = group.issueIds.filter(issueId => (
                    selectedSet.has(issueId)
                  )).length
                  const allSelected = selectedCount === group.issueIds.length
                  const partiallySelected = selectedCount > 0 && !allSelected

                  return (
                    <Chip
                      key={group.id}
                      size='sm'
                      variant={allSelected ? 'solid' : 'soft'}
                      color={allSelected ? 'warning' : partiallySelected ? 'primary' : 'neutral'}
                      onClick={() => toggleGlobalSafeGroup(group)}
                    >
                      {GLOBAL_SAFE_REPAIR_CLASS_LABELS[group.repairClass] || group.repairClass}: {group.title} ({group.issueIds.length})
                    </Chip>
                  )
                })}
              </Stack>

              <Box sx={sx.repairActionBar}>
                <Box sx={sx.repairActionCopy}>
                  <Typography level='body-xs' sx={sx.auditChoiceDescription}>
                    נבחרו {selectedSafeIssueIds.length} חריגות מתוך {allSafeIssueIds.length} בטוחים.
                  </Typography>
                  {deferredIssueIdSet.size ? (
                    <Typography level='body-xs' sx={sx.auditChoiceDescription}>
                      ממתינים לאימות בהרצה הנוכחית: {deferredIssueIdSet.size}. הם נשארים בתצוגה המקדימה אך אינם זמינים לכתיבה חוזרת.
                    </Typography>
                  ) : null}
                </Box>

                <Button
                  size='sm'
                  variant='solid'
                  color='warning'
                  loading={repairBusy}
                  disabled={
                    busy ||
                    repairBusy ||
                    !selectedSafeIssueIds.length ||
                    typeof onSelectedRepairApply !== 'function'
                  }
                  onClick={() => onSelectedRepairApply({
                    selectedIssueIds: selectedSafeIssueIds,
                    maxDocuments: 5,
                  })}
                >
                  תקן בחירה בטוחה
                </Button>
              </Box>
            </Box>
          ) : null}

          {directRepairResult ? (
            <Box sx={sx.verificationResultBox}>
              <Typography level='title-sm' sx={sx.sectionTitle}>
                תוצאת התיקון הישיר במסמכי החיפוש
              </Typography>
              <Typography level='body-xs' sx={sx.auditChoiceDescription}>
                עודכנו {directRepairResult.summary?.searchIndexDocumentsUpdated || 0} · כבר היו תקינים {directRepairResult.summary?.alreadyRepairedCount || 0} · דולגו {directRepairResult.summary?.skippedCount || 0} · קריאות תיקון {directRepairResult.summary?.repairReads || 0} · כתיבות {directRepairResult.summary?.repairWrites || 0} · קריאות אימות {directRepairResult.summary?.verificationReads || 0} · נשארו {directRepairResult.summary?.remainingIssuesCount || 0}.
              </Typography>
            </Box>
          ) : null}

          {regularRepairResult ? (
            <Box sx={sx.verificationResultBox}>
              <Typography level='title-sm' sx={sx.sectionTitle}>
                תוצאת התיקון הרגיל
              </Typography>
              <Typography level='body-xs' sx={sx.auditChoiceDescription}>
                קבוצה: {numberOf(regularExecutionTelemetry.targetDocumentsSelected)} מסמכי יעד · נבחרו {regularRepairResult.globalSelection?.selectedIssuesCount || regularRepairResult.selection?.selectedIssuesCount || 0} חריגות · נשארו {regularRepairResult.targetedVerification?.remainingIssuesCount || 0}.
              </Typography>
              <Typography level='body-xs' sx={sx.auditChoiceDescription}>
                במסד הנתונים בפועל: {numberOf(regularUniqueDocumentsWritten.total)} מסמכים ייחודיים — קבוצה {numberOf(regularUniqueDocumentsWritten.teams)} · שחקן {numberOf(regularUniqueDocumentsWritten.players)} · חיפוש {numberOf(regularUniqueDocumentsWritten.searchIndexes)}. פעולות כתיבה: {numberOf(regularWriteOperations.total)}. קריאות אימות: {numberOf(regularExecutionTelemetry.verificationReads)}.
              </Typography>
            </Box>
          ) : null}

          {selectedRepairResult ? (
            <Box sx={sx.verificationResultBox}>
              <Typography level='title-sm' sx={sx.sectionTitle}>
                תוצאת תיקון בחירה בטוחה
              </Typography>
              <Typography level='body-xs' sx={sx.auditChoiceDescription}>
                קבוצה: {numberOf(selectedExecutionTelemetry.targetDocumentsSelected)} מסמכי יעד · נבחרו {selectedRepairResult.globalSelection?.selectedIssuesCount || selectedRepairResult.selection?.selectedIssuesCount || 0} חריגות · נשארו {selectedRepairResult.targetedVerification?.remainingIssuesCount || 0} · לא אומתו {selectedRepairResult.verificationCoverage?.unverifiedIssueIds?.length || 0}.
              </Typography>
              <Typography level='body-xs' sx={sx.auditChoiceDescription}>
                במסד הנתונים בפועל: {numberOf(selectedUniqueDocumentsWritten.total)} מסמכים ייחודיים — קבוצה {numberOf(selectedUniqueDocumentsWritten.teams)} · שחקן {numberOf(selectedUniqueDocumentsWritten.players)} · חיפוש {numberOf(selectedUniqueDocumentsWritten.searchIndexes)}. פעולות כתיבה: {numberOf(selectedWriteOperations.total)} — תיקון {numberOf(selectedWriteOperations.repair)} · רענון {numberOf(selectedWriteOperations.engine)}. קריאות אימות: {numberOf(selectedExecutionTelemetry.verificationReads)}.
              </Typography>
            </Box>
          ) : null}

          {!previewStale && actionableDependencyTargets.length ? (
            <Box sx={sx.globalSafetyBox}>
              <Box sx={sx.auditStatusHeader}>
                <Box>
                  <Typography level='title-sm' sx={sx.sectionTitle}>
                    חפיפה עם סדר תיקון בטוח
                  </Typography>
                  <Typography level='body-xs' sx={sx.auditChoiceDescription}>
                    {actionableDependencyTargets.length} מסמכים / {actionableDependencyIssueIds.length} חריגות. תיקון רגיל ומיגרציה ירוצו קודם, רענון מצב הסקאוטינג אחריהם, ואז אימות ממוקד. השירות עשוי לבחור פחות מהקבוצה המסומן כדי לעמוד בתקציב כתיבה של עד 80 מסמכים ייחודיים ועד 150 פעולות.
                  </Typography>
                </Box>

                <Stack direction='row' spacing={0.75} alignItems='center' flexWrap='wrap'>
                  {[5, 10, 25, 70, 0].map(size => (
                    <Button
                      key={size || 'all'}
                      size='sm'
                      variant={dependencyBatchSize === size ? 'solid' : 'outlined'}
                      color='neutral'
                      disabled={busy || repairBusy}
                      onClick={() => setDependencyBatchSize(size)}
                    >
                      {size || 'הכול'}
                    </Button>
                  ))}

                  <Button
                    size='sm'
                    variant='solid'
                    color='warning'
                    loading={repairBusy}
                    disabled={
                      busy ||
                      repairBusy ||
                      !actionableDependencyIssueIds.length ||
                      typeof onSafeDependencyOverlapRepairApply !== 'function'
                    }
                    onClick={() => onSafeDependencyOverlapRepairApply({
                      maxDocuments: dependencyBatchSize || null,
                    })}
                  >
                    תקן תלויות בטוחות
                  </Button>
                </Stack>
              </Box>
            </Box>
          ) : null}

          {!previewStale && overlapRepairGroups.length ? (
            <Box sx={sx.globalSafetyBox}>
              <Box sx={sx.auditStatusHeader}>
                <Box>
                  <Typography level='title-sm' sx={sx.sectionTitle}>
                    בחירת חפיפה לפי מסלול תיקון
                  </Typography>
                  <Typography level='body-xs' sx={sx.auditChoiceDescription}>
                    בחר מסלול אחד בכל פעם. המערכת תחסום ביצוע אם נבחרו כמה מסלולים יחד.
                  </Typography>
                </Box>

                <Button
                  size='sm'
                  variant='outlined'
                  color='neutral'
                  disabled={busy || repairBusy || !selectedOverlapIssueIds.length}
                  onClick={() => setSelectedGlobalOverlapIssueIds([])}
                >
                  נקה
                </Button>
              </Box>

              <Stack direction='row' spacing={0.75} sx={sx.profileChips}>
                {overlapRepairGroups.map(group => {
                  const selectedSet = new Set(selectedOverlapIssueIds)
                  const selectedCount = group.issueIds.filter(issueId => (
                    selectedSet.has(issueId)
                  )).length
                  const allSelected = selectedCount === group.issueIds.length
                  const partiallySelected = selectedCount > 0 && !allSelected

                  return (
                    <Chip
                      key={group.id}
                      size='sm'
                      variant={allSelected ? 'solid' : 'soft'}
                      color={allSelected ? 'warning' : partiallySelected ? 'primary' : 'neutral'}
                      onClick={() => toggleGlobalOverlapGroup(group)}
                    >
                      {GLOBAL_SAFE_REPAIR_CLASS_LABELS[group.repairClass] || group.repairClass}: {group.title} ({group.issueIds.length})
                    </Chip>
                  )
                })}
              </Stack>

              <Box sx={sx.repairActionBar}>
                <Box sx={sx.repairActionCopy}>
                  <Typography
                    level='body-xs'
                    color={overlapSelectionHasMixedRoutes ? 'danger' : 'neutral'}
                    sx={sx.auditChoiceDescription}
                  >
                    נבחרו {selectedOverlapIssueIds.length} חריגות מתוך החפיפה.
                    {overlapSelectionHasMixedRoutes
                      ? ' נבחרו כמה מסלולים יחד - נקה ובחר מסלול אחד.'
                      : selectedOverlapRepairClasses.length
                        ? ` מסלול: ${GLOBAL_SAFE_REPAIR_CLASS_LABELS[selectedOverlapRepairClasses[0]] || selectedOverlapRepairClasses[0]}.`
                        : ''}
                  </Typography>
                </Box>

                <Button
                  size='sm'
                  variant='solid'
                  color='warning'
                  loading={repairBusy}
                  disabled={
                    busy ||
                    repairBusy ||
                    !selectedOverlapIssueIds.length ||
                    overlapSelectionHasMixedRoutes ||
                    typeof onOverlapRepairApply !== 'function'
                  }
                  onClick={() => onOverlapRepairApply({
                    selectedIssueIds: selectedOverlapIssueIds,
                  })}
                >
                  תקן חפיפה נבחרת
                </Button>
              </Box>
            </Box>
          ) : null}

          {overlapRepairResult ? (
            <Box sx={sx.verificationResultBox}>
              <Typography level='title-sm' sx={sx.sectionTitle}>
                תוצאת תיקון החפיפה שנבחרה
              </Typography>
              {isSafeDependencyOverlapResult ? (
                <>
                  <Typography level='body-xs' sx={sx.auditChoiceDescription}>
                    קבוצה: {numberOf(overlapExecutionTelemetry.dependencyTargetDocumentsSelected)} מסמכי תלות · נבחרו {overlapResultSelectedIssues} חריגות · אומתו {overlapResultVerifiedIssues} · נשארו {overlapResultRemainingIssues}.
                  </Typography>
                  <Typography level='body-xs' sx={sx.auditChoiceDescription}>
                    במסד הנתונים בפועל: {numberOf(overlapUniqueDocumentsWritten.total)} מסמכים ייחודיים נכתבו — קבוצה {numberOf(overlapUniqueDocumentsWritten.teams)} · שחקן {numberOf(overlapUniqueDocumentsWritten.players)} · חיפוש {numberOf(overlapUniqueDocumentsWritten.searchIndexes)}. פעולות כתיבה: {numberOf(overlapWriteOperations.total)} — תיקון {numberOf(overlapWriteOperations.repair)} · רענון {numberOf(overlapWriteOperations.engine)}. קריאות אימות: {numberOf(overlapExecutionTelemetry.verificationReads)}.
                  </Typography>
                </>
              ) : (
                <Typography level='body-xs' sx={sx.auditChoiceDescription}>
                  נבחרו {overlapResultSelectedIssues} חריגות · קבוצות עודכנו {overlapRepairResult.teamDocumentsUpdated || 0} · מסמכי שחקן נוצרו {overlapRepairResult.playerDocumentsCreated || 0} · מסמכי שחקן עודכנו {overlapRepairResult.playerDocumentsUpdated || 0} · תיקוני מבנה/הקשר במסמכי שחקן {overlapResultPlayerSchemaDocumentsUpdated} · חיפוש נוצרו/עודכנו {overlapResultSearchIndexWrites} · אומתו {overlapResultVerifiedIssues} · נשארו {overlapResultRemainingIssues}.
                </Typography>
              )}
            </Box>
          ) : null}

          {safeMigrationTargets.length ? (
            <Box sx={sx.globalSafetyBox}>
              <Typography level='title-sm' sx={sx.sectionTitle}>
                מיגרציה בטוחה לבדיקה
              </Typography>
              <Typography level='body-xs' sx={sx.auditChoiceDescription}>
                פירוט לקריאה בלבד. אין ביצוע במסלול הזה עד שמאשרים במפורש מה ייכתב.
              </Typography>
              <Stack spacing={0.75}>
                {safeMigrationTargets.slice(0, 5).map(target => {
                  const issueTypes = [
                    ...new Set(
                      (Array.isArray(target.rowTargets) ? target.rowTargets : [])
                        .map(row => clean(row.type))
                        .filter(Boolean)
                    ),
                  ]

                  return (
                    <Box
                      key={`${target.collection}:${target.documentId}`}
                      sx={sx.repairSelectionRow}
                    >
                      <Box sx={sx.repairSelectionCopy}>
                        <Typography level='body-sm' sx={sx.healthFindingTitle}>
                          {target.collection} · {target.documentId}
                        </Typography>
                        <Typography level='body-xs' sx={sx.auditChoiceDescription}>
                          {target.issuesCount || 0} חריגות · {joinValues(issueTypes)}
                        </Typography>
                      </Box>
                    </Box>
                  )
                })}
              </Stack>
            </Box>
          ) : null}
        </>
      ) : (
        <Typography level='body-sm' sx={sx.emptyText}>
          עדיין לא נבנתה תצוגה מקדימה מלאה. לחיצה על הכפתור תריץ בדיקה מלאה לקריאה בלבד ותציג את מסמכי היעד והעלויות ללא כתיבה.
        </Typography>
      )}
    </Box>
  )
}


const DATA_HEALTH_AREAS = [
  {
    id: 'leagues',
    title: 'מסמכי ליגה',
    collectionName: 'dbLeagues',
    buttonLabel: 'בדוק את כל מסמכי הליגה',
    description: 'בדיקת המבנה והזהות של כל מסמכי הליגה.',
  },
  {
    id: 'teams',
    title: 'מסמכי קבוצות',
    collectionName: 'dbBirthTeams',
    buttonLabel: 'בדוק את כל מסמכי הקבוצות',
    description: 'בדיקת המבנה והזהות של כל מסמכי הקבוצות.',
  },
  {
    id: 'players',
    title: 'מסמכי שחקנים',
    collectionName: 'dbPlayers',
    buttonLabel: 'בדוק את כל מסמכי השחקנים',
    description: 'בדיקת המבנה והזהות של כל מסמכי השחקנים.',
  },
  {
    id: 'teamIndexes',
    title: 'אינדקסי קבוצות',
    collectionName: 'dbSearchIndexes',
    buttonLabel: 'בדוק את כל אינדקסי הקבוצות',
    description: 'בדיקת כל רשומות החיפוש של קבוצות ועונות.',
  },
  {
    id: 'playerIndexes',
    title: 'אינדקסי שחקנים',
    collectionName: 'dbSearchIndexes',
    buttonLabel: 'בדוק את כל אינדקסי השחקנים',
    description: 'בדיקת כל רשומות החיפוש של שחקנים ועונות.',
  },
]

const DATA_HEALTH_INITIAL_FIELDS = 4
const DATA_HEALTH_INITIAL_DOCUMENTS = 6

const DATA_HEALTH_ISSUE_DESCRIPTIONS = {
  schema_missing_fields: 'במסמך חסרים שדות שהמבנה הנוכחי מצפה למצוא.',
  schema_unexpected_fields: 'במסמך קיימים שדות ישנים או לא מוכרים שאינם חלק מהמבנה הנוכחי.',
  schema_invalid_types: 'השדות קיימים, אבל סוג הנתון שנשמר בהם שונה מהסוג שהמבנה הנוכחי מצפה לקבל.',
  document_id_mismatch: 'המזהה השמור בתוך המסמך אינו תואם למזהה של המסמך עצמו.',
  entity_type_mismatch: 'סוג הרשומה השמור באינדקס אינו מתאים לסוג האינדקס שנבדק.',
  missing_identity: 'חסר במסמך מזהה בסיסי שנדרש כדי לזהות אותו באופן תקין.',
}

const DATA_HEALTH_FIELD_STATUS = {
  schema_missing_fields: 'חסר',
  schema_unexpected_fields: 'לא במבנה',
  schema_invalid_types: 'סוג שונה',
  document_id_mismatch: 'מזהה שונה',
  entity_type_mismatch: 'סוג רשומה שונה',
  missing_identity: 'מזהה חסר',
}

const normalizeDataHealthIssuePath = value => clean(value)
  .replace(/\[\d+\]/g, '[]')

const buildDataHealthDocumentGroups = ({ result, issueType }) => {
  const issues = Array.isArray(result?.issues)
    ? result.issues.filter(issue => issue.type === issueType)
    : []
  const groups = new Map()

  issues.forEach(issue => {
    const documentId = clean(issue.documentId) || 'מסמך ללא מזהה'
    const current = groups.get(documentId) || {
      documentId,
      fields: new Map(),
      seasons: new Set(),
    }
    const details = Array.isArray(issue.fieldDetails) && issue.fieldDetails.length
      ? issue.fieldDetails
      : []

    if (details.length) {
      details.forEach(detail => {
        const path = normalizeDataHealthIssuePath(
          detail.normalizedPath || detail.path || 'המסמך עצמו'
        )
        if (!path) return

        const seasonKey = clean(detail.seasonKey || issue.seasonKey) || 'כל המסמך'
        current.seasons.add(seasonKey)
        if (!current.fields.has(path)) {
          current.fields.set(path, {
            path,
            seasonKey,
            repairAction: clean(detail.repairAction) || 'review_only',
            repairLabel: clean(detail.repairLabel) || 'דורש בדיקה לפני תיקון',
            repairReason: clean(detail.repairReason),
          })
        }
      })
    } else {
      const fields = Array.isArray(issue.fields) ? issue.fields : []
      fields.forEach(field => {
        const path = normalizeDataHealthIssuePath(
          typeof field === 'string' ? field : field?.field
        )
        if (!path) return

        const seasonKey = clean(issue.seasonKey) || 'כל המסמך'
        current.seasons.add(seasonKey)
        if (!current.fields.has(path)) {
          current.fields.set(path, {
            path,
            seasonKey,
            repairAction: 'review_only',
            repairLabel: 'דורש בדיקה לפני תיקון',
            repairReason: '',
          })
        }
      })
    }

    if (!current.fields.size) {
      current.fields.set('המסמך עצמו', {
        path: 'המסמך עצמו',
        seasonKey: clean(issue.seasonKey) || 'כל המסמך',
        repairAction: 'review_only',
        repairLabel: 'דורש בדיקה לפני תיקון',
        repairReason: '',
      })
    }
    groups.set(documentId, current)
  })

  return Array.from(groups.values())
    .map(group => ({
      ...group,
      fields: Array.from(group.fields.values())
        .sort((left, right) => left.path.localeCompare(right.path)),
      seasons: Array.from(group.seasons).sort(),
    }))
    .sort((left, right) => left.documentId.localeCompare(right.documentId))
}

const buildDataHealthExportRows = ({ result, issueType }) => {
  const issues = Array.isArray(result?.issues)
    ? result.issues.filter(issue => issue.type === issueType)
    : []
  const status = DATA_HEALTH_FIELD_STATUS[issueType] || 'דורש בדיקה'
  const rows = []

  issues.forEach(issue => {
    const documentId = clean(issue.documentId) || 'מסמך ללא מזהה'
    const collectionName = clean(issue.collectionName || result?.collectionName)
    const details = Array.isArray(issue.fieldDetails) && issue.fieldDetails.length
      ? issue.fieldDetails
      : []

    if (details.length) {
      details.forEach(detail => {
        rows.push({
          collectionName,
          documentId,
          seasonKey: clean(detail.seasonKey || issue.seasonKey) || 'כל המסמך',
          field: normalizeDataHealthIssuePath(
            detail.normalizedPath || detail.path || 'המסמך עצמו'
          ),
          status,
        })
      })
      return
    }

    const fields = Array.isArray(issue.fields) && issue.fields.length
      ? issue.fields
      : ['המסמך עצמו']

    fields.forEach(field => {
      rows.push({
        collectionName,
        documentId,
        seasonKey: clean(issue.seasonKey) || 'כל המסמך',
        field: normalizeDataHealthIssuePath(
          typeof field === 'string' ? field : field?.field
        ) || 'המסמך עצמו',
        status,
      })
    })
  })

  return rows
}

const exportDataHealthIssueToXlsx = ({ result, issueType, issueTitle }) => {
  const rows = buildDataHealthExportRows({ result, issueType })
  if (!rows.length) return false

  const collectionName = clean(result?.collectionName) || 'data-health'
  const safeIssueType = clean(issueType) || 'issues'

  return exportDataTableRowsToXlsx({
    rows,
    columns: [
      {
        key: 'collectionName',
        label: 'אוסף',
      },
      {
        key: 'documentId',
        label: 'מזהה מסמך',
      },
      {
        key: 'seasonKey',
        label: 'עונה',
      },
      {
        key: 'field',
        label: 'שדה',
      },
      {
        key: 'status',
        label: 'מה לא תקין',
      },
    ],
    fileName: `data-health-${collectionName}-${safeIssueType}`,
    sheetName: clean(issueTitle).slice(0, 31) || 'חריגות',
  })
}

function DataHealthDocumentTooltip({ document, issueType }) {
  const status = DATA_HEALTH_FIELD_STATUS[issueType] || 'דורש בדיקה'

  return (
    <Box sx={sx.dataHealthTooltipContent}>
      <Typography level='body-xs' sx={sx.dataHealthTooltipDocumentId}>
        {document.documentId}
      </Typography>

      <Stack spacing={0.25}>
        {document.fields.map(field => (
          <Typography
            key={field.path}
            level='body-xs'
            sx={sx.dataHealthTooltipField}
          >
            {field.path} — {status}
          </Typography>
        ))}
      </Stack>
    </Box>
  )
}


function DataHealthGroupRepairPreview({ documents, issueTitle }) {
  if (!Array.isArray(documents) || !documents.length) return null

  const actionMap = new Map()
  documents.forEach(document => {
    document.fields.forEach(field => {
      const action = field.repairAction || 'review_only'
      const current = actionMap.get(action) || {
        action,
        label: field.repairLabel || 'דורש בדיקה לפני תיקון',
        reason: field.repairReason || '',
        documentIds: new Set(),
        fieldCount: 0,
      }
      current.documentIds.add(document.documentId)
      current.fieldCount += 1
      actionMap.set(action, current)
    })
  })

  const groups = Array.from(actionMap.values()).map(group => ({
    ...group,
    documentCount: group.documentIds.size,
  }))
  const safeDocuments = documents.filter(document => (
    document.fields.length > 0 &&
    document.fields.every(field => field.repairAction === 'safe_structure')
  )).length

  return (
    <Box sx={sx.dataHealthRepairPreview}>
      <Box sx={sx.dataHealthRepairPreviewHeader}>
        <Box sx={{ minWidth: 0 }}>
          <Typography level='title-sm' sx={sx.sectionTitle}>
            תוכנית תיקון לכל המסמכים
          </Typography>
          <Typography level='body-xs' sx={sx.healthFindingDescription}>
            {issueTitle} · {documents.length} מסמכים
          </Typography>
        </Box>

        <Chip
          size='sm'
          variant='soft'
          color={safeDocuments === documents.length ? 'success' : 'warning'}
        >
          {safeDocuments} מוכנים לתיקון בטוח
        </Chip>
      </Box>

      <Typography level='body-xs' sx={sx.healthFindingDescription}>
        זו הכנה בלבד מתוך תוצאות הבדיקה שכבר בזיכרון. לא מתבצעת קריאה נוספת ולא נכתב דבר למסמכים.
      </Typography>

      <Stack spacing={0.5}>
        {groups.map(group => (
          <Box key={group.action} sx={sx.dataHealthRepairGroup}>
            <Box sx={sx.dataHealthRepairGroupHeader}>
              <Typography level='body-sm' sx={{ fontWeight: 700 }}>
                {group.label}
              </Typography>
              <Stack direction='row' spacing={0.4}>
                <Chip size='sm' variant='soft'>
                  {group.documentCount} מסמכים
                </Chip>
                <Chip size='sm' variant='soft'>
                  {group.fieldCount} שדות
                </Chip>
              </Stack>
            </Box>

            {group.reason ? (
              <Typography level='body-xs' sx={sx.healthFindingDescription}>
                {group.reason}
              </Typography>
            ) : null}
          </Box>
        ))}
      </Stack>

      {safeDocuments !== documents.length ? (
        <Typography level='body-xs' color='warning'>
          אין אפשרות לבצע תיקון גורף עד שכל המסמכים במסלול הזה מסווגים כתיקון בטוח.
        </Typography>
      ) : null}
    </Box>
  )
}

function DataHealthPointRepairPreview({ document }) {
  if (!document) return null

  const grouped = document.fields.reduce((result, field) => {
    const key = field.repairAction || 'review_only'
    const current = result.get(key) || {
      action: key,
      label: field.repairLabel || 'דורש בדיקה לפני תיקון',
      reason: field.repairReason || '',
      fields: [],
    }
    current.fields.push(field)
    result.set(key, current)
    return result
  }, new Map())
  const groups = Array.from(grouped.values())

  return (
    <Box sx={sx.dataHealthRepairPreview}>
      <Box sx={sx.dataHealthRepairPreviewHeader}>
        <Box sx={{ minWidth: 0 }}>
          <Typography level='title-sm' sx={sx.sectionTitle}>
            תוכנית תיקון נקודתית
          </Typography>
          <Typography level='body-xs' sx={sx.dataHealthRepairPreviewDocument}>
            {document.documentId}
          </Typography>
        </Box>

        <Stack direction='row' spacing={0.4} useFlexGap flexWrap='wrap'>
          {document.seasons.map(season => (
            <Chip key={season} size='sm' variant='soft'>
              {season}
            </Chip>
          ))}
        </Stack>
      </Box>

      <Typography level='body-xs' sx={sx.healthFindingDescription}>
        התוכנית מבוססת רק על הנתונים שכבר נקראו. לא בוצעה קריאה נוספת ולא בוצע תיקון.
      </Typography>

      <Stack spacing={0.5}>
        {groups.map(group => (
          <Box key={group.action} sx={sx.dataHealthRepairGroup}>
            <Box sx={sx.dataHealthRepairGroupHeader}>
              <Typography level='body-sm' sx={{ fontWeight: 700 }}>
                {group.label}
              </Typography>
              <Chip size='sm' variant='soft' color={
                group.action === 'safe_structure' ? 'success' : 'warning'
              }>
                {group.fields.length}
              </Chip>
            </Box>

            {group.reason ? (
              <Typography level='body-xs' sx={sx.healthFindingDescription}>
                {group.reason}
              </Typography>
            ) : null}

            <Stack spacing={0.2}>
              {group.fields.slice(0, 6).map(field => (
                <Typography
                  key={`${field.path}-${field.seasonKey}`}
                  level='body-xs'
                  sx={sx.dataHealthRepairField}
                >
                  {field.path} · {field.seasonKey}
                </Typography>
              ))}
              {group.fields.length > 6 ? (
                <Typography level='body-xs' sx={sx.healthFindingDescription}>
                  ועוד {group.fields.length - 6} שדות
                </Typography>
              ) : null}
            </Stack>
          </Box>
        ))}
      </Stack>
    </Box>
  )
}

function DataHealthDrilldown({
  result,
  issueType,
  onClose,
}) {
  const [visibleDocumentCount, setVisibleDocumentCount] = React.useState(5)
  const [selectedDocumentId, setSelectedDocumentId] = React.useState('')
  const [showGroupRepairPreview, setShowGroupRepairPreview] = React.useState(false)

  React.useEffect(() => {
    setVisibleDocumentCount(5)
    setSelectedDocumentId('')
    setShowGroupRepairPreview(false)
  }, [result?.generatedAt, issueType])

  if (!result?.issueEntries?.length || !issueType) return null

  const activeIssue = result.issueEntries.find(issue => issue.type === issueType)
  if (!activeIssue) return null

  const documents = buildDataHealthDocumentGroups({
    result,
    issueType,
  })
  const visibleDocuments = documents.slice(0, visibleDocumentCount)
  const selectedDocument = documents.find(document => (
    document.documentId === selectedDocumentId
  )) || null
  const description = DATA_HEALTH_ISSUE_DESCRIPTIONS[issueType] || (
    'המסמכים שנמצאו אינם תואמים באופן מלא למבנה הנוכחי.'
  )

  return (
    <Box sx={sx.dataHealthDrilldown}>
      <Box sx={sx.dataHealthDrilldownHeader}>
        <Box sx={sx.dataHealthDrilldownToolbar}>
          <Box sx={sx.dataHealthDrilldownPrimaryActions}>
            <Chip size='sm' variant='soft' color='warning'>
              {documents.length}
            </Chip>

            <Tooltip title='הורד אקסל' placement='top'>
              <IconButton
                size='sm'
                variant='outlined'
                color='neutral'
                aria-label='הורד אקסל'
                onClick={() => exportDataHealthIssueToXlsx({
                  result,
                  issueType,
                  issueTitle: activeIssue.title,
                })}
              >
                <Box
                  component='svg'
                  viewBox='0 0 24 24'
                  aria-hidden='true'
                  sx={{
                    width: 18,
                    height: 18,
                    fill: 'none',
                    stroke: 'currentColor',
                    strokeWidth: 1.8,
                    strokeLinecap: 'round',
                    strokeLinejoin: 'round',
                  }}
                >
                  <path d='M12 3v11' />
                  <path d='m8 10 4 4 4-4' />
                  <path d='M5 19h14' />
                </Box>
              </IconButton>
            </Tooltip>

            <Button
              size='sm'
              variant={showGroupRepairPreview ? 'soft' : 'outlined'}
              color='warning'
              sx={sx.dataHealthGroupRepairButton}
              onClick={() => {
                setSelectedDocumentId('')
                setShowGroupRepairPreview(current => !current)
              }}
            >
              {showGroupRepairPreview ? 'סגור תוכנית תיקון' : 'הכן תיקון לכל המסמכים'}
            </Button>
          </Box>

          <Tooltip title='סגור פירוט' placement='top'>
            <IconButton
              size='sm'
              variant='plain'
              color='neutral'
              aria-label='סגור פירוט'
              onClick={onClose}
            >
              <Box
                component='svg'
                viewBox='0 0 24 24'
                aria-hidden='true'
                sx={{
                  width: 16,
                  height: 16,
                  fill: 'none',
                  stroke: 'currentColor',
                  strokeWidth: 1.8,
                  strokeLinecap: 'round',
                }}
              >
                <path d='m6 6 12 12' />
                <path d='M18 6 6 18' />
              </Box>
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Typography level='body-xs' sx={sx.healthFindingDescription}>
        {description}
      </Typography>

      <Typography level='body-xs' sx={sx.dataHealthTooltipHint}>
        העבר את הסמן על המזהה כדי לראות את השדות; אייקון התיקון בודק רק את המסמך שנבחר ומציג אם לכל שדה קיים מסלול תיקון בטוח.
      </Typography>

      <Box sx={sx.dataHealthDocumentChips}>
        {visibleDocuments.map(document => (
          <Box key={document.documentId} sx={sx.dataHealthDocumentAction}>
            <Tooltip
              placement='top'
              variant='outlined'
              title={(
                <DataHealthDocumentTooltip
                  document={document}
                  issueType={issueType}
                />
              )}
            >
              <Chip
                size='sm'
                variant={selectedDocumentId === document.documentId ? 'solid' : 'soft'}
                color={selectedDocumentId === document.documentId ? 'primary' : 'neutral'}
                sx={sx.dataHealthDocumentChip}
              >
                {document.documentId}
              </Chip>
            </Tooltip>

            <Tooltip title='הכן תיקון נקודתי' placement='top'>
              <IconButton
                size='sm'
                variant={selectedDocumentId === document.documentId ? 'soft' : 'plain'}
                color={selectedDocumentId === document.documentId ? 'warning' : 'neutral'}
                aria-label={`הכן תיקון נקודתי למסמך ${document.documentId}`}
                sx={sx.dataHealthDocumentRepairButton}
                onClick={() => {
                  setShowGroupRepairPreview(false)
                  setSelectedDocumentId(current => (
                    current === document.documentId ? '' : document.documentId
                  ))
                }}
              >
                <Box
                  component='svg'
                  viewBox='0 0 24 24'
                  aria-hidden='true'
                  sx={{
                    width: 16,
                    height: 16,
                    fill: 'none',
                    stroke: 'currentColor',
                    strokeWidth: 1.8,
                    strokeLinecap: 'round',
                    strokeLinejoin: 'round',
                  }}
                >
                  <path d='M14.7 6.3a4 4 0 0 0-5 5L4 17l3 3 5.7-5.7a4 4 0 0 0 5-5l-2.2 2.2-3-3L14.7 6.3Z' />
                </Box>
              </IconButton>
            </Tooltip>
          </Box>
        ))}
      </Box>

      {showGroupRepairPreview ? (
        <DataHealthGroupRepairPreview
          documents={documents}
          issueTitle={activeIssue.title}
        />
      ) : null}

      <DataHealthPointRepairPreview document={selectedDocument} />

      {documents.length > 5 ? (
        <Box sx={sx.dataHealthMoreActions}>
          {visibleDocumentCount < documents.length ? (
            <Button
              size='sm'
              variant='plain'
              color='neutral'
              onClick={() => setVisibleDocumentCount(current => Math.min(
                current + 5,
                documents.length
              ))}
            >
              הצג עוד {Math.min(5, documents.length - visibleDocumentCount)} מסמכים
            </Button>
          ) : null}

          {visibleDocumentCount > 5 ? (
            <Button
              size='sm'
              variant='plain'
              color='neutral'
              onClick={() => setVisibleDocumentCount(5)}
            >
              צמצם
            </Button>
          ) : null}
        </Box>
      ) : null}
    </Box>
  )
}

function DataHealthAreaCard({
  area,
  result,
  busyScope,
  disabled,
  onRun,
}) {
  const [drilldownIssueType, setDrilldownIssueType] = React.useState('')
  const isBusy = busyScope === area.id
  const hasOtherBusy = Boolean(busyScope && !isBusy)

  React.useEffect(() => {
    setDrilldownIssueType('')
  }, [result?.generatedAt])

  return (
    <Box sx={sx.dataHealthAreaCard}>
      <Box sx={sx.dataHealthAreaHeader}>
        <Box sx={sx.dataHealthAreaCopy}>
          <Typography level='title-md' sx={sx.sectionTitle}>
            {area.title}
          </Typography>
          <Typography level='body-xs' sx={sx.dataHealthCollectionName}>
            {area.collectionName}
          </Typography>
        </Box>

        {result ? (
          <Chip
            size='sm'
            variant='soft'
            color={result.affected ? 'warning' : 'success'}
          >
            {result.exactRate}% התאמה
          </Chip>
        ) : (
          <Chip size='sm' variant='soft'>
            טרם נבדק
          </Chip>
        )}
      </Box>

      <Typography level='body-sm' sx={sx.auditChoiceDescription}>
        {area.description}
      </Typography>

      {result ? (
        <Box sx={sx.dataHealthAreaStats}>
          <Box>
            <Typography level='body-xs' sx={sx.summaryLabel}>
              נבדקו
            </Typography>
            <Typography level='title-lg' sx={sx.healthKpiValue}>
              {result.checked || 0}
            </Typography>
          </Box>
          <Box>
            <Typography level='body-xs' sx={sx.summaryLabel}>
              תואמים בדיוק
            </Typography>
            <Typography level='title-lg' sx={sx.healthKpiValue}>
              {result.exact || 0}
            </Typography>
          </Box>
          <Box>
            <Typography level='body-xs' sx={sx.summaryLabel}>
              דורשים יישור
            </Typography>
            <Typography level='title-lg' sx={sx.healthKpiValue}>
              {result.affected || 0}
            </Typography>
          </Box>
          <Box>
            <Typography level='body-xs' sx={sx.summaryLabel}>
              קריאות
            </Typography>
            <Typography level='title-lg' sx={sx.healthKpiValue}>
              {result.readsUsed || 0}
            </Typography>
          </Box>
        </Box>
      ) : null}

      {result?.issueEntries?.length ? (
        <Stack spacing={0.4}>
          {result.issueEntries.slice(0, 4).map(issue => (
            <Button
              key={issue.type}
              size='sm'
              variant={drilldownIssueType === issue.type ? 'soft' : 'plain'}
              color={drilldownIssueType === issue.type ? 'warning' : 'neutral'}
              sx={sx.dataHealthIssueButton}
              onClick={() => setDrilldownIssueType(current => (
                current === issue.type ? '' : issue.type
              ))}
            >
              <Box sx={sx.dataHealthIssueButtonContent}>
                <Typography level='body-xs' sx={sx.healthFindingDescription}>
                  {issue.title}
                </Typography>
                <Chip size='sm' variant='soft' color='warning'>
                  {issue.count}
                </Chip>
              </Box>
            </Button>
          ))}
        </Stack>
      ) : result ? (
        <Typography level='body-xs' color='success'>
          לא נמצאו חריגות בבדיקה הזאת.
        </Typography>
      ) : null}

      <DataHealthDrilldown
        result={result}
        issueType={drilldownIssueType}
        onClose={() => setDrilldownIssueType('')}
      />

      <Button
        variant={result ? 'outlined' : 'solid'}
        color={result?.affected ? 'warning' : 'primary'}
        loading={isBusy}
        disabled={disabled || hasOtherBusy}
        onClick={() => onRun(area.id)}
      >
        {result ? `בדוק שוב את ${area.title}` : area.buttonLabel}
      </Button>
    </Box>
  )
}

function DataHealthAreasPanel({
  results,
  busyScope,
  disabled,
  onRun,
}) {
  const safeResults = results && typeof results === 'object'
    ? results
    : {}
  const completedResults = DATA_HEALTH_AREAS
    .map(area => safeResults[area.id])
    .filter(Boolean)
  const totalChecked = completedResults.reduce(
    (sum, result) => sum + Number(result.checked || 0),
    0
  )
  const totalExact = completedResults.reduce(
    (sum, result) => sum + Number(result.exact || 0),
    0
  )
  const totalAffected = completedResults.reduce(
    (sum, result) => sum + Number(result.affected || 0),
    0
  )
  const totalReads = completedResults.reduce(
    (sum, result) => sum + Number(result.readsUsed || 0),
    0
  )
  const exactRate = totalChecked
    ? Math.round((totalExact / totalChecked) * 1000) / 10
    : null

  return (
    <Stack spacing={1.25}>
      <Box sx={sx.dataHealthIntro}>
        <Box>
          <Typography level='title-md' sx={sx.sectionTitle}>
            מצב הדאטה לפי אוסף
          </Typography>
          <Typography level='body-sm' sx={sx.auditChoiceDescription}>
            כל כפתור קורא רק את האוכלוסייה שבחרת. לפני הסריקה יוצג אישור, והבדיקות כאן אינן כותבות או מוחקות נתונים.
          </Typography>
        </Box>

        {completedResults.length ? (
          <Box sx={sx.dataHealthSummaryLine}>
            <Chip size='sm' variant='soft' color='success'>
              {exactRate}% התאמה באזורים שנבדקו
            </Chip>
            <Typography level='body-xs' sx={sx.healthFindingDescription}>
              {totalChecked} נבדקו · {totalExact} תואמים · {totalAffected} דורשים יישור · {totalReads} קריאות
            </Typography>
          </Box>
        ) : null}
      </Box>

      <Box sx={sx.dataHealthAreaGrid}>
        {DATA_HEALTH_AREAS.map(area => (
          <DataHealthAreaCard
            key={area.id}
            area={area}
            result={safeResults[area.id]}
            busyScope={busyScope}
            disabled={disabled}
            onRun={onRun}
          />
        ))}
      </Box>

      <Box sx={sx.dataHealthCoverageNote}>
        <Typography level='body-xs' sx={sx.healthFindingDescription}>
          הבדיקות הנפרדות מודדות את תקינות המסמכים בתוך האוסף שנבחר. התאמה בין אוספים, כגון קבוצה מול שחקן או שחקן מול אינדקס, נשארת בבדיקה המערכתית המתקדמת.
        </Typography>
      </Box>
    </Stack>
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
  globalAudit,
  globalRepairPreview,
  globalDirectRepairResult,
  globalRegularRepairResult,
  globalSelectedRepairResult,
  globalOverlapRepairResult,
  engineRefreshPreview,
  engineRefreshResult,
  documentRewritePreview,
  documentRewriteResult,
  partialAuditDefaults,
  dataHealthResults,
  dataHealthBusyScope,
  onRunDataHealth,
  onRunFull,
  onRunGlobalPreview,
  onGlobalDirectRepairApply,
  onGlobalRegularRepairApply,
  onGlobalSelectedRepairApply,
  onGlobalSafeDependencyOverlapRepairApply,
  onGlobalOverlapRepairApply,
  onRunPartial,
  onDownload,
  onRepairPreview,
  onRepairApply,
  onEngineRefreshPreview,
  onEngineRefreshApply,
  onDocumentRewritePreview,
  onDocumentRewriteApply,
  onClose,
}) {
  const [auditMode, setAuditMode] = React.useState('health')
  const [scopeTeamDocumentId, setScopeTeamDocumentId] = React.useState('')
  const [scopeSeasonKey, setScopeSeasonKey] = React.useState('')
  const [selectedIssueIds, setSelectedIssueIds] = React.useState([])

  React.useEffect(() => {
    if (!open) return

    setScopeTeamDocumentId(clean(partialAuditDefaults?.teamDocumentId))
    setScopeSeasonKey(
      clean(partialAuditDefaults?.seasonKey).replace(/_/g, '/')
    )
  }, [
    open,
    partialAuditDefaults?.seasonKey,
    partialAuditDefaults?.teamDocumentId,
  ])

  React.useEffect(() => {
    setSelectedIssueIds([])
  }, [audit?.generatedAt])


  const summary = audit?.summary || {}
  const issues = Array.isArray(audit?.issues)
    ? audit.issues
    : []
  const previewSummary = repairPreview?.summary || {}
  const enginePreviewSummary = engineRefreshPreview?.summary || {}
  const engineTeamFieldCounts = enginePreviewSummary.teamFieldCounts || {}
  const enginePlayerFieldCounts = enginePreviewSummary.playerFieldCounts || {}
  const engineSearchFieldCounts = enginePreviewSummary.searchIndexFieldCounts || {}
  const rewriteSummary = documentRewritePreview?.summary || {}
  const rewriteCost = documentRewritePreview?.cost || {}
  const auditCost = audit?.cost?.audit || {}
  const auditReadSafety = audit?.cost?.readSafety || audit?.readSafety || {}
  const runtimeCost = audit?.cost?.runtime || {}
  const runtimeFlows = runtimeCost.flows || {}
  const runtimeRisks = Array.isArray(runtimeCost.risks) ? runtimeCost.risks : []
  const repairCost = repairPreview?.cost || {}
  const repairReads = repairCost.reads || {}
  const repairWrites = repairCost.writes || {}
  const repairAffected = repairCost.affected || {}
  const repairVerification = repairCost.verification || {}
  const directSearchIndexCost = repairCost.directSearchIndex || {}
  const directRepairReads = Number(
    directSearchIndexCost.readsMaximum || 0
  )
  const directVerificationReads = Number(
    directSearchIndexCost.verificationReadsMaximum || 0
  )
  const directWrites = Number(
    directSearchIndexCost.writesMaximum || 0
  )
  const repairRoutes = Array.isArray(repairPreview?.repairRoutes)
    ? repairPreview.repairRoutes
    : []
  const shadow = audit?.shadow || null
  const shadowSummary = shadow?.summary || {}
  const shadowChangedRows = Array.isArray(shadow?.changedRows)
    ? shadow.changedRows.slice(0, 100)
    : []
  const actionableIssues = issues.filter(issue => issue.repairable !== false)
  const selectableIssues = issues.filter(issue => (
    issue?.repair?.selectable === true
  ))
  const selectedIssueIdSet = new Set(selectedIssueIds)
  const selectedIssues = selectableIssues.filter(issue => (
    selectedIssueIdSet.has(clean(issue.issueId))
  ))
  const selectableIssueTypes = selectableIssues.reduce((result, issue) => {
    const issueType = clean(issue.type)
    const issueId = clean(issue.issueId)
    if (!issueType || !issueId) return result

    const current = result.get(issueType) || {
      type: issueType,
      title: getPlayerScoutIssueDefinition(issueType)?.title || issueType,
      issueIds: [],
    }
    current.issueIds.push(issueId)
    result.set(issueType, current)
    return result
  }, new Map())
  const selectableIssueTypeGroups = [...selectableIssueTypes.values()]
    .sort((left, right) => left.title.localeCompare(right.title, 'he'))
  const visibleIssues = actionableIssues.slice(0, 250)
  const coverage = audit?.contract?.coverage || null
  const coverageSummary = coverage?.summary || {}
  const readPlan = audit?.readPlan || null
  const auditScope = audit?.scope || null
  const scopedAuditReady = Boolean(
    clean(scopeTeamDocumentId) &&
    clean(scopeSeasonKey)
  )
  const narrativeIssues = issues.filter(issue => (
    issue.type === 'player_narrative_schema_invalid'
  ))
  const schemaReportOnlyIssuesCount = Number(summary.schemaReportOnlyIssuesCount || 0)
  const collectionHealth = buildPlayerScoutCollectionHealth({ issues, auditCost })
  const health = buildPlayerScoutHealthSummary({
    issues,
    summary,
    collectionHealth,
  })
  const globalIssues = Array.isArray(globalAudit?.issues)
    ? globalAudit.issues
    : []
  const globalSummary = globalAudit?.summary || {}
  const globalAuditCost = globalAudit?.cost?.audit || {}
  const globalCollectionHealth = buildPlayerScoutCollectionHealth({
    issues: globalIssues,
    auditCost: globalAuditCost,
  })
  const globalHealth = buildPlayerScoutHealthSummary({
    issues: globalIssues,
    summary: globalSummary,
    collectionHealth: globalCollectionHealth,
  })
  const needsVerification = !!(
    repairResult || engineRefreshResult || documentRewriteResult
  )
  const quietDetails = [
    `פערי מדידה ${summary.measurementIssuesCount || 0}`,
    `פערי מעקב שחקנים ${summary.trackingIssuesCount || 0}`,
    `פערי מסמך חיפוש ${summary.projectionIssuesCount || 0}`,
    `פערי מצב סקאוטינג ${summary.stateIssuesCount || 0}`,
    `פערי פרופיל ${summary.rowsWithProfileDiff || 0}`,
    `קריאות למסד הנתונים ${auditCost.reads?.total || 0}`,
  ].join(' · ')


  const runScopedAudit = () => {
    if (!scopedAuditReady || typeof onRunPartial !== 'function') return

    onRunPartial({
      teamDocumentId: clean(scopeTeamDocumentId),
      seasonKey: clean(scopeSeasonKey),
    })
  }

  const toggleSelectedIssue = issueId => {
    const safeIssueId = clean(issueId)
    if (!safeIssueId) return

    setSelectedIssueIds(current => (
      current.includes(safeIssueId)
        ? current.filter(value => value !== safeIssueId)
        : [...current, safeIssueId]
    ))
  }

  const toggleSelectedIssueType = issueType => {
    const group = selectableIssueTypes.get(clean(issueType))
    if (!group) return

    setSelectedIssueIds(current => {
      const currentSet = new Set(current.map(clean).filter(Boolean))
      const groupIds = group.issueIds.map(clean).filter(Boolean)
      const allSelected = groupIds.every(issueId => currentSet.has(issueId))

      groupIds.forEach(issueId => {
        if (allSelected) {
          currentSet.delete(issueId)
        } else {
          currentSet.add(issueId)
        }
      })

      return [...currentSet]
    })
  }

  const selectAllRepairableIssues = () => {
    setSelectedIssueIds(
      selectableIssues.map(issue => clean(issue.issueId)).filter(Boolean)
    )
  }

  const clearSelectedIssues = () => {
    setSelectedIssueIds([])
  }

  let primaryAction = {
    label: audit ? 'בדוק שוב קבוצה ועונה' : 'בדוק קבוצה ועונה',
    description: 'בדיקה ממוקדת של הקבוצה והעונה בלבד, עם מגבלת קריאות קשיחה.',
    onClick: runScopedAudit,
    color: 'primary',
    disabled: !scopedAuditReady,
  }

  if (
    repairResult?.targetedVerification?.executed === true
  ) {
    const remainingIssues = Number(
      repairResult.targetedVerification.remainingIssuesCount || 0
    )

    primaryAction = remainingIssues
      ? {
          label: 'בדוק שוב את הקבוצה והעונה',
          description: `האימות הממוקד השאיר ${remainingIssues} בעיות. הרץ בדיקה ממוקדת מחדש לפני תיקון נוסף.`,
          onClick: runScopedAudit,
          color: 'warning',
          disabled: !scopedAuditReady,
        }
      : {
          label: 'התיקון אומת',
          description: 'האימות הממוקד הסתיים ולא מצא את הבעיות שנבחרו.',
          onClick: null,
          color: 'success',
          disabled: true,
        }
  } else if (engineRefreshPreview && health.engineCount) {
    primaryAction = {
      label: 'רענן את מצב הסקאוטינג',
      description: 'מצב הסקאוטינג יחושב מחדש לפני תיקוני סנכרון, ורק ליעדים שהוצגו בתצוגה המקדימה.',
      onClick: onEngineRefreshApply,
      color: 'primary',
    }
  } else if (health.engineCount) {
    primaryAction = {
      label: 'בדוק רענון מצב הסקאוטינג',
      description: 'לפני תיקוני סנכרון נבדוק אילו מצבי סקאוטינג דורשים חישוב מחדש. לא תתבצע כתיבה בשלב הזה.',
      onClick: onEngineRefreshPreview,
      color: 'primary',
    }
  } else if (repairPreview && health.repairableCount) {
    primaryAction = {
      label: 'בצע את התיקון המוצע',
      description: 'התיקון יטפל רק בפערי הסנכרון והנתונים שנותרו לאחר שמצב הסקאוטינג מעודכן.',
      onClick: onRepairApply,
      color: 'warning',
    }
  } else if (health.repairableCount) {
    primaryAction = {
      label: selectedIssues.length
        ? `הצג תיקון ל-${selectedIssues.length} בעיות`
        : 'בחר בעיות לתיקון',
      description: selectedIssues.length
        ? 'לפני כתיבה תוצג רשימת הבעיות שנבחרו והערכת העלות שלהן בלבד.'
        : 'יש לבחור במפורש את הבעיות שרוצים לתקן. לא מתבצע תיקון גורף אוטומטי.',
      onClick: selectedIssues.length
        ? () => onRepairPreview({
            selectedIssueIds: selectedIssues.map(issue => issue.issueId),
          })
        : null,
      color: 'warning',
      disabled: !selectedIssues.length,
    }
  }

  return (
    <RegularModal
      open={open}
      title='מצב הדאטה ובדיקת תקינות'
      description='תמונה ברורה של מצב הנתונים בשלושת האוספים, עם הפרדה בין מסמכים תקינים, מסמכים שדורשים יישור ומסמכים חסרים.'
      iconId='search'
      size='xl'
      busy={busy}
      hideFooter
      contentSx={sx.modalContent}
      onClose={onClose}
    >
      <Box sx={sx.content}>
        <Box sx={sx.auditModeSelector}>
          <Button
            size='sm'
            variant={auditMode === 'health' ? 'solid' : 'outlined'}
            color='primary'
            onClick={() => setAuditMode('health')}
          >
            מצב הדאטה
          </Button>
          <Button
            size='sm'
            variant={auditMode === 'scoped' ? 'solid' : 'outlined'}
            color='primary'
            onClick={() => setAuditMode('scoped')}
          >
            בדיקה ממוקדת
          </Button>
          <Button
            size='sm'
            variant={auditMode === 'global' ? 'solid' : 'outlined'}
            color='warning'
            onClick={() => setAuditMode('global')}
          >
            כלי מיגרציה
          </Button>
        </Box>

        {auditMode === 'health' ? (
          <DataHealthAreasPanel
            results={dataHealthResults}
            busyScope={dataHealthBusyScope}
            disabled={busy || repairBusy}
            onRun={onRunDataHealth}
          />
        ) : null}

        {auditMode === 'global' ? (
          <Stack spacing={1.25}>
            {globalAudit ? (
              <DataHealthOverview
                health={globalHealth}
                collectionHealth={globalCollectionHealth}
                scopeLabel='כל מאגר הנתונים שנכלל בבדיקה האחרונה'
              />
            ) : (
              <Box sx={sx.healthStartBox}>
                <Box sx={sx.healthStartCopy}>
                  <Typography level='title-md' sx={sx.sectionTitle}>
                    בדיקה מערכתית מלאה
                  </Typography>
                  <Typography level='body-sm' sx={sx.auditChoiceDescription}>
                    בדיקה רוחבית שמצליבה בין האוספים ומשמשת למיגרציה או לבקרה עמוקה. היא עלולה לבצע אלפי קריאות.
                  </Typography>
                </Box>

                <Button
                  variant='outlined'
                  color='warning'
                  loading={busy}
                  disabled={busy || repairBusy}
                  onClick={onRunFull}
                >
                  בדוק את כל המערכת
                </Button>
              </Box>
            )}

            {globalAudit ? (
              <Box component='details' sx={sx.advancedToolsBox}>
                <Box component='summary' sx={sx.detailsSummary}>
                  <Box>
                    <Typography level='title-sm' sx={sx.sectionTitle}>
                      כלי תיקון למיגרציה
                    </Typography>
                    <Typography level='body-xs' sx={sx.healthFindingDescription}>
                      פעולות כתיבה נשארות סגורות כאן ואינן חלק מתמונת מצב הדאטה.
                    </Typography>
                  </Box>
                  <Chip size='sm' variant='soft' color='warning'>
                    מתקדם
                  </Chip>
                </Box>

                <GlobalRepairPreviewPanel
                  busy={busy}
                  repairBusy={repairBusy}
                  globalAudit={globalAudit}
                  preview={globalRepairPreview}
                  directRepairResult={globalDirectRepairResult}
                  regularRepairResult={globalRegularRepairResult}
                  selectedRepairResult={globalSelectedRepairResult}
                  overlapRepairResult={globalOverlapRepairResult}
                  onRunFull={onRunFull}
                  onRunPreview={onRunGlobalPreview}
                  onDirectRepairApply={onGlobalDirectRepairApply}
                  onRegularRepairApply={onGlobalRegularRepairApply}
                  onSelectedRepairApply={onGlobalSelectedRepairApply}
                  onSafeDependencyOverlapRepairApply={onGlobalSafeDependencyOverlapRepairApply}
                  onOverlapRepairApply={onGlobalOverlapRepairApply}
                />
              </Box>
            ) : null}
          </Stack>
        ) : null}

        {auditMode === 'scoped' && !audit ? (
          <Box sx={sx.auditChoiceGrid}>
            <Box sx={[sx.auditChoiceCard, sx.auditChoiceCardPrimary]}>
              <Box sx={sx.auditChoiceCopy}>
                <Box sx={sx.auditChoiceTitleRow}>
                  <Typography level='title-md' sx={sx.sectionTitle}>
                    בדיקת קבוצה ועונה
                  </Typography>
                  <Chip size='sm' variant='soft' color='success'>
                    מומלץ
                  </Chip>
                </Box>

                <Typography level='body-sm' sx={sx.auditChoiceDescription}>
                  בדיקה ממוקדת של קבוצה ועונה אחת. הבדיקה אינה משנה נתונים ומוגנת בתקציב של עד 150 קריאות.
                </Typography>

                <Box sx={sx.scopeFields}>
                  <Input
                    size='sm'
                    placeholder='מזהה מסמך קבוצה'
                    value={scopeTeamDocumentId}
                    onChange={event => setScopeTeamDocumentId(event.target.value)}
                  />
                  <Input
                    size='sm'
                    placeholder='עונה, לדוגמה 25/26'
                    value={scopeSeasonKey}
                    onChange={event => setScopeSeasonKey(event.target.value)}
                  />
                </Box>
              </Box>

              <Button
                variant='solid'
                color='primary'
                loading={busy}
                disabled={busy || repairBusy || !scopedAuditReady}
                startDecorator={!busy ? iconUi({ id: 'search', size: 'sm' }) : null}
                onClick={runScopedAudit}
              >
                בדוק קבוצה ועונה
              </Button>
            </Box>

          </Box>
        ) : null}

        {error ? (
          <Typography level='body-sm' color='danger'>
            {error}
          </Typography>
        ) : null}

        {auditMode === 'scoped' && audit ? (
          <Box sx={sx.auditStatusBox}>
            <DataHealthOverview
              health={health}
              collectionHealth={collectionHealth}
              scopeLabel={`קבוצה ${auditScope?.teamDocumentId || '-'} · עונה ${clean(auditScope?.seasonKey).replace(/_/g, '/') || '-'}`}
            />

            <Box sx={sx.scopeStatusBox}>
              <Box sx={sx.scopeStatusHeader}>
                <Box>
                  <Typography level='title-sm' sx={sx.sectionTitle}>
                    תחום הבדיקה
                  </Typography>
                  <Typography level='body-xs' sx={sx.auditChoiceDescription}>
                    קבוצה {auditScope?.teamDocumentId || '-'} · עונה {clean(auditScope?.seasonKey).replace(/_/g, '/') || '-'}
                  </Typography>
                </Box>

                <Chip size='sm' variant='soft' color='primary'>
                  בדיקה ממוקדת
                </Chip>
              </Box>

              <Box sx={sx.coverageGrid}>
                <SummaryCard
                  label='בדיקות שבוצעו'
                  value={coverageSummary.executedCount || 0}
                  tone='success'
                />
                <SummaryCard
                  label='בדיקות שדולגו'
                  value={coverageSummary.skippedCount || 0}
                />
                <SummaryCard
                  label='בדיקות שנחסמו'
                  value={coverageSummary.blockedCount || 0}
                  tone={coverageSummary.blockedCount ? 'warning' : 'success'}
                />
                <SummaryCard
                  label='קריאות'
                  value={`${auditReadSafety.readsUsed || 0}/${auditReadSafety.safetyLimit || 150}`}
                  tone={
                    Number(auditReadSafety.readsUsed || 0) >=
                    Number(auditReadSafety.safetyLimit || 150)
                      ? 'warning'
                      : 'neutral'
                  }
                />
              </Box>

              {readPlan ? (
                <Typography level='body-xs' sx={sx.costNote}>
                  תכנון מוקדם: {readPlan.estimatedReads?.total || 0} קריאות משוערות · מגבלה אפקטיבית {readPlan.budget?.effectiveLimit || 150}.
                </Typography>
              ) : null}
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
                disabled={
                  busy ||
                  repairBusy ||
                  primaryAction.disabled === true
                }
                onClick={primaryAction.onClick || undefined}
              >
                {primaryAction.label}
              </Button>
            </Box>

            <Box sx={sx.repairActionBar}>
              <Box sx={sx.repairActionCopy}>
                <Typography level='title-sm' sx={sx.sectionTitle}>
                  תיקון נתונים
                </Typography>
                <Typography level='body-xs' sx={sx.auditChoiceDescription}>
                  {selectableIssues.length
                    ? `${selectableIssues.length} בעיות ניתנות לתיקון · נבחרו ${selectedIssues.length}`
                    : 'לא נמצאו כרגע בעיות שניתנות לתיקון בתחום שנבדק.'}
                </Typography>
              </Box>

              <Stack direction='row' spacing={0.75}>
                <Button
                  size='sm'
                  variant='outlined'
                  color='warning'
                  disabled={
                    busy ||
                    repairBusy ||
                    !selectedIssues.length ||
                    Boolean(repairPreview)
                  }
                  onClick={() => onRepairPreview({
                    selectedIssueIds: selectedIssues.map(issue => issue.issueId),
                  })}
                >
                  הצג תיקון נבחר
                </Button>

                <Button
                  size='sm'
                  variant='solid'
                  color='warning'
                  loading={repairBusy}
                  disabled={
                    busy ||
                    repairBusy ||
                    !repairPreview
                  }
                  onClick={onRepairApply}
                >
                  בצע תיקון
                </Button>
              </Stack>
            </Box>


            {selectableIssues.length ? (
              <Box sx={sx.repairSelectionBox}>
                <Box sx={sx.repairSelectionHeader}>
                  <Box>
                    <Typography level='title-sm' sx={sx.sectionTitle}>
                      בחירת בעיות לתיקון
                    </Typography>
                    <Typography level='body-xs' sx={sx.auditChoiceDescription}>
                      תיקון יתבצע רק לבעיות שסומנו כאן. הבחירה עצמה אינה מבצעת כתיבה; לפני כתיבה תוצג תצוגה מקדימה.
                    </Typography>
                  </Box>

                  <Stack direction='row' spacing={0.75}>
                    <Button
                      size='sm'
                      variant='outlined'
                      color='neutral'
                      onClick={selectAllRepairableIssues}
                    >
                      בחר הכל
                    </Button>
                    <Button
                      size='sm'
                      variant='plain'
                      color='neutral'
                      disabled={!selectedIssueIds.length}
                      onClick={clearSelectedIssues}
                    >
                      נקה
                    </Button>
                  </Stack>
                </Box>

                {selectableIssueTypeGroups.length ? (
                  <Box sx={sx.repairTypeSelector}>
                    <Typography level='body-xs' sx={sx.repairTypeSelectorLabel}>
                      סמן לפי סוג תקלה:
                    </Typography>

                    <Box sx={sx.repairTypeChipWrap}>
                      {selectableIssueTypeGroups.map(group => {
                        const selectedCount = group.issueIds.filter(issueId => (
                          selectedIssueIdSet.has(issueId)
                        )).length
                        const isSelected = selectedCount === group.issueIds.length
                        const isPartial = selectedCount > 0 && !isSelected

                        return (
                          <Chip
                            key={group.type}
                            size='sm'
                            variant={isSelected ? 'solid' : 'soft'}
                            color={isSelected ? 'warning' : isPartial ? 'primary' : 'neutral'}
                            onClick={() => toggleSelectedIssueType(group.type)}
                            sx={sx.repairTypeChip}
                          >
                            {group.title} ({group.issueIds.length})
                          </Chip>
                        )
                      })}
                    </Box>
                  </Box>
                ) : null}

                <Stack spacing={0.5} sx={sx.repairSelectionList}>
                  {selectableIssues.slice(0, 100).map(issue => {
                    const definition = getPlayerScoutIssueDefinition(issue.type)
                    const issueId = clean(issue.issueId)
                    const missingPlayerDocumentReason =
                      formatMissingPlayerDocumentReason(issue)
                    const missingPlayerDocumentProfiles =
                      formatMissingPlayerDocumentProfiles(issue)

                    return (
                      <Box key={issueId} sx={sx.repairSelectionRow}>
                        <Checkbox
                          checked={selectedIssueIdSet.has(issueId)}
                          onChange={() => toggleSelectedIssue(issueId)}
                        />

                        <Box sx={sx.repairSelectionCopy}>
                          <Typography level='body-sm' sx={sx.healthFindingTitle}>
                            {definition?.title || issue.type}
                          </Typography>
                          <Typography level='body-xs' sx={sx.healthFindingDescription}>
                            {issue.fullName || issue.teamName || 'קבוצה'} · {clean(issue.seasonKey || issue.seasonId).replace(/_/g, '/')}
                          </Typography>
                          {missingPlayerDocumentReason ? (
                            <Typography level='body-xs' sx={sx.healthFindingDescription}>
                              סיבה: {missingPlayerDocumentReason}
                              {missingPlayerDocumentReason.includes('PROFILE') && missingPlayerDocumentProfiles
                                ? ` · פרופילים: ${missingPlayerDocumentProfiles}`
                                : ''}
                            </Typography>
                          ) : null}
                        </Box>

                        <Chip size='sm' variant='soft' color='warning'>
                          נבחר לתיקון
                        </Chip>
                      </Box>
                    )
                  })}
                </Stack>
              </Box>
            ) : null}


            <Typography level='body-xs' sx={sx.costNote}>
              פירוט הבדיקה: {quietDetails} · מידע לבדיקה בלבד {schemaReportOnlyIssuesCount}
            </Typography>
          </Box>
        ) : null}

        {auditMode === 'scoped' && audit?.cost?.audit ? (
          <Typography level='body-xs' sx={sx.costNote}>
            מסמכים שנבדקו: קבוצות {auditCost.documentsObserved?.teamDocuments || 0} · שחקנים {auditCost.documentsObserved?.playerDocuments || 0} · מסמכי חיפוש שחקנים {auditCost.documentsObserved?.playerSearchIndexes || 0} · מסמכי חיפוש קבוצות {auditCost.documentsObserved?.teamSearchIndexes || 0} · בדיקות התאמה למסמכי שחקן {auditCost.documentsObserved?.playerDocumentLookups || 0}.
          </Typography>
        ) : null}

        {auditMode === 'scoped' && audit && auditReadSafety.hardLimit ? (
          <Typography level='body-xs' sx={sx.costNote}>
            בטיחות קריאות: הבדיקה מוגבלת לעד {auditReadSafety.safetyLimit || 0} קריאות מתוך תקרה קשיחה של {auditReadSafety.hardLimit || 0}. בבדיקה הנוכחית בוצעו {auditReadSafety.readsUsed || 0} קריאות ונשאר תקציב של {auditReadSafety.remainingBudget || 0}.
          </Typography>
        ) : null}

        {auditMode === 'scoped' && repairResult?.targetedVerification?.executed ? (
          <Box sx={sx.verificationResultBox}>
            <Typography level='title-sm' sx={sx.sectionTitle}>
              אימות ממוקד לאחר התיקון
            </Typography>
            <Typography level='body-sm'>
              אומתו {repairResult.targetedVerification.verifiedIssuesCount || 0} בעיות · נשארו {repairResult.targetedVerification.remainingIssuesCount || 0} · בוצעו {repairResult.targetedVerification.readsUsed || 0} קריאות.
            </Typography>
          </Box>
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

        {auditMode === 'scoped' && audit?.cost?.runtime ? (
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

        {auditMode === 'scoped' && shadow ? (
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
              שער הקשר קבוצה: open_context {shadowSummary.teamGateModeCounts?.open_context || 0} · legacy_filter {shadowSummary.teamGateModeCounts?.legacy_filter || 0} · לא זמין {shadowSummary.teamGateModeCounts?.unavailable || 0}.
            </Typography>

            {shadowChangedRows.length ? (
              <Box className='dpScrollThin' sx={sx.shadowTableWrap}>
                <Table size='sm' stickyHeader sx={sx.shadowTable}>
                  <thead>
                    <tr>
                      <th>שחקן</th>
                      <th>קבוצה</th>
                      <th>עונה</th>
                      <th>מודל קודם</th>
                      <th>מודל נוכחי</th>
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

        {auditMode === 'scoped' && engineRefreshPreview ? (
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
                label='מסמכי קבוצה'
                value={enginePreviewSummary.affectedTeamDocuments || 0}
              />
              <SummaryCard
                label='מצבי שחקן בקבוצה'
                value={enginePreviewSummary.affectedTeamPlayerStates || 0}
              />
              <SummaryCard
                label='מסמכי שחקן'
                value={enginePreviewSummary.affectedPlayerDocuments || 0}
              />
              <SummaryCard
                label='עונות שחקן'
                value={enginePreviewSummary.affectedPlayerSeasons || 0}
              />
              <SummaryCard
                label='מסמכי חיפוש'
                value={enginePreviewSummary.affectedSearchIndexes || 0}
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
              title='שדות מצב סקאוטינג במסמכי הקבוצה'
              values={engineTeamFieldCounts}
            />
            <ProfileCounts
              title='שדות מצב סקאוטינג במסמכי השחקן'
              values={enginePlayerFieldCounts}
            />
            <ProfileCounts
              title='שדות סקאוטינג באינדקס החיפוש'
              values={engineSearchFieldCounts}
            />

            <Typography level='body-xs' sx={sx.costNote}>
              סדר הרענון הוא מסמכי קבוצה → מסמכי שחקן → אינדקס החיפוש. מתעדכנים רק שדות שמחושבים על ידי המנוע; מידע אנושי, היסטוריית מדידות וסגירת פער אינם משתנים. לאחר הכתיבה לא רצה בדיקת אימות אוטומטית כדי לחסוך קריאות.
            </Typography>
          </Box>
        ) : null}

        {auditMode === 'scoped' && engineRefreshResult ? (
          <Box sx={sx.repairBox}>
            <Typography level='title-sm' sx={sx.sectionTitle}>
              רענון מצב המנוע הושלם
            </Typography>

            <Typography level='body-sm'>
              {engineRefreshResult.summary?.teamDocumentsUpdated || 0} מסמכי קבוצה עודכנו · {engineRefreshResult.summary?.teamPlayerStatesUpdated || 0} מצבי שחקן בקבוצה עודכנו · {engineRefreshResult.summary?.playerDocumentsUpdated || engineRefreshResult.playerDocumentsUpdated || 0} מסמכי שחקן עודכנו · {engineRefreshResult.summary?.playerSeasonsUpdated || engineRefreshResult.playerSeasonsUpdated || 0} עונות שחקן עודכנו · {engineRefreshResult.summary?.searchIndexesUpdated || 0} מסמכי חיפוש עודכנו · {engineRefreshResult.summary?.skipped || engineRefreshResult.skippedDocuments || 0} יעדים דולגו.
            </Typography>
          </Box>
        ) : null}

        {auditMode === 'scoped' && documentRewritePreview ? (
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
                label='מסמכי חיפוש שחקנים'
                value={rewriteSummary.playerSearchIndexes || 0}
              />
              <SummaryCard
                label='מסמכי חיפוש קבוצות'
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

        {auditMode === 'scoped' && documentRewriteResult ? (
          <Box sx={sx.repairResultBox}>
            <Typography level='title-sm' sx={sx.sectionTitle}>
              שכתוב המסמכים הושלם
            </Typography>
            <Typography level='body-sm'>
              {documentRewriteResult.writesPerformed || 0} מסמכים שוכתבו ב-{documentRewriteResult.batchesCommitted || 0} קבוצות כתיבה · קריאות נוספות: {documentRewriteResult.readsPerformed || 0}.
            </Typography>
          </Box>
        ) : null}

        {auditMode === 'scoped' && repairPreview ? (
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
                label='מסמך חיפוש'
                value={previewSummary.searchIndexDocumentsWithDiff || 0}
              />
              <SummaryCard
                label='מבנה מסמך לתיקון'
                value={previewSummary.schemaIssues || 0}
              />
            </Box>

            <Typography level='body-xs' sx={sx.costNote}>
              לא לתיקון אוטומטי: בעיות מבנה לדיווח בלבד {previewSummary.nonRepairableSchemaIssues || 0} · מצב סקאוטינג {previewSummary.stateIssues || 0} · מדידות {previewSummary.measurementIssues || 0} · מעקב שחקנים {previewSummary.trackingIssues || 0} · מסמך חיפוש {previewSummary.projectionIssues || 0}
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
                    ? `לפחות ${(repairReads.processEstimatedMin || 0) + Number(directSearchIndexCost.processReadsMaximum || 0)}`
                    : `${(repairReads.processEstimatedMin || 0) + Number(directSearchIndexCost.processReadsMaximum || 0)}-${(repairReads.processEstimatedMax || 0) + Number(directSearchIndexCost.processReadsMaximum || 0)}`}
                />
                <SummaryCard
                  label='כתיבות מקסימום'
                  value={(repairWrites.estimatedMax || 0) + directWrites}
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
                קריאות בזמן התיקון: {repairReads.applyEstimateIsMinimum ? 'לפחות ' : ''}{(repairReads.applyEstimated || 0) + directRepairReads} · קריאות לבדיקת אימות: {(repairVerification.runsAutomatically || directVerificationReads)
                  ? `${(repairReads.verificationEstimatedMin || 0) + directVerificationReads}-${(repairReads.verificationEstimatedMax || 0) + directVerificationReads}`
                  : 'לא רץ אוטומטית'}
              </Typography>

              <Typography level='body-xs' sx={sx.repairCostBreakdown}>
                פירוט הקריאות: קבוצה {repairReads.teamDocuments || 0} · שחקנים {repairReads.playerDocuments || 0} · מבנה {repairReads.schemaPlayerDocuments || 0} · מסמך חיפוש {repairReads.searchIndexEstimateExact ? '' : 'לפחות '}{(repairReads.searchIndexes || 0) + directRepairReads} · אימות ישיר {directVerificationReads}
              </Typography>

              <Typography level='body-xs' sx={sx.repairCostBreakdown}>
                כתיבות מקסימום: קבוצה {repairWrites.teamDocuments || 0} · שחקנים {repairWrites.playerDocumentsMax || 0} · מבנה {repairWrites.schemaPlayerDocumentsMax || 0} · מסמך חיפוש {(repairWrites.searchIndexesMax || 0) + directWrites}
              </Typography>

              {directSearchIndexCost.issuesCount ? (
                <Typography level='body-xs' sx={sx.repairCostBreakdown}>
                  תיקון ישיר באינדקס: עד {directRepairReads} קריאות לתיקון · עד {directWrites} כתיבות · עד {directVerificationReads} קריאות לאימות · סך עד {Number(directSearchIndexCost.processReadsMaximum || 0)} קריאות ועד {Number(directSearchIndexCost.processWritesMaximum || 0)} כתיבות.
                </Typography>
              ) : null}
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

        {auditMode === 'scoped' && repairResult ? (
          <Box sx={sx.repairResultBox}>
            <Typography level='title-sm' sx={sx.sectionTitle}>
              התיקון הושלם
            </Typography>
            <Typography level='body-sm'>
              {repairResult.teamDocumentsUpdated || 0} מסמכי קבוצה עודכנו · {' '}
              {repairResult.playerDocumentsCreated || 0} מסמכי שחקן נוצרו · {' '}
              {repairResult.playerDocumentsUpdated || 0} מסמכי שחקן סונכרנו · {' '}
              {repairResult.playerSchemaDocumentsUpdated || 0} מסמכי שחקן תוקנו במבנה המסמך · {' '}
              {(repairResult.searchIndexRowsUpdated || 0) + (repairResult.directSearchIndex?.updatedCount || 0)} אינדקסים עודכנו
            </Typography>
            {repairResult.directSearchIndex?.issuesCount ? (
              <Typography level='body-xs' sx={sx.repairCostBreakdown}>
                תיקון ישיר באינדקס: {repairResult.directSearchIndex.updatedCount || 0} עודכנו · {' '}
                {repairResult.directSearchIndex.alreadyRepairedCount || 0} כבר היו תקינים · {' '}
                {repairResult.directSearchIndex.reads || 0} קריאות · {' '}
                {repairResult.directSearchIndex.writes || 0} כתיבות.
              </Typography>
            ) : null}
          </Box>
        ) : null}

        {auditMode === 'scoped' && audit ? (
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

        {auditMode === 'scoped' && narrativeIssues.length ? (
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

        {auditMode === 'scoped' && actionableIssues.length ? (
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
