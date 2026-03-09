// C:\projects\devplan\src\services\firestore\shorts\trainings\trainingsShorts.service.js
import { doc, runTransaction, Timestamp } from 'firebase/firestore'
import { db } from '../../../firebase/firebase.js'
import { shortsRefs } from '../shorts.refs.js'

import { upsertWeekDraftIntoTeamsTrainingList } from './trainingsShorts.upsert.js'

const safeStr = (v) => String(v ?? '').trim()

export async function upsertTrainingWeek({
  draft,
  shortKey = 'teams.teamsTraining',
  meta = {},
  dryRun = false,
} = {}) {
  if (!draft) throw new Error('[trainingsShorts.service] missing draft')

  const teamId = safeStr(draft?.teamId || draft?.id)
  if (!teamId) throw new Error('[trainingsShorts.service] missing teamId')

  // Resolve docRef from shortsRefs by shortKey
  const [group, docName] = String(shortKey || '').split('.')
  const refMeta = shortsRefs[group][docName]
  if (!refMeta?.collection || !refMeta?.docId) {
    throw new Error(`[trainingsShorts.service] unknown shortKey "${shortKey}"`)
  }

  const ref = doc(db, refMeta.collection, refMeta.docId)

  if (dryRun) {
    return {
      dryRun: true,
      shortKey,
      docPath: `${refMeta.collection}/${refMeta.docId}`,
      teamId,
      meta,
    }
  }

  return runTransaction(db, async (tx) => {
    const snap = await tx.get(ref)
    const data = snap.exists() ? (snap.data() || {}) : {}

    const currentList = Array.isArray(data?.list) ? data.list : []
    const now = Timestamp.now()

    // Compute nextList (business logic is isolated here)
    const { list: nextList, teamTraining, week } = upsertWeekDraftIntoTeamsTrainingList({
      list: currentList,
      draft: { ...draft, teamId }, // enforce teamId normalization
      now: now.toMillis(),
      meta,
    })

    // Minimal doc stamping
    const nextDoc = {
      ...data,
      docId: data?.docId || refMeta.docId,
      docName: data?.docName || 'teamsTraining',
      list: nextList,
      updatedAt: now,
      createdAt: data?.createdAt ?? now,
    }

    tx.set(ref, nextDoc, { merge: true })

    return {
      ok: true,
      shortKey,
      teamId: teamTraining?.id || teamId,
      weekId: week?.weekId || null,
      updated: true,
      meta,
    }
  })
}
