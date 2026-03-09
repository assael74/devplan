// C:\projects\devplan\src\services\firestore\shorts\trainings\trainingsUpsertWeek.js

import { doc, runTransaction, Timestamp } from 'firebase/firestore'
import { db } from '../../../firebase/firebase.js'
import { shortsRefs } from '../shorts.refs.js'
import { upsertWeekDraftIntoTeamsTrainingList } from './trainingsShorts.upsert.js'

export async function upsertTrainingWeekTx({ draft, dryRun = false } = {}) {
  if (!draft) throw new Error('[upsertTrainingWeekTx] missing draft')

  const meta = shortsRefs?.teams?.teamsTraining
  if (!meta?.collection || !meta?.docId) {
    throw new Error('[upsertTrainingWeekTx] missing shortsRefs.teams.teamsTraining')
  }

  const ref = doc(db, meta.collection, meta.docId)
  const now = Timestamp.now()

  if (dryRun) {
    return {
      dryRun: true,
      shortKey: 'teams.teamsTraining',
      docPath: `${meta.collection}/${meta.docId}`,
    }
  }

  return runTransaction(db, async (tx) => {
    const snap = await tx.get(ref)
    const data = snap.exists() ? (snap.data() || {}) : {}
    const list = Array.isArray(data?.list) ? data.list : []

    const { list: nextList, teamTraining, week } = upsertWeekDraftIntoTeamsTrainingList({
      list,
      draft,
      now: now.toMillis(),
    })

    const nextDoc = {
      ...data,
      docId: data?.docId || meta.docId,
      docName: data?.docName || 'teamsTraining',
      list: nextList,
      updatedAt: now,
      createdAt: data?.createdAt ?? now,
    }

    tx.set(ref, nextDoc, { merge: true })

    return {
      ok: true,
      teamId: teamTraining?.id || null,
      weekId: week?.weekId || null,
      weeksCount: Array.isArray(teamTraining?.trainingWeeks)
        ? teamTraining.trainingWeeks.length
        : null,
    }
  })
}
