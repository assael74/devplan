// services/firestore/shorts/abilities/abilitiesUpsertHistory.js

/*
הוא לא “מחשב”
הוא “מפעיל את המנוע ושומר תוצאה”
*/

import { doc, runTransaction, Timestamp } from 'firebase/firestore'
import { db } from '../../../firebase/firebase.js'
import { abilitiesShortsCollectionRef } from '../../shortsCollections.js'
import { shortsRefs } from '../shorts.refs.js'

import { makeId } from '../../../../utils/id.js'
import { safeStr } from '../../../../shared/abilities/engine/abilitiesHistory.utils.js'
import {
  buildFormEntry,
  normalizeStoredForm,
} from '../../../../shared/abilities/engine/abilitiesHistory.forms.js'
import {
  buildFinalPlayerResult,
} from '../../../../shared/abilities/engine/abilitiesHistory.scoring.js'

const ENGINE_SOURCE = 'abilitiesEngineV2'

function buildSlimDomainsMeta(domainsMeta = []) {
  return Array.isArray(domainsMeta)
    ? domainsMeta.map((domain) => ({
        domain: domain?.domain || null,
        score: domain?.score ?? null,
        potentialScore: domain?.potentialScore ?? null,
        filledCount: domain?.filledCount ?? 0,
        totalCount: domain?.totalCount ?? 0,
        coveragePct: domain?.coveragePct ?? 0,
        validity: domain?.validity || 'invalid',
        reliability: domain?.reliability || 'low',
      }))
    : []
}

function buildLatestComputedPayload(finalResult = {}) {
  return {
    abilities: finalResult?.abilities || {},
    domainScores: finalResult?.domainScores || {},
    domainPotentialScores: finalResult?.domainPotentialScores || {},

    domainsMeta: buildSlimDomainsMeta(finalResult?.domainsMeta),

    level: finalResult?.level ?? null,
    levelPotential: finalResult?.levelPotential ?? null,

    reliability: finalResult?.reliability || {
      ability: 'low',
      potential: 'low',
    },

    coverage: finalResult?.coverage || {
      ability: 0,
      potential: 0,
      physical: 0,
    },

    validDomainsCount: finalResult?.validDomainsCount || {
      ability: 0,
      potential: 0,
    },

    snapshotsMeta: {
      windowsCount: finalResult?.snapshotsMeta?.windowsCount ?? 0,
      lastWindowKey: finalResult?.snapshotsMeta?.lastWindowKey || null,
      formsCount: finalResult?.snapshotsMeta?.formsCount ?? 0,
      evaluatorsCount: finalResult?.snapshotsMeta?.evaluatorsCount ?? 0,
    },
  }
}

function buildAbilitiesHistoryDoc({
  abilitiesData,
  effectiveAbilitiesDocId,
  playerId,
  allForms,
  finalResult,
  now,
}) {
  return {
    ...abilitiesData,
    docId: abilitiesData?.docId || effectiveAbilitiesDocId,
    playerId: abilitiesData?.playerId || playerId,

    formsAbilities: allForms,
    windowsAbilities: Array.isArray(finalResult?.windows) ? finalResult.windows : [],

    latestComputed: buildLatestComputedPayload(finalResult),

    updatedFrom: ENGINE_SOURCE,
    updatedAt: now,
    createdAt: abilitiesData?.createdAt ?? now,
  }
}

function buildPlayerAbilitiesItem({
  current,
  itemId,
  effectiveAbilitiesDocId,
  finalResult,
  allForms,
  now,
}) {
  return {
    ...(current || {}),
    id: itemId,
    docAbilitiesId: effectiveAbilitiesDocId,

    abilities: finalResult?.abilities || {},
    domainScores: finalResult?.domainScores || {},
    domainPotentialScores: finalResult?.domainPotentialScores || {},
    domainsMeta: buildSlimDomainsMeta(finalResult?.domainsMeta),

    level: finalResult?.level ?? null,
    levelPotential: finalResult?.levelPotential ?? null,

    reliability: finalResult?.reliability || {
      ability: 'low',
      potential: 'low',
    },

    coverage: finalResult?.coverage || {
      ability: 0,
      potential: 0,
      physical: 0,
    },

    validDomainsCount: finalResult?.validDomainsCount || {
      ability: 0,
      potential: 0,
    },

    lastWindowKey: finalResult?.snapshotsMeta?.lastWindowKey || null,
    formsCount: finalResult?.snapshotsMeta?.formsCount ?? allForms.length,
    evaluatorsCount: finalResult?.snapshotsMeta?.evaluatorsCount ?? 0,
    windowsCount: finalResult?.snapshotsMeta?.windowsCount ?? 0,

    updatedFrom: ENGINE_SOURCE,
    updatedAt: now,
    createdAt: current?.createdAt ?? now,
  }
}

