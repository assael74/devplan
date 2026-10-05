// src/features/playersDatabase/services/write/receipt/service.js

import { serverTimestamp } from 'firebase/firestore'

import {
  createWriteActionReference,
  listRecentWriteActionReceipts,
  listWriteActionReceiptsByTargetKey,
  patchWriteActionReceipt,
  readWriteActionReceipt,
  writeWriteActionReceipt,
} from './repository.js'

const ACTION_STAGES = Object.freeze({
  leagueOpen: Object.freeze([
    'canonical',
    'teamSeasonCompetitionSnapshots',
    'leaguesCenter',
    'clubsCenter',
    'audit',
  ]),
  leagueLoad: Object.freeze([
    'canonical',
    'teamSeasonCompetitionSnapshots',
    'leaguesCenter',
    'clubsCenter',
    'audit',
  ]),
  leagueTeamsClear: Object.freeze([
    'canonical',
    'teamSeasonCompetitionSnapshots',
    'leaguesCenter',
    'clubsCenter',
    'audit',
  ]),
  leagueSeasonDelete: Object.freeze([
    'canonical',
    'teamSeasonCompetitionSnapshots',
    'leaguesCenter',
    'clubsCenter',
    'audit',
  ]),
  rosterLoad: Object.freeze([
    'canonical',
    'counterparts',
    'playerSeasons',
    'playerSearchIndexes',
    'leagueProjection',
    'leaguesCenter',
    'clubsCenter',
    'audit',
  ]),
  rosterClear: Object.freeze([
    'canonical',
    'playerSeasons',
    'playerSearchIndexes',
    'leagueProjection',
    'leaguesCenter',
    'clubsCenter',
    'audit',
  ]),
  statsLoad: Object.freeze([
    'canonical',
    'counterparts',
    'playerRoots',
    'playerSeasons',
    'playerSearchIndexes',
    'leagueProjection',
    'leaguesCenter',
    'clubsCenter',
    'audit',
  ]),
  statsClear: Object.freeze([
    'canonical',
    'playerRoots',
    'playerSeasons',
    'playerSearchIndexes',
    'leagueProjection',
    'leaguesCenter',
    'clubsCenter',
    'audit',
  ]),
  clubsBootstrap: Object.freeze([
    'clubProfilesAndDirectory',
    'audit',
  ]),
})

const ACTION_LABELS = Object.freeze({
  leagueOpen: 'פתיחת ליגה',
  leagueLoad: 'טעינת ליגה',
  leagueTeamsClear: 'ניקוי קבוצות הליגה',
  leagueSeasonDelete: 'מחיקת עונת ליגה',
  rosterLoad: 'טעינת סגל',
  rosterClear: 'מחיקת סגל',
  statsLoad: 'טעינת סטטיסטיקות',
  statsClear: 'מחיקת סטטיסטיקות',
  clubsBootstrap: 'אתחול מועדונים',
})

const clean = value => String(value === null || value === undefined ? '' : value).trim()

const withReceiptId = ({ error, receiptId }) => {
  const resolvedError = error instanceof Error ? error : new Error(clean(error) || 'WriteAction failed')
  const id = clean(receiptId)
  if (id && !resolvedError.receiptId) resolvedError.receiptId = id
  return resolvedError
}

const runWithReceiptId = async ({ receiptId, action }) => {
  try {
    return await action()
  } catch (error) {
    throw withReceiptId({ error, receiptId })
  }
}

const requireActionType = value => {
  const actionType = clean(value)
  if (!Object.prototype.hasOwnProperty.call(ACTION_STAGES, actionType)) {
    throw new Error('Unsupported WriteAction action type')
  }
  return actionType
}

const actionDomain = actionType => {
  if (actionType === 'clubsBootstrap') return 'clubs'
  if (actionType.startsWith('league')) return 'league'
  if (actionType.startsWith('roster')) return 'roster'
  if (actionType.startsWith('stats')) return 'stats'
  throw new Error('Unsupported WriteAction target domain')
}

const requireTarget = ({ value, actionType }) => {
  const target = value && typeof value === 'object' && !Array.isArray(value) ? value : {}
  const domain = actionDomain(actionType)
  const leagueId = clean(target.leagueId)
  const clubId = clean(target.clubId)
  const teamId = clean(target.teamId)
  const seasonId = clean(target.seasonId)

  if (domain === 'clubs') {
    return {
      domain,
      leagueId: '',
      clubId: '',
      teamId: '',
      seasonId: '',
      playerId: '',
    }
  }
  if (!leagueId || !seasonId) throw new Error('Missing WriteAction League target')
  if (domain !== 'league' && !teamId) throw new Error('Missing WriteAction Team target')

  return {
    domain,
    leagueId,
    clubId,
    teamId,
    seasonId,
    playerId: clean(target.playerId),
  }
}

