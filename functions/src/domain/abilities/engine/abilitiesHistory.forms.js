// functions\src\domain\abilities\engine\abilitiesHistory.forms.js

// קובץ מקביל: src/shared/abilities/engine/abilitiesHistory.forms.js
// הערה: בכל שינוי בקובץ זה יש לבדוק ולעדכן גם את הקובץ המקביל בצד ה־src.

const { makeId } = require('../../../shared/makeId')
const { abilitiesList } = require('../abilities.list')
const { buildAbilitiesFull } = require('../abilitiesCalculator')
const { buildWindowMeta } = require('./abilitiesHistory.dates')
const { safeStr } = require('./abilitiesHistory.utils')

function normalizeAbilities(abilities = {}) {
  const full = buildAbilitiesFull({
    draftAbilities: abilities || {},
    abilitiesList,
  })

  return Object.fromEntries(
    Object.entries(full || {}).map(([k, v]) => [k, v == null ? null : Number(v)])
  )
}

function buildFormEntry({ draft, formId, now }) {
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

function normalizeStoredForm(form = {}) {
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

module.exports = {
  normalizeAbilities,
  buildFormEntry,
  normalizeStoredForm,
}