export async function upsertAbilitiesHistory({ draft, dryRun = false } = {}) {
  const playerId = safeStr(draft?.playerId)
  if (!playerId) throw new Error('[abilitiesUpsertHistory] missing playerId')

  const itemId = playerId
  const draftDocAbilitiesId = safeStr(draft?.docAbilitiesId)
  const formId = makeId('abilForm')
  const now = Timestamp.now()

  const playersAbilitiesMeta = shortsRefs.players.playersAbilities
  const playersAbilitiesRef = doc(
    db,
    playersAbilitiesMeta.collection,
    playersAbilitiesMeta.docId
  )

  if (dryRun) {
    return {
      dryRun: true,
      ids: { playerId, itemId, draftDocAbilitiesId, formId },
      note: 'dryRun only',
    }
  }

  return runTransaction(db, async (tx) => {
    const playersSnap = await tx.get(playersAbilitiesRef)
    const playersData = playersSnap.exists() ? (playersSnap.data() || {}) : {}
    const list = Array.isArray(playersData?.list) ? playersData.list : []

    const idx = list.findIndex((x) => x?.id === itemId)
    const current = idx >= 0 ? (list[idx] || {}) : null

    const effectiveAbilitiesDocId =
      draftDocAbilitiesId || safeStr(current?.docAbilitiesId) || makeId('abilDoc')

    const abilitiesDocRef = doc(abilitiesShortsCollectionRef, effectiveAbilitiesDocId)

    const abilitiesSnap = await tx.get(abilitiesDocRef)
    const abilitiesData = abilitiesSnap.exists() ? (abilitiesSnap.data() || {}) : {}
    const prevFormsRaw = Array.isArray(abilitiesData?.formsAbilities)
      ? abilitiesData.formsAbilities
      : []

    const newFormEntry = buildFormEntry({ draft, formId, now })
    const allForms = [...prevFormsRaw, newFormEntry].map((form) => normalizeStoredForm(form))
    const finalResult = buildFinalPlayerResult({ forms: allForms })

    const nextAbilitiesDoc = buildAbilitiesHistoryDoc({
      abilitiesData,
      effectiveAbilitiesDocId,
      playerId,
      allForms,
      finalResult,
      now,
    })

    const nextItem = buildPlayerAbilitiesItem({
      current,
      itemId,
      effectiveAbilitiesDocId,
      finalResult,
      allForms,
      now,
    })

    const nextList =
      idx >= 0
        ? list.map((item, i) => (i === idx ? nextItem : item))
        : [...list, nextItem]

    const nextPlayersAbilitiesDoc = {
      ...playersData,
      docId: playersData?.docId || playersAbilitiesMeta.docId,
      docName: playersData?.docName || 'playersAbilities',
      list: nextList,
      updatedAt: now,
      createdAt: playersData?.createdAt ?? now,
    }

    tx.set(abilitiesDocRef, nextAbilitiesDoc, { merge: true })
    tx.set(playersAbilitiesRef, nextPlayersAbilitiesDoc, { merge: true })

    return {
      ok: true,
      ids: {
        playerId,
        itemId,
        abilitiesDocId: effectiveAbilitiesDocId,
        formId,
      },
      summary: {
        formsCount: nextItem.formsCount,
        windowsCount: nextItem.windowsCount ?? 0,
        level: nextItem.level,
        levelPotential: nextItem.levelPotential,
        abilityReliability: nextItem?.reliability?.ability || null,
        potentialReliability: nextItem?.reliability?.potential || null,
      },
    }
  })
}
