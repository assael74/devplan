// C:\projects\devplan\src\services\firestore\shorts\abilities\abilitiesUpsertHistory.js
import { doc, runTransaction, Timestamp } from 'firebase/firestore'
import { db } from '../../../firebase/firebase.js'
import { abilitiesShortsCollectionRef } from '../../shortsCollections.js'
import { shortsRefs } from '../shorts.refs.js'

import { makeId } from '../../../../utils/id.js'
import { abilitiesList } from '../../../../shared/abilities/abilities.list.js'
import { buildAbilitiesFull, calcLevelAndPotential } from '../../../../shared/abilities/abilitiesCalculator.js'

const safeStr = (v) => String(v ?? '').trim()

function roundToHalf(num) {
  return Math.round(num * 2) / 2
}

function mergeAbilitiesEqualNullAware({ oldAbilities = {}, newAbilities = {}, abilitiesList = [] }) {
  const merged = {}

  for (const it of abilitiesList) {
    const id = it?.id
    if (!id || id === 'growthStage') continue

    const oldVal = oldAbilities?.[id]
    const newVal = newAbilities?.[id]

    if (newVal == null && oldVal == null) merged[id] = null
    else if (newVal == null) merged[id] = oldVal ?? null
    else if (oldVal == null) merged[id] = newVal
    else merged[id] = roundToHalf((Number(oldVal) + Number(newVal)) / 2)
  }

  const ng = newAbilities?.growthStage
  const og = oldAbilities?.growthStage
  const newGrowth = ng == null || ng === '' ? null : Number(ng)
  const oldGrowth = og == null || og === '' ? null : Number(og)

  merged.growthStage =
    Number.isFinite(newGrowth) ? newGrowth : Number.isFinite(oldGrowth) ? oldGrowth : null

  return merged
}

export async function upsertAbilitiesHistory({ draft, dryRun = false } = {}) {
  const playerId = safeStr(draft?.playerId)
  if (!playerId) throw new Error('[abilitiesUpsertHistory] missing playerId')

  const itemId = playerId
  const draftDocAbilitiesId = safeStr(draft?.docAbilitiesId) // יכול להיות ריק (UI)
  const formId = makeId('abilForm')
  const now = Timestamp.now()

  const abilitiesFull = buildAbilitiesFull({
    draftAbilities: draft?.abilities || {},
    abilitiesList,
  })

  const normalizedAbilities = Object.fromEntries(
    Object.entries(abilitiesFull || {}).map(([k, v]) => [k, v == null ? null : Number(v)])
  )

  // refs (playersAbilities קבוע; abilitiesDocRef ייקבע בתוך הטרנזקציה)
  const playersAbilitiesMeta = shortsRefs.players.playersAbilities
  const playersAbilitiesRef = doc(db, playersAbilitiesMeta.collection, playersAbilitiesMeta.docId)

  if (dryRun) {
    return {
      dryRun: true,
      note:
        'dryRun: abilitiesDocId is resolved inside transaction from draft.docAbilitiesId || current.docAbilitiesId || newId',
      ids: { playerId, itemId, draftDocAbilitiesId, formId },
    }
  }

  return runTransaction(db, async (tx) => {
    // 1) READ playersAbilities FIRST (so we can resolve docAbilitiesId)
    const pSnap = await tx.get(playersAbilitiesRef)
    const pData = pSnap.exists() ? (pSnap.data() || {}) : {}
    const list = Array.isArray(pData.list) ? pData.list : []

    const idx = list.findIndex((x) => x?.id === itemId)
    const current = idx >= 0 ? (list[idx] || {}) : null
    const prevFormIds = Array.isArray(current?.formIds) ? current.formIds : []

    // Resolve abilitiesDocId from: draft -> current -> new
    const effectiveAbilitiesDocId =
      draftDocAbilitiesId || safeStr(current?.docAbilitiesId) || makeId('abilDoc')

    const abilitiesDocRef = doc(abilitiesShortsCollectionRef, effectiveAbilitiesDocId)

    // 2) READ abilitiesShorts doc (resolved)
    const aSnap = await tx.get(abilitiesDocRef)
    const aData = aSnap.exists() ? (aSnap.data() || {}) : {}
    const prevForms = Array.isArray(aData.formsAbilities) ? aData.formsAbilities : []

    // formEntry RAW
    const formEntry = {
      id: formId,
      evalDate: safeStr(draft?.evalDate) || null,
      roleId: safeStr(draft?.roleId) || null,
      growthStage: normalizedAbilities?.growthStage ?? null,
      abilities: normalizedAbilities,
      createdAt: now,
      updatedAt: now,
    }

    const nextAbilitiesDoc = {
      ...aData,
      docId: aData.docId || effectiveAbilitiesDocId,
      playerId: aData.playerId || playerId,
      formsAbilities: [...prevForms, formEntry],
      updatedAt: now,
      createdAt: aData.createdAt ?? now,
    }

    // MERGE on player (source of truth)
    const oldAbilities = current?.abilities || {}
    const mergedAbilities = mergeAbilitiesEqualNullAware({
      oldAbilities,
      newAbilities: normalizedAbilities,
      abilitiesList,
    })

    const { level, levelPotential } = calcLevelAndPotential({
      abilities: mergedAbilities,
      abilitiesList,
    })

    const nextItem = {
      ...(current || {}),
      id: itemId,
      level,
      levelPotential,
      docAbilitiesId: effectiveAbilitiesDocId, // ✅ תמיד נשמר לשחקן
      abilities: mergedAbilities,
      formIds: [...prevFormIds, formId],
      updatedAt: now,
      createdAt: current?.createdAt ?? now,
    }

    const nextList =
      idx >= 0 ? list.map((x, i) => (i === idx ? nextItem : x)) : [...list, nextItem]

    const nextPlayersAbilitiesDoc = {
      ...pData,
      docId: pData.docId || playersAbilitiesMeta.docId,
      docName: pData.docName || 'playersAbilities',
      list: nextList,
      updatedAt: now,
      createdAt: pData.createdAt ?? now,
    }

    // WRITES
    tx.set(abilitiesDocRef, nextAbilitiesDoc, { merge: true })
    tx.set(playersAbilitiesRef, nextPlayersAbilitiesDoc, { merge: true })

    return {
      ok: true,
      ids: { playerId, itemId, abilitiesDocId: effectiveAbilitiesDocId, formId },
      formsCount: nextItem.formIds.length,
    }
  })
}
