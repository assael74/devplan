// src/services/firestore/shorts/abilities/abilitiesDryRun.js
import { makeId } from '../../../../utils/id.js'
import {
  calcLevelAndPotential,
  buildAbilitiesFull,
} from '../../../../shared/abilities/abilitiesCalculator.js'
import { abilitiesList } from '../../../../shared/abilities/abilities.list.js'

const clean = (v) => String(v ?? '').trim()

export function buildAbilitiesDryRunPayload({ draft, now = Date.now() }) {
  const playerId = clean(draft?.playerId)
  if (!playerId) throw new Error('[abilitiesDryRun] missing playerId')

  // ===== 1. FULL ABILITIES MAP (כולל nulls) =====
  const abilitiesFull = buildAbilitiesFull({
    draftAbilities: draft?.abilities || {},
    abilitiesList,
  })

  // ===== 2. CALCULATE LEVELS =====
  const { level, levelPotential } = calcLevelAndPotential({
    abilities: abilitiesFull,
    abilitiesList,
  })

  // ===== 3. IDS =====
  const itemId = clean(draft?.id) || makeId()
  const formId = makeId()
  const abilitiesShortsDocId = makeId()

  const growthStage = abilitiesFull?.growthStage ?? null

  // ===== 4. PLAYER ITEM =====
  const playerItem = {
    id: itemId,
    level,
    levelPotential,
    abilities: abilitiesFull,
    docAbilitiesId: formId,
    updatedAt: now,
    createdAt: now,
  }

  // ===== 5. GENERAL FORM ENTRY =====
  const formEntry = {
    id: formId,
    evalDate: clean(draft?.evalDate) || null,
    roleId: clean(draft?.roleId) || null,
    growthStage,
    abilities: abilitiesFull,
    createdAt: now,
    updatedAt: now,
  }

  const targets = {
    playersAbilities: {
      collection: 'playersShorts',
      docId: playerId,
      docName: 'playersAbilities',
    },
    abilitiesShorts: {
      collection: 'abilitiesShorts',
      docId: playerId,
      docIdField: abilitiesShortsDocId,
    },
  }

  return { targets, playerItem, formEntry }
}
