// src/application/actions/teamCascade/executeTeamCascadeDelete.action.js

import { deleteTeamCascadeData } from '../../../services/firestore/shorts/deleteTeamCascadeData.js'
import { buildArchivePatch } from './archiveTeamCascadePayments.js'
import { collectTeamCascadeDeletePlan } from './collectTeamCascadeDeletePlan.js'
import { deleteTeamCascadeStorage } from './deleteTeamCascadeStorage.js'
import { TEAM_CASCADE_DELETE_KEYS } from './teamCascadeDelete.keys.js'

const assertPlan = plan => {
  if (!plan?.teamId) throw new Error('[teamCascadeDelete] plan.teamId is required')
  if (plan?.type !== 'teamCascadeDelete') {
    throw new Error('[teamCascadeDelete] invalid plan type')
  }
}

function resolveConfirmedPlan(plan, shorts) {
  const current = collectTeamCascadeDeletePlan({ teamId: plan.teamId, shorts })
  const keys = ['playerIds', 'gameIds', 'meetingIds', 'paymentIds', 'statsDocIds']
  const targetsChanged = keys.some(key => {
    const confirmed = new Set(plan[key])
    return confirmed.size !== current[key].length || current[key].some(id => !confirmed.has(id))
  })
  const statsByGame = new Map(plan.statsRefs.map(ref => [ref.gameId, ref.statsDocId]))
  const statsChanged = statsByGame.size !== current.statsRefs.length ||
    current.statsRefs.some(ref => statsByGame.get(ref.gameId) !== ref.statsDocId)
  if (targetsChanged || statsChanged) {
    throw new Error('נתוני הקבוצה השתנו. פתח מחדש את חלון המחיקה ובדוק את הרשימה')
  }

  return current
}

export async function executeTeamCascadeDelete({ plan }) {
  assertPlan(plan)

  const { teamId } = plan
  const archivedAt = Date.now()
  const { plan: current, dryRun } = await deleteTeamCascadeData({
    teamId,
    keys: TEAM_CASCADE_DELETE_KEYS,
    resolvePlan: shorts => resolveConfirmedPlan(plan, shorts),
    archivePayment: (payment, currentPlan) => ({
      ...payment,
      ...buildArchivePatch({ payment, plan: currentPlan, archivedAt }),
    }),
  })

  const storage = dryRun ? null : await deleteTeamCascadeStorage({ plan: current })
  return { ok: true, teamId, dryRun, storage }
}
