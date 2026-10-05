// src/features/playersDatabase/services/write/recovery/repairWriteAction.js

import { serverTimestamp } from 'firebase/firestore'

import {
  buildLeagueLoadProjectionRepairPlan,
  buildLeagueSeasonDeleteWritePlan,
  buildLeagueTeamsClearWritePlan,
} from '../../../domain/league/index.js'
import {
  buildRosterClearWritePlan,
  buildRosterProjectionRepairPlan,
} from '../../../domain/roster/index.js'
import {
  buildStatsClearApprovedState,
  buildStatsProjectionRepairApprovedState,
} from '../../../domain/stats/index.js'
import { auditLeague } from '../../audit/league/index.js'
import { auditRoster } from '../../audit/roster/index.js'
import { auditStats } from '../../audit/stats/index.js'
import {
  beginWriteActionRepair,
  completeWriteActionAudit,
  completeWriteActionStage,
  failWriteActionStage,
  getWriteActionReceipt,
} from '../receipt/index.js'
import { readLeagueLoadSources, readLeagueMutationSources } from '../league/readLeagueWriteSources.js'
import { writeClubsCenter } from '../league/writeClubsCenter.js'
import { writeLeaguesCenter } from '../league/writeLeaguesCenter.js'
import { writeTeamSeasonCompetitionSnapshots } from '../league/writeTeamSeasonCompetitionSnapshots.js'
import { readRosterClearSources } from '../roster/readRosterWriteSources.js'
import { writeRosterClubsCenter } from '../roster/writeRosterClubsCenter.js'
import { writeRosterCounterparts } from '../roster/writeRosterCounterparts.js'
import { writeRosterLeagueProjection } from '../roster/writeRosterLeagueProjection.js'
import { writeRosterLeaguesCenter } from '../roster/writeRosterLeaguesCenter.js'
import { writeRosterPlayerSearchIndexes } from '../roster/writeRosterPlayerSearchIndexes.js'
import { writeRosterPlayerSeasons } from '../roster/writeRosterPlayerSeasons.js'
import { readStatsLoadSources } from '../stats/readStatsLoadSources.js'
import { writeStatsClubsCenter } from '../stats/writeStatsClubsCenter.js'
import { writeStatsLeagueProjection } from '../stats/writeStatsLeagueProjection.js'
import { writeStatsLeaguesCenter } from '../stats/writeStatsLeaguesCenter.js'
import { writeStatsPlayerRoots } from '../stats/writeStatsPlayerRoots.js'
import { writeStatsPlayerSearchIndexes } from '../stats/writeStatsPlayerSearchIndexes.js'
import { writeStatsPlayerSeasons } from '../stats/writeStatsPlayerSeasons.js'

const clean = value => String(value === null || value === undefined ? '' : value).trim()
const object = value => (value && typeof value === 'object' && !Array.isArray(value) ? value : {})

export const REPAIRABLE_WRITE_ACTIONS = Object.freeze([
  'leagueOpen',
  'leagueLoad',
  'leagueTeamsClear',
  'leagueSeasonDelete',
  'rosterLoad',
  'rosterClear',
  'statsLoad',
  'statsClear',
])

export const inspectWriteActionRepair = receipt => {
  const source = object(receipt)
  const actionType = clean(source.actionType)
  const completedByStage = object(source.progress && source.progress.completedByStage)

  if (!clean(source.id || source.writeActionId)) {
    return { allowed: false, reason: 'לקבלה חסר מזהה תקין' }
  }
  if (!REPAIRABLE_WRITE_ACTIONS.includes(actionType)) {
    return { allowed: false, reason: 'סוג הפעולה אינו תומך בתיקון תוצרים' }
  }
  if (clean(source.status) !== 'open' || source.recoveryRequired !== true) {
    return { allowed: false, reason: 'הקבלה אינה פתוחה לתיקון' }
  }
  if (clean(source.canonicalOutcome) !== 'confirmed') {
    return { allowed: false, reason: 'הכתיבה הקנונית לא אושרה; נדרש קלט המקור' }
  }
  if (actionType === 'statsLoad' && !completedByStage.counterparts) {
    return {
      allowed: false,
      reason: 'תיקון statsLoad ללא קלט מקורי דורש השלמה מאושרת של counterparts',
    }
  }

  return { allowed: true, reason: '' }
}

export const requireWriteActionReceiptTarget = receipt => {
  const target = object(receipt.target)
  const leagueId = clean(target.leagueId)
  const teamId = clean(target.teamId)
  const seasonId = clean(target.seasonId)
  if (!leagueId || !seasonId) throw new Error('בקבלה חסרים מזהי ליגה או עונה')
  if (['rosterLoad', 'rosterClear', 'statsLoad', 'statsClear'].includes(receipt.actionType) && !teamId) {
    throw new Error('בקבלה חסר מזהה קבוצה')
  }
  return { leagueId, teamId, seasonId }
}

