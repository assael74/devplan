// src/features/playersDatabase/ui/pages/DataOpsPage/logic/receiptRows.logic.js

const clean = value => String(value === null || value === undefined ? '' : value).trim()

const ACTION_LABELS = Object.freeze({
  leagueOpen: 'פתיחת ליגה',
  leagueLoad: 'טעינת ליגה',
  leagueTeamsClear: 'ניקוי קבוצות הליגה',
  leagueSeasonDelete: 'מחיקת עונת ליגה',
  rosterLoad: 'טעינת סגל',
  rosterClear: 'מחיקת סגל',
  statsLoad: 'טעינת סטטיסטיקות',
  statsClear: 'מחיקת סטטיסטיקות',
})

const DOMAIN_LABELS = Object.freeze({
  clubs: 'מועדונים',
  league: 'ליגה',
  roster: 'סגל',
  stats: 'סטטיסטיקות',
})

const toDate = value => {
  if (value && typeof value.toDate === 'function') return value.toDate()
  if (value instanceof Date) return value
  if (!value) return null

  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

const formatReceiptTime = value => {
  const date = toDate(value)
  if (!date) return '—'

  return new Intl.DateTimeFormat('he-IL', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date)
}

const buildScope = receipt => {
  const display = receipt && receipt.display ? receipt.display : {}
  const target = receipt && receipt.target ? receipt.target : {}

  return clean(
    display.targetLabel
    || display.teamName
    || display.leagueName
    || display.clubName
    || DOMAIN_LABELS[target.domain]
    || receipt.targetKey
  ) || 'כללי'
}

const buildStatus = receipt => {
  const executionStatus = clean(receipt && receipt.executionStatus)
  const status = clean(receipt && receipt.status)

  if (executionStatus === 'running') return { label: 'בביצוע', tone: 'info' }
  if (executionStatus === 'failed') return { label: 'נעצר', tone: 'danger' }
  if (receipt && receipt.recoveryRequired) return { label: 'דורש תיקון', tone: 'warning' }
  if (status === 'closed' || executionStatus === 'succeeded') {
    return { label: 'הושלם', tone: 'success' }
  }
  return { label: 'פתוח', tone: 'warning' }
}

export const buildReceiptRow = receipt => {
  const display = receipt && receipt.display ? receipt.display : {}
  const state = buildStatus(receipt)

  return {
    id: clean(receipt && (receipt.id || receipt.writeActionId)),
    scope: buildScope(receipt),
    action: clean(display.actionLabel || display.receiptLabel)
      || ACTION_LABELS[clean(receipt && receipt.actionType)]
      || clean(receipt && receipt.actionType)
      || 'פעולת כתיבה',
    status: state.label,
    tone: state.tone,
    time: formatReceiptTime(receipt && receipt.timestamps && receipt.timestamps.updatedAt),
  }
}

export const buildReceiptRows = receipts => (
  (Array.isArray(receipts) ? receipts : []).map(buildReceiptRow)
)

export const buildReceiptDetails = receipt => {
  if (!receipt || typeof receipt !== 'object') return null
  const row = buildReceiptRow(receipt)
  const target = receipt.target && typeof receipt.target === 'object' ? receipt.target : {}
  const completedByStage = receipt.progress
    && receipt.progress.completedByStage
    && typeof receipt.progress.completedByStage === 'object'
    ? receipt.progress.completedByStage
    : {}
  const failed = receipt.progress && receipt.progress.failed
    && typeof receipt.progress.failed === 'object'
    ? receipt.progress.failed
    : {}

  return {
    ...row,
    actionType: clean(receipt.actionType),
    canonicalOutcome: clean(receipt.canonicalOutcome) || 'pending',
    executionStatus: clean(receipt.executionStatus),
    recoveryRequired: receipt.recoveryRequired === true,
    target: [
      ['ליגה', clean(target.leagueId)],
      ['קבוצה', clean(target.teamId)],
      ['עונה', clean(target.seasonId)],
      ['מועדון', clean(target.clubId)],
      ['שחקן', clean(target.playerId)],
    ].filter(([, value]) => Boolean(value)),
    completedStages: Object.keys(completedByStage),
    failedStage: clean(failed.stageId),
    failedReason: clean(failed.errorCode),
    auditCoverage: clean(receipt.audit && receipt.audit.coverage),
    findingsCount: receipt.audit && Number.isFinite(Number(receipt.audit.findingsCount))
      ? Number(receipt.audit.findingsCount)
      : null,
  }
}

