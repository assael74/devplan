// src/features/playersDatabase/services/audit/repair/reloadLeague.js

import { buildLeagueLoadWritePlan, buildLeagueOpenWritePlan } from '../../../domain/league/index.js'
import { readLeagueLoadSources } from '../../write/league/readLeagueWriteSources.js'
import { writeLeagueCanonical } from '../../write/league/writeLeagueCanonical.js'
import { writeTeamSeasonCompetitionSnapshots } from '../../write/league/writeTeamSeasonCompetitionSnapshots.js'
import { writeLeaguesCenter } from '../../write/league/writeLeaguesCenter.js'
import { writeClubsCenter } from '../../write/league/writeClubsCenter.js'
import { auditLeague } from '../league/index.js'

const stages = [
  ['canonical', writeLeagueCanonical],
  ['teamSeasonCompetitionSnapshots', writeTeamSeasonCompetitionSnapshots],
  ['leaguesCenter', writeLeaguesCenter],
  ['clubsCenter', writeClubsCenter],
]

const emit = (callback, event) => {
  if (typeof callback !== 'function') return
  try { callback(event) } catch (_error) { /* Progress display must not interrupt persistence. */ }
}

const reloadLeague = async ({ input, onProgress, opening }) => {
  const rows = opening ? [] : input.rows
  const sources = await readLeagueLoadSources({ league: input.league, season: input.season, rows })
  const build = opening ? buildLeagueOpenWritePlan : buildLeagueLoadWritePlan
  const approvedState = build({ ...input, ...sources, rows })
  const stageResults = {}
  for (const [stageId, write] of stages) {
    try {
      stageResults[stageId] = await write({ approvedState })
      emit(onProgress, { type: 'stageCompleted', stageId })
    } catch (error) {
      const failure = error instanceof Error ? error : new Error('טעינת מקור הליגה נכשלה.')
      failure.auditResult = await auditLeague({ leagueId: approvedState.leagueId, seasonId: approvedState.seasonId }).catch(() => null)
      emit(onProgress, { type: 'stageFailed', stageId, errorCode: failure.message })
      throw failure
    }
  }
  let audit
  try {
    audit = await auditLeague({ leagueId: approvedState.leagueId, seasonId: approvedState.seasonId })
  } catch (_error) {
    throw new Error('נתוני הליגה נשמרו, אך הבדיקה החוזרת נכשלה. יש להריץ אודיט לפני ניסיון נוסף.')
  }
  const clean = audit.findings.length === 0 && audit.coverage.complete
  emit(onProgress, { type: clean ? 'stageCompleted' : 'stageFailed', stageId: 'audit' })
  return {
    leagueId: approvedState.leagueId,
    seasonId: approvedState.seasonId,
    actionType: opening ? 'leagueOpen' : 'leagueLoad',
    status: clean ? 'succeeded' : 'failed',
    executionStatus: clean ? 'succeeded' : 'failed',
    recoveryRequired: !clean,
    stageResults: { ...stageResults, audit },
    audit,
  }
}

export const loadLeagueForAuditRepair = async ({ input = {}, onProgress } = {}) => (
  reloadLeague({ input, onProgress, opening: false })
)

export const openLeagueForAuditRepair = async ({ input = {}, onProgress } = {}) => (
  reloadLeague({ input, onProgress, opening: true })
)
