// src/features/playersDatabase/services/audit/repair/reloadRoster.js

import { buildRosterLoadWritePlan } from '../../../domain/roster/index.js'
import { readRosterLoadSources } from '../../write/roster/readRosterWriteSources.js'
import { writeRosterCanonical } from '../../write/roster/writeRosterCanonical.js'
import { writeRosterCounterparts } from '../../write/roster/writeRosterCounterparts.js'
import { writeRosterPlayerSeasons } from '../../write/roster/writeRosterPlayerSeasons.js'
import { writeRosterPlayerSearchIndexes } from '../../write/roster/writeRosterPlayerSearchIndexes.js'
import { writeRosterLeagueProjection } from '../../write/roster/writeRosterLeagueProjection.js'
import { writeRosterLeaguesCenter } from '../../write/roster/writeRosterLeaguesCenter.js'
import { writeRosterClubsCenter } from '../../write/roster/writeRosterClubsCenter.js'
import { auditRoster } from '../roster/index.js'

const stages = [
  ['canonical', writeRosterCanonical],
  ['counterparts', writeRosterCounterparts],
  ['playerSeasons', writeRosterPlayerSeasons],
  ['playerSearchIndexes', writeRosterPlayerSearchIndexes],
  ['leagueProjection', writeRosterLeagueProjection],
  ['leaguesCenter', writeRosterLeaguesCenter],
  ['clubsCenter', writeRosterClubsCenter],
]

const emit = (callback, event) => {
  if (typeof callback !== 'function') return
  try { callback(event) } catch (_error) { /* Progress display must not interrupt persistence. */ }
}

export const prepareRosterForAuditRepair = async ({ input = {} } = {}) => {
  const sources = await readRosterLoadSources({ input })
  return buildRosterLoadWritePlan({ ...input, ...sources })
}

export const loadRosterForAuditRepair = async ({ input = {}, confirmed = false, onProgress } = {}) => {
  if (confirmed !== true) throw new Error('נדרש אישור מפורש לטעינת הסגל')
  const approvedState = await prepareRosterForAuditRepair({ input })
  const stageResults = {}
  for (const [stageId, write] of stages) {
    try {
      stageResults[stageId] = await write({ approvedState })
      emit(onProgress, { type: 'stageCompleted', stageId })
    } catch (error) {
      const failure = error instanceof Error ? error : new Error('טעינת מקור הסגל נכשלה')
      failure.auditResult = await auditRoster({ approvedState }).catch(() => null)
      emit(onProgress, { type: 'stageFailed', stageId, errorCode: failure.message })
      throw failure
    }
  }
  let audit
  try {
    audit = await auditRoster({ approvedState })
  } catch (_error) {
    throw new Error('הסגל נשמר, אך הבדיקה החוזרת נכשלה. יש להריץ אודיט לפני ניסיון נוסף.')
  }
  const complete = audit.coverage && audit.coverage.complete === true && audit.findings.length === 0
  emit(onProgress, { type: complete ? 'stageCompleted' : 'stageFailed', stageId: 'audit' })
  return {
    teamId: approvedState.teamId,
    seasonId: approvedState.seasonId,
    leagueId: approvedState.leagueId,
    teamSeasonDocumentId: approvedState.teamSeasonDocumentId,
    actionType: 'rosterLoad',
    status: complete ? 'succeeded' : 'failed',
    executionStatus: complete ? 'succeeded' : 'failed',
    stageResults: { ...stageResults, audit },
    approvedState,
    audit,
  }
}
