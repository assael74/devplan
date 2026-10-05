// src/features/playersDatabase/services/write/league/leagueWriteOrchestrator.js

import {
  buildLeagueOpenWritePlan,
  buildLeagueLoadWritePlan,
  buildLeagueSeasonDeleteWritePlan,
  buildLeagueTeamsClearWritePlan,
} from '../../../domain/league/index.js'
import { auditLeague } from '../../audit/league/index.js'
import {
  completeWriteActionAudit,
  completeWriteActionStage,
  failWriteActionStage,
  openWriteActionReceipt,
} from '../receipt/index.js'
import { writeClubsCenter } from './writeClubsCenter.js'
import { writeLeagueCanonical } from './writeLeagueCanonical.js'
import { writeLeaguesCenter } from './writeLeaguesCenter.js'
import { writeTeamSeasonCompetitionSnapshots } from './writeTeamSeasonCompetitionSnapshots.js'
import {
  readLeagueLoadSources,
  readLeagueMutationSources,
} from './readLeagueWriteSources.js'

const ACTION_TYPES = Object.freeze({
  OPEN: 'leagueOpen',
  LOAD: 'leagueLoad',
  CLEAR: 'leagueTeamsClear',
  DELETE: 'leagueSeasonDelete',
})

const BUSINESS_STAGES = Object.freeze([
  'canonical',
  'teamSeasonCompetitionSnapshots',
  'leaguesCenter',
  'clubsCenter',
])

const clean = value => String(value === null || value === undefined ? '' : value).trim()

const emitProgress = ({ onProgress, event }) => {
  if (typeof onProgress !== 'function') return
  try {
    onProgress(event)
  } catch {
    // UI progress reporting must not interrupt the persisted write flow.
  }
}

const withReceiptId = ({ error, receiptId }) => {
  const resolvedError = error instanceof Error ? error : new Error(clean(error) || 'League write failed')
  const id = clean(receiptId)
  if (id && !resolvedError.receiptId) resolvedError.receiptId = id
  return resolvedError
}

const recordStageFailure = async ({ receiptId, stageId, error, onProgress }) => {
  const stageError = withReceiptId({ error, receiptId })
  try {
    await failWriteActionStage({ receiptId, stageId, error: stageError })
  } catch (receiptError) {
    stageError.receiptUpdateError = withReceiptId({
      error: receiptError,
      receiptId,
    })
  }
  emitProgress({
    onProgress,
    event: {
      type: 'stageFailed',
      receiptId,
      stageId,
      errorCode: clean(stageError.code || stageError.message),
    },
  })
  throw stageError
}

const requireInput = value => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('Missing League write input')
  }
  return value
}

const readSeasonFromLeague = ({ league, seasonId }) => {
  if (!league || typeof league !== 'object') return null
  const seasonsById = league.seasonsById && typeof league.seasonsById === 'object'
    ? league.seasonsById
    : {}
  return seasonsById[seasonId] || null
}

const resolveLeagueName = league => clean(
  league && league.names && (
    league.names.display
    || league.names.official
    || league.names.short
    || league.names.source
  )
)

const buildReceiptDisplay = ({ actionType, input, approvedState, display }) => {
  const overrides = display && typeof display === 'object' && !Array.isArray(display)
    ? display
    : {}
  const canonicalLeague = approvedState && approvedState.document
    ? approvedState.document
    : input.existingLeague
  const season = readSeasonFromLeague({
    league: canonicalLeague,
    seasonId: approvedState.seasonId,
  }) || readSeasonFromLeague({
    league: input.existingLeague,
    seasonId: approvedState.seasonId,
  })

  return {
    ...overrides,
    leagueName: clean(overrides.leagueName) || resolveLeagueName(canonicalLeague),
    seasonKey: clean(overrides.seasonKey) || clean(season && season.seasonKey),
    birthYear: Object.prototype.hasOwnProperty.call(overrides, 'birthYear')
      ? overrides.birthYear
      : season && Number.isFinite(Number(season.birthYear))
        ? Number(season.birthYear)
        : null,
    actionType,
  }
}

const buildFailedTarget = ({ stageId, approvedState }) => {
  if (stageId === 'canonical') {
    return { targetType: 'league', documentId: approvedState.leagueId }
  }
  if (stageId === 'teamSeasonCompetitionSnapshots') {
    return { targetType: 'teamSeason', documentId: '' }
  }
  if (stageId === 'leaguesCenter') {
    return { targetType: 'leaguesCenter', documentId: 'all' }
  }
  if (stageId === 'clubsCenter') {
    return { targetType: 'clubsCenter', documentId: approvedState.seasonId }
  }
  return { targetType: 'leagueAudit', documentId: approvedState.leagueId }
}