export const buildWriteActionTargetKey = ({
  domain = 'league',
  leagueId = '',
  teamId = '',
  seasonId = '',
} = {}) => {
  const resolvedDomain = clean(domain) || 'league'
  const resolvedLeagueId = clean(leagueId)
  const resolvedTeamId = clean(teamId)
  const resolvedSeasonId = clean(seasonId)
  if (resolvedDomain === 'clubs') return 'clubs:bootstrap'
  if (!resolvedLeagueId || !resolvedSeasonId) {
    throw new Error('Missing WriteAction target key identity')
  }
  if (resolvedDomain === 'roster' || resolvedDomain === 'stats') {
    if (!resolvedTeamId) throw new Error('Missing WriteAction Team target key identity')
    return `${resolvedDomain}:team:${resolvedTeamId}:season:${resolvedSeasonId}`
  }
  if (resolvedDomain !== 'league') throw new Error('Unsupported WriteAction target key domain')
  return `league:${resolvedLeagueId}:season:${resolvedSeasonId}`
}

const buildDisplay = ({ actionType, display = {} }) => {
  const source = display && typeof display === 'object' && !Array.isArray(display) ? display : {}
  const actionLabel = clean(source.actionLabel) || ACTION_LABELS[actionType]

  return {
    actionLabel,
    receiptLabel: clean(source.receiptLabel) || actionLabel,
    targetLabel: clean(source.targetLabel),
    leagueName: clean(source.leagueName),
    clubName: clean(source.clubName),
    teamName: clean(source.teamName),
    seasonKey: clean(source.seasonKey),
    birthYear: source.birthYear === null || source.birthYear === undefined || source.birthYear === ''
      ? null
      : Number.isFinite(Number(source.birthYear))
        ? Number(source.birthYear)
        : null,
    playerName: clean(source.playerName),
    playersCount: source.playersCount === null || source.playersCount === undefined || source.playersCount === ''
      ? null
      : Number.isFinite(Number(source.playersCount))
        ? Number(source.playersCount)
        : null,
    playerNamesPreview: Array.isArray(source.playerNamesPreview)
      ? source.playerNamesPreview.map(clean).filter(Boolean).slice(0, 5)
      : [],
  }
}

const emptyFailedStage = () => ({
  stageId: '',
  failedAt: null,
  errorCode: '',
  targetType: '',
  documentId: '',
})

const emptyAudit = () => ({
  ranAt: null,
  coverage: '',
  findingsCount: null,
  checkedDomains: [],
})

const buildReceipt = ({ reference, actionType, target, targetKey, display }) => ({
  writeActionId: reference.id,
  actionType,
  targetKey,
  status: 'open',
  executionStatus: 'running',
  recoveryRequired: false,
  canonicalOutcome: 'pending',
  target,
  display,
  progress: {
    completedByStage: {},
    failed: emptyFailedStage(),
  },
  audit: emptyAudit(),
})

const assertReceiptMatches = ({ receipt, actionType, targetKey }) => {
  if (!receipt) throw new Error('WriteAction receipt not found')
  if (receipt.status !== 'open') throw new Error('WriteAction receipt is not open')
  if (clean(receipt.actionType) !== actionType) {
    throw new Error('Open WriteAction belongs to another action type')
  }
  if (clean(receipt.targetKey) !== targetKey) {
    throw new Error('WriteAction receipt target mismatch')
  }
}

const resetReceiptForExecution = async ({ receiptId }) => patchWriteActionReceipt({
  receiptId,
  patch: {
    executionStatus: 'running',
    canonicalOutcome: 'pending',
    progress: {
      completedByStage: {},
      failed: emptyFailedStage(),
    },
    audit: emptyAudit(),
    'timestamps.completedAt': null,
  },
})

