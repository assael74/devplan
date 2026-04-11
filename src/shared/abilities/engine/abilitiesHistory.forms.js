// C:\projects\devplan\src\shared\abilities\engine\abilitiesHistory.forms.js

// קובץ מקביל: functions/src/domain/abilities/engine/abilitiesHistory.forms.js
// הערה: בכל שינוי בקובץ זה יש לבדוק ולעדכן גם את הקובץ המקביל בצד Functions.

import { makeId } from '../../../utils/id.js'
import { abilitiesList } from '../abilities.list.js'
import { buildAbilitiesFull } from '../abilitiesCalculator.js'
import { buildWindowMeta } from './abilitiesHistory.dates.js'
import { safeStr } from './abilitiesHistory.utils.js'

export function normalizeAbilities(abilities = {}) {
  const full = buildAbilitiesFull({
    draftAbilities: abilities || {},
    abilitiesList,
  })

  return Object.fromEntries(
    Object.entries(full || {}).map(([k, v]) => [k, v == null ? null : Number(v)])
  )
}

export function buildFormEntry({ draft, formId, now }) {
  const abilities = normalizeAbilities(draft?.abilities || {})
  const windowMeta = buildWindowMeta(draft?.evalDate)

  return {
    id: formId,
    evalDate: windowMeta.evalDate,
    windowKey: windowMeta.windowKey,
    windowStart: windowMeta.windowStart,
    windowEnd: windowMeta.windowEnd,
    evaluatorId: safeStr(draft?.evaluatorId) || null,
    teamYear: safeStr(
      draft?.team?.teamYear ||
      draft?.teamYear ||
      draft?.publicMeta?.teamYear
    ) || null,
    source: safeStr(draft?.source) || 'abilitiesForm',
    growthStage: abilities?.growthStage ?? null,
    abilities,
    createdAt: now,
    updatedAt: now,
  }
}

export function normalizeStoredForm(form = {}) {
  const abilities = normalizeAbilities(form?.abilities || {})
  const windowMeta = buildWindowMeta(form?.evalDate)

  return {
    ...form,
    id: safeStr(form?.id) || makeId('abilForm'),
    evalDate: windowMeta.evalDate,
    windowKey: safeStr(form?.windowKey) || windowMeta.windowKey,
    windowStart: safeStr(form?.windowStart) || windowMeta.windowStart,
    windowEnd: safeStr(form?.windowEnd) || windowMeta.windowEnd,
    evaluatorId: safeStr(form?.evaluatorId) || null,
    teamYear: safeStr(form?.teamYear) || null,
    source: safeStr(form?.source) || 'abilitiesForm',
    growthStage: abilities?.growthStage == null ? null : Number(abilities.growthStage),
    abilities,
    createdAt: form?.createdAt ?? null,
    updatedAt: form?.updatedAt ?? null,
  }
}