const runBusinessStage = async ({
  stageId,
  approvedState,
  receiptId,
  onProgress,
}) => {
  let result

  try {
    if (stageId === 'canonical') {
      result = await writeLeagueCanonical({ approvedState })
    } else if (stageId === 'teamSeasonCompetitionSnapshots') {
      result = await writeTeamSeasonCompetitionSnapshots({ approvedState })
    } else if (stageId === 'leaguesCenter') {
      result = await writeLeaguesCenter({ approvedState })
    } else if (stageId === 'clubsCenter') {
      result = await writeClubsCenter({ approvedState })
    } else {
      throw new Error('Unsupported League write stage')
    }

    await completeWriteActionStage({ receiptId, stageId })
    emitProgress({
      onProgress,
      event: { type: 'stageCompleted', receiptId, stageId },
    })
    return result
  } catch (error) {
    const stageError = withReceiptId({ error, receiptId })
    if (!stageError.failedTarget) {
      stageError.failedTarget = buildFailedTarget({ stageId, approvedState })
    }
    return recordStageFailure({
      receiptId,
      stageId,
      error: stageError,
      onProgress,
    })
  }
}

const runAuditStage = async ({ approvedState, receiptId, onProgress }) => {
  try {
    const audit = await auditLeague({
      leagueId: approvedState.leagueId,
      seasonId: approvedState.seasonId,
    })
    const receiptState = await completeWriteActionAudit({ receiptId, audit })
    emitProgress({
      onProgress,
      event: {
        type: receiptState.executionStatus === 'succeeded'
          ? 'stageCompleted'
          : 'stageFailed',
        receiptId,
        stageId: 'audit',
        receiptState,
      },
    })
    return { audit, receiptState }
  } catch (error) {
    const stageError = withReceiptId({ error, receiptId })
    if (!stageError.failedTarget) {
      stageError.failedTarget = buildFailedTarget({
        stageId: 'audit',
        approvedState,
      })
    }
    return recordStageFailure({
      receiptId,
      stageId: 'audit',
      error: stageError,
      onProgress,
    })
  }
}

const runLeagueAction = async ({
  actionType,
  input,
  approvedState,
  receiptId = '',
  display = {},
  onProgress,
} = {}) => {
  const target = {
    leagueId: approvedState.leagueId,
    seasonId: approvedState.seasonId,
  }
  const resolvedReceiptId = await openWriteActionReceipt({
    actionType,
    target,
    display: buildReceiptDisplay({
      actionType,
      input,
      approvedState,
      display,
    }),
    receiptId,
  })
  emitProgress({
    onProgress,
    event: { type: 'receiptOpened', receiptId: resolvedReceiptId },
  })
  const stageResults = {}

  for (const stageId of BUSINESS_STAGES) {
    stageResults[stageId] = await runBusinessStage({
      stageId,
      approvedState,
      receiptId: resolvedReceiptId,
      onProgress,
    })
  }

  const { audit, receiptState } = await runAuditStage({
    approvedState,
    receiptId: resolvedReceiptId,
    onProgress,
  })
  stageResults.audit = audit

  return {
    actionType,
    receiptId: resolvedReceiptId,
    leagueId: approvedState.leagueId,
    seasonId: approvedState.seasonId,
    status: receiptState.status,
    executionStatus: receiptState.executionStatus,
    recoveryRequired: receiptState.recoveryRequired,
    stageResults,
    audit,
  }
}

export const loadLeague = async ({
  input = {},
  receiptId = '',
  display = {},
  onProgress,
} = {}) => {
  const actionInput = requireInput(input)
  const freshSources = await readLeagueLoadSources({
    league: actionInput.league,
    season: actionInput.season,
    rows: actionInput.rows,
  })
  const source = {
    ...actionInput,
    ...freshSources,
  }
  const approvedState = buildLeagueLoadWritePlan(source)

  return runLeagueAction({
    actionType: ACTION_TYPES.LOAD,
    input: source,
    approvedState,
    receiptId,
    display,
    onProgress,
  })
}

export const openLeagueSeason = async ({
  input = {},
  receiptId = '',
  display = {},
} = {}) => {
  const actionInput = requireInput(input)
  const freshSources = await readLeagueLoadSources({
    league: actionInput.league,
    season: actionInput.season,
    rows: [],
  })
  const source = {
    ...actionInput,
    rows: [],
    ...freshSources,
  }
  const approvedState = buildLeagueOpenWritePlan(source)

  return runLeagueAction({
    actionType: ACTION_TYPES.OPEN,
    input: source,
    approvedState,
    receiptId,
    display,
  })
}

export const clearLeagueTeams = async ({
  input = {},
  receiptId = '',
  display = {},
  onProgress,
} = {}) => {
  const actionInput = requireInput(input)
  const freshSources = await readLeagueMutationSources({
    leagueId: actionInput.leagueId,
    seasonId: actionInput.seasonId,
  })
  const source = {
    ...actionInput,
    ...freshSources,
  }
  const approvedState = buildLeagueTeamsClearWritePlan(source)

  return runLeagueAction({
    actionType: ACTION_TYPES.CLEAR,
    input: source,
    approvedState,
    receiptId,
    display,
    onProgress,
  })
}

export const deleteLeagueSeason = async ({
  input = {},
  receiptId = '',
  display = {},
} = {}) => {
  const actionInput = requireInput(input)
  const freshSources = await readLeagueMutationSources({
    leagueId: actionInput.leagueId,
    seasonId: actionInput.seasonId,
  })
  const source = {
    ...actionInput,
    ...freshSources,
  }
  const approvedState = buildLeagueSeasonDeleteWritePlan(source)

  return runLeagueAction({
    actionType: ACTION_TYPES.DELETE,
    input: source,
    approvedState,
    receiptId,
    display,
  })
}