export const openWriteActionReceipt = async ({
  actionType = '',
  target = {},
  display = {},
  receiptId = '',
} = {}) => {
  const resolvedActionType = requireActionType(actionType)
  const resolvedTarget = requireTarget({ value: target, actionType: resolvedActionType })
  const targetKey = buildWriteActionTargetKey(resolvedTarget)
  const requestedReceiptId = clean(receiptId)

  if (requestedReceiptId) {
    const receipt = await readWriteActionReceipt({ receiptId: requestedReceiptId })
    assertReceiptMatches({ receipt, actionType: resolvedActionType, targetKey })
    await runWithReceiptId({
      receiptId: requestedReceiptId,
      action: () => resetReceiptForExecution({ receiptId: requestedReceiptId }),
    })
    return requestedReceiptId
  }

  const rows = await listWriteActionReceiptsByTargetKey({ targetKey })
  const openRows = rows.filter(row => row.status === 'open')

  if (openRows.length > 1) {
    throw new Error('Multiple open WriteAction receipts for target')
  }

  if (openRows.length === 1) {
    assertReceiptMatches({
      receipt: openRows[0],
      actionType: resolvedActionType,
      targetKey,
    })
    await runWithReceiptId({
      receiptId: openRows[0].id,
      action: () => resetReceiptForExecution({ receiptId: openRows[0].id }),
    })
    return openRows[0].id
  }

  const reference = createWriteActionReference()
  const receipt = buildReceipt({
    reference,
    actionType: resolvedActionType,
    target: resolvedTarget,
    targetKey,
    display: buildDisplay({ actionType: resolvedActionType, display }),
  })

  return runWithReceiptId({
    receiptId: reference.id,
    action: () => writeWriteActionReceipt({ reference, receipt }),
  })
}

export const completeWriteActionStage = async ({ receiptId = '', stageId = '' } = {}) => {
  const stage = clean(stageId)
  if (!stage) throw new Error('Missing WriteAction stage id')

  const patch = {
    executionStatus: 'running',
    [`progress.completedByStage.${stage}`]: serverTimestamp(),
    'progress.failed': emptyFailedStage(),
  }

  if (stage === 'canonical') patch.canonicalOutcome = 'confirmed'

  return patchWriteActionReceipt({ receiptId, patch })
}

export const failWriteActionStage = async ({
  receiptId = '',
  stageId = '',
  error = null,
} = {}) => {
  const stage = clean(stageId)
  const failedTarget = error && error.failedTarget && typeof error.failedTarget === 'object'
    ? error.failedTarget
    : {}

  const patch = {
    status: 'open',
    executionStatus: 'failed',
    recoveryRequired: true,
    'progress.failed': {
      stageId: stage,
      failedAt: serverTimestamp(),
      errorCode: clean(error && (error.code || error.message)),
      targetType: clean(failedTarget.targetType),
      documentId: clean(failedTarget.documentId),
    },
  }

  if (stage === 'canonical') patch.canonicalOutcome = 'failed_or_unknown'

  return patchWriteActionReceipt({ receiptId, patch })
}

export const completeWriteActionAudit = async ({
  receiptId = '',
  audit = {},
} = {}) => {
  const findings = Array.isArray(audit && audit.findings) ? audit.findings : []
  const coverageComplete = Boolean(audit && audit.coverage && audit.coverage.complete === true)
  const cleanAudit = coverageComplete && findings.length === 0

  await patchWriteActionReceipt({
    receiptId,
    patch: {
      audit: {
        ranAt: serverTimestamp(),
        coverage: coverageComplete ? 'complete' : 'partial',
        findingsCount: findings.length,
        checkedDomains: audit && audit.coverage && Array.isArray(audit.coverage.coveredTargets)
          ? audit.coverage.coveredTargets
          : [],
      },
      'progress.completedByStage.audit': serverTimestamp(),
      'progress.failed': cleanAudit
        ? emptyFailedStage()
        : {
            stageId: 'audit',
            failedAt: serverTimestamp(),
            errorCode: coverageComplete ? 'AUDIT_FINDINGS' : 'AUDIT_PARTIAL',
            targetType: '',
            documentId: '',
          },
      status: cleanAudit ? 'closed' : 'open',
      executionStatus: cleanAudit ? 'succeeded' : 'failed',
      recoveryRequired: !cleanAudit,
      'timestamps.completedAt': cleanAudit ? serverTimestamp() : null,
    },
  })

  return {
    clean: cleanAudit,
    status: cleanAudit ? 'closed' : 'open',
    executionStatus: cleanAudit ? 'succeeded' : 'failed',
    recoveryRequired: !cleanAudit,
  }
}

export const beginWriteActionRepair = ({ receiptId = '' } = {}) => patchWriteActionReceipt({
  receiptId,
  patch: {
    status: 'open',
    executionStatus: 'running',
    recoveryRequired: true,
    'progress.failed': emptyFailedStage(),
    'timestamps.completedAt': null,
  },
})

export const getWriteActionReceipt = ({ receiptId = '' } = {}) => readWriteActionReceipt({ receiptId })

export const listWriteActionReceipts = ({ maxResults = 20 } = {}) => (
  listRecentWriteActionReceipts({ maxResults })
)

export const getWriteActionStages = ({ actionType = '' } = {}) => [
  ...ACTION_STAGES[requireActionType(actionType)],
]
