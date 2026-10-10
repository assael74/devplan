// src/features/playersDatabase/ui/pages/leaguePage/logic/leagueSyncProgress.model.js

export const LEAGUE_SYNC_STAGES = Object.freeze([
  Object.freeze({
    id: 'canonical',
    title: 'מסמך הליגה והעונה',
    target: 'dbLeagues',
  }),
  Object.freeze({
    id: 'teamSeasonCompetitionSnapshots',
    title: 'מסמך קבוצה עונתי',
    target: 'dbTeamSeasons',
  }),
  Object.freeze({
    id: 'leaguesCenter',
    title: 'מסמך מרכז הליגות',
    target: 'dbLeaguesCenter',
  }),
  Object.freeze({
    id: 'clubsCenter',
    title: 'מסמך מרכז המועדונים',
    target: 'dbClubsCenter',
  }),
  Object.freeze({
    id: 'audit',
    title: 'בדיקה וסגירת הקבלה',
    target: 'dbWriteActions',
  }),
])

const object = value => (
  value && typeof value === 'object' && !Array.isArray(value) ? value : {}
)

export const applyLeagueSyncProgressEvent = ({ receipt = null, event = {} } = {}) => {
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
      progress: {
        completedByStage: {},
        failed: {},
      },
    }
  }

  if (event.type === 'stageCompleted') {
    const receiptState = object(event.receiptState)
    return {
      ...current,
      ...receiptState,
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
      progress: {
        ...progress,
        completedByStage,
        failed: {},
      },
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

export const buildLeagueSyncStages = ({ receipt = null, busy = false } = {}) => {
  const source = object(receipt)
  const progress = object(source.progress)
  const completedByStage = object(progress.completedByStage)
  const failedStageId = String(object(progress.failed).stageId || '').trim()
  const firstPendingIndex = LEAGUE_SYNC_STAGES.findIndex(stage => (
    !completedByStage[stage.id] && failedStageId !== stage.id
  ))

  return LEAGUE_SYNC_STAGES.map((stage, index) => {
    let state = 'pending'
    if (failedStageId === stage.id) state = 'failed'
    else if (completedByStage[stage.id]) state = 'completed'
    else if (busy && index === firstPendingIndex) state = 'running'

    return { ...stage, state }
  })
}

