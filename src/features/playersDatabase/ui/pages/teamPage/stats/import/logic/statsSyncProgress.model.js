// src/features/playersDatabase/ui/pages/teamPage/stats/import/logic/statsSyncProgress.model.js

export const STATS_SYNC_STAGES = Object.freeze([
  Object.freeze({ id: 'canonical', title: 'שמירת הסטטיסטיקות', target: 'dbTeamSeasons' }),
  Object.freeze({ id: 'counterparts', title: 'סנכרון מעברים', target: 'dbBirthTeamSeasons' }),
  Object.freeze({ id: 'playerRoots', title: 'סנכרון שחקנים', target: 'dbPlayers' }),
  Object.freeze({ id: 'playerSeasons', title: 'סנכרון עונות שחקן', target: 'dbPlayerSeasons' }),
  Object.freeze({ id: 'playerSearchIndexes', title: 'סנכרון אינדקסי שחקנים', target: 'dbSearchIndexes' }),
  Object.freeze({ id: 'leagueProjection', title: 'סנכרון הליגה', target: 'dbLeagues' }),
  Object.freeze({ id: 'leaguesCenter', title: 'סנכרון מרכז הליגות', target: 'dbLeaguesCenter' }),
  Object.freeze({ id: 'clubsCenter', title: 'סנכרון מרכז המועדונים', target: 'dbClubsCenter' }),
  Object.freeze({ id: 'audit', title: 'בדיקה וסגירת הקבלה', target: 'dbWriteActions' }),
])

export const STATS_CLEAR_SYNC_STAGES = Object.freeze([
  Object.freeze({ id: 'canonical', title: 'מחיקת נתוני הסטטיסטיקה', target: 'dbTeamSeasons' }),
  STATS_SYNC_STAGES[2],
  STATS_SYNC_STAGES[3],
  STATS_SYNC_STAGES[4],
  STATS_SYNC_STAGES[5],
  STATS_SYNC_STAGES[6],
  STATS_SYNC_STAGES[7],
  STATS_SYNC_STAGES[8],
])

const object = value => (
  value && typeof value === 'object' && !Array.isArray(value) ? value : {}
)

export const applyStatsSyncProgressEvent = ({ receipt = null, event = {} } = {}) => {
  const current = object(receipt)
  const progress = object(current.progress)
  const completedByStage = object(progress.completedByStage)
  const receiptId = String(event.receiptId || current.id || '').trim()

  if (event.type === 'receiptOpened') {
    return {
      ...current,
      id: receiptId,
      status: 'open',
      executionStatus: 'running',
      recoveryRequired: false,
      canonicalOutcome: 'pending',
      progress: { completedByStage: {}, failed: {} },
    }
  }

  if (event.type === 'stageCompleted') {
    return {
      ...current,
      ...object(event.receiptState),
      id: receiptId,
      canonicalOutcome: event.stageId === 'canonical'
        ? 'confirmed'
        : current.canonicalOutcome,
      progress: {
        ...progress,
        completedByStage: {
          ...completedByStage,
          [event.stageId]: true,
        },
        failed: {},
      },
    }
  }

  if (event.type === 'repairStarted') {
    return {
      ...current,
      status: 'open',
      executionStatus: 'running',
      recoveryRequired: true,
      progress: { ...progress, completedByStage, failed: {} },
    }
  }

  if (event.type === 'stageFailed') {
    return {
      ...current,
      ...object(event.receiptState),
      id: receiptId,
      status: 'open',
      executionStatus: 'failed',
      recoveryRequired: true,
      canonicalOutcome: event.stageId === 'canonical'
        ? 'failed_or_unknown'
        : current.canonicalOutcome,
      progress: {
        ...progress,
        completedByStage,
        failed: {
          stageId: event.stageId,
          errorCode: event.errorCode || '',
        },
      },
    }
  }

  return receipt
}

export const buildStatsSyncStages = ({
  receipt = null,
  busy = false,
  stages = STATS_SYNC_STAGES,
} = {}) => {
  const source = object(receipt)
  const progress = object(source.progress)
  const completedByStage = object(progress.completedByStage)
  const failedStageId = String(object(progress.failed).stageId || '').trim()
  const safeStages = Array.isArray(stages) ? stages : STATS_SYNC_STAGES
  const firstPendingIndex = safeStages.findIndex(stage => (
    !completedByStage[stage.id] && failedStageId !== stage.id
  ))

  return safeStages.map((stage, index) => {
    let state = 'pending'
    if (failedStageId === stage.id) state = 'failed'
    else if (completedByStage[stage.id]) state = 'completed'
    else if (busy && index === firstPendingIndex) state = 'running'
    return { ...stage, state }
  })
}

export const resolveStatsRetryMode = receipt => (
  String(object(receipt).canonicalOutcome || '').trim() === 'confirmed'
    ? 'repair'
    : 'retry'
)