export const prepareLeagueReceiptState = async ({ actionType, target, updatedAt }) => {
  const sources = await readLeagueMutationSources(target)
  if (actionType === 'leagueTeamsClear') {
    return buildLeagueTeamsClearWritePlan({ ...target, ...sources, updatedAt })
  }
  if (actionType === 'leagueSeasonDelete') {
    return buildLeagueSeasonDeleteWritePlan({ ...target, ...sources, updatedAt })
  }

  const league = object(sources.existingLeague)
  const season = object(object(league.seasonsById)[target.seasonId])
  const rows = Object.entries(object(season.table && season.table.teamsById))
    .map(([teamId, row]) => ({ ...object(row), teamId }))
  const loadSources = await readLeagueLoadSources({
    league,
    season: { ...season, seasonId: target.seasonId },
    rows,
  })
  return buildLeagueLoadProjectionRepairPlan({
    ...target,
    ...loadSources,
    updatedAt,
  })
}

export const prepareRosterReceiptState = async ({ actionType, target, updatedAt }) => {
  const sources = await readRosterClearSources({
    input: target,
    includeCounterparts: actionType === 'rosterLoad',
  })
  const resolvedUpdatedAt = updatedAt
    || object(object(sources.existingTeamSeason).timestamps).updatedAt
    || object(object(sources.existingTeamRoot).timestamps).updatedAt
    || null
  if (actionType === 'rosterClear') {
    return buildRosterClearWritePlan({ ...target, ...sources, updatedAt: resolvedUpdatedAt })
  }
  return buildRosterProjectionRepairPlan({ ...target, ...sources, updatedAt: resolvedUpdatedAt })
}

export const prepareStatsReceiptState = async ({ actionType, target, updatedAt }) => {
  const sources = await readStatsLoadSources({
    ...target,
    incomingPlayers: [],
  })
  const resolvedUpdatedAt = updatedAt
    || object(object(sources.teamSeason).stats).updatedAt
    || object(object(sources.teamSeason).timestamps).updatedAt
    || null
  if (actionType === 'statsClear') {
    return buildStatsClearApprovedState({
      ...target,
      updatedAt: resolvedUpdatedAt,
      sources,
    })
  }
  return buildStatsProjectionRepairApprovedState({
    ...target,
    updatedAt: resolvedUpdatedAt,
    sources,
  })
}

const projectionStages = actionType => {
  if (actionType.startsWith('league')) {
    return [
      ['teamSeasonCompetitionSnapshots', writeTeamSeasonCompetitionSnapshots],
      ['leaguesCenter', writeLeaguesCenter],
      ['clubsCenter', writeClubsCenter],
    ]
  }
  if (actionType.startsWith('roster')) {
    return [
      ...(actionType === 'rosterLoad'
        ? [['counterparts', writeRosterCounterparts]]
        : []),
      ['playerSeasons', writeRosterPlayerSeasons],
      ['playerSearchIndexes', writeRosterPlayerSearchIndexes],
      ['leagueProjection', writeRosterLeagueProjection],
      ['leaguesCenter', writeRosterLeaguesCenter],
      ['clubsCenter', writeRosterClubsCenter],
    ]
  }
  return [
    ['playerRoots', writeStatsPlayerRoots],
    ['playerSeasons', writeStatsPlayerSeasons],
    ['playerSearchIndexes', writeStatsPlayerSearchIndexes],
    ['leagueProjection', writeStatsLeagueProjection],
    ['leaguesCenter', writeStatsLeaguesCenter],
    ['clubsCenter', writeStatsClubsCenter],
  ]
}

const auditRepair = ({ actionType, target, approvedState }) => {
  if (actionType.startsWith('league')) return auditLeague(target)
  if (actionType.startsWith('roster')) return auditRoster({ approvedState })
  return auditStats({ ...target, approvedState })
}

export const repairWriteActionReceipt = async ({ receiptId = '' } = {}) => {
  const id = clean(receiptId)
  if (!id) throw new Error('חסר מזהה קבלה')

  const receipt = await getWriteActionReceipt({ receiptId: id })
  const eligibility = inspectWriteActionRepair(receipt)
  if (!eligibility.allowed) throw new Error(eligibility.reason)

  const actionType = clean(receipt.actionType)
  const target = requireWriteActionReceiptTarget(receipt)
  const updatedAt = serverTimestamp()
  let approvedState
  if (actionType.startsWith('league')) {
    approvedState = await prepareLeagueReceiptState({ actionType, target, updatedAt })
  } else if (actionType.startsWith('roster')) {
    approvedState = await prepareRosterReceiptState({ actionType, target, updatedAt })
  } else {
    approvedState = await prepareStatsReceiptState({ actionType, target, updatedAt })
  }

  await beginWriteActionRepair({ receiptId: id })
  const stageResults = {}
  for (const [stageId, writer] of projectionStages(actionType)) {
    try {
      stageResults[stageId] = await writer({ approvedState })
      await completeWriteActionStage({ receiptId: id, stageId })
    } catch (error) {
      await failWriteActionStage({ receiptId: id, stageId, error }).catch(() => null)
      if (error instanceof Error && !error.receiptId) error.receiptId = id
      throw error
    }
  }

  try {
    const audit = await auditRepair({ actionType, target, approvedState })
    const receiptState = await completeWriteActionAudit({ receiptId: id, audit })
    return {
      receiptId: id,
      actionType,
      stageResults,
      audit,
      ...receiptState,
    }
  } catch (error) {
    await failWriteActionStage({ receiptId: id, stageId: 'audit', error }).catch(() => null)
    if (error instanceof Error && !error.receiptId) error.receiptId = id
    throw error
  }
}
