// functions\src\domain\abilities\engine\abilitiesHistory.windows.js

// קובץ מקביל: src/shared/abilities/engine/abilitiesHistory.windows.js
// הערה: בכל שינוי בקובץ זה יש לבדוק ולעדכן גם את הקובץ המקביל בצד ה־src.

const { abilitiesList } = require('../abilities.list')
const {
  safeStr,
  toNum,
  roundToHalf,
  isFilled,
  parseIsoDateOnly,
} = require('./abilitiesHistory.utils')
const {
  normalizeAbilities,
  normalizeStoredForm,
} = require('./abilitiesHistory.forms')

const DAY_MS = 24 * 60 * 60 * 1000
const MAX_WINDOW_DAYS = 56
const MERGE_16_WEEKS_DAYS = 112
const MERGE_6_MONTHS_DAYS = 183

function diffDays(dateA, dateB) {
  const a = dateA instanceof Date ? dateA.getTime() : null
  const b = dateB instanceof Date ? dateB.getTime() : null
  if (!Number.isFinite(a) || !Number.isFinite(b)) return null
  return Math.floor(Math.abs(a - b) / DAY_MS)
}

function formatDateOnly(dateObj) {
  if (!(dateObj instanceof Date) || Number.isNaN(dateObj.getTime())) return null
  const yyyy = dateObj.getUTCFullYear()
  const mm = String(dateObj.getUTCMonth() + 1).padStart(2, '0')
  const dd = String(dateObj.getUTCDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

function averageGrowthStage(values = []) {
  const nums = values
    .map((v) => toNum(v, null))
    .filter((v) => Number.isFinite(v))

  if (!nums.length) return null
  return roundToHalf(nums.reduce((sum, n) => sum + n, 0) / nums.length)
}

function groupFormsByWindow(forms = []) {
  const normalized = forms
    .map((raw) => normalizeStoredForm(raw))
    .map((form) => ({
      ...form,
      __evalDateObj: parseIsoDateOnly(form?.evalDate),
    }))
    .sort((a, b) => {
      const aTime = a?.__evalDateObj?.getTime?.() ?? 0
      const bTime = b?.__evalDateObj?.getTime?.() ?? 0
      return aTime - bTime
    })

  const windows = []
  let currentWindow = null

  for (const form of normalized) {
    const formDate = form?.__evalDateObj || null

    if (!currentWindow) {
      currentWindow = {
        windowIndex: 1,
        windowKey: null,
        windowStart: formatDateOnly(formDate),
        windowEnd: formatDateOnly(formDate),
        evalDates: form?.evalDate ? [form.evalDate] : [],
        forms: [form],
        __startDateObj: formDate,
        __endDateObj: formDate,
      }
      continue
    }

    const currentEndDate = currentWindow.__endDateObj || currentWindow.__startDateObj || null
    const gapFromCurrentWindow = diffDays(formDate, currentEndDate)

    if (gapFromCurrentWindow != null && gapFromCurrentWindow <= MAX_WINDOW_DAYS) {
      currentWindow.forms.push(form)
      if (form?.evalDate) currentWindow.evalDates.push(form.evalDate)

      if (
        formDate instanceof Date &&
        !Number.isNaN(formDate.getTime()) &&
        (
          !(currentWindow.__endDateObj instanceof Date) ||
          Number.isNaN(currentWindow.__endDateObj.getTime()) ||
          formDate.getTime() > currentWindow.__endDateObj.getTime()
        )
      ) {
        currentWindow.__endDateObj = formDate
        currentWindow.windowEnd = formatDateOnly(formDate)
      }

      continue
    }

    currentWindow.windowKey =
      `${currentWindow.windowStart || 'undated'}_${currentWindow.windowEnd || 'undated'}`

    windows.push(currentWindow)

    currentWindow = {
      windowIndex: windows.length + 1,
      windowKey: null,
      windowStart: formatDateOnly(formDate),
      windowEnd: formatDateOnly(formDate),
      evalDates: form?.evalDate ? [form.evalDate] : [],
      forms: [form],
      __startDateObj: formDate,
      __endDateObj: formDate,
    }
  }

  if (currentWindow) {
    currentWindow.windowKey =
      `${currentWindow.windowStart || 'undated'}_${currentWindow.windowEnd || 'undated'}`
    windows.push(currentWindow)
  }

  return windows.map((window) => ({
    windowIndex: window.windowIndex,
    windowKey: window.windowKey,
    windowStart: window.windowStart,
    windowEnd: window.windowEnd,
    evalDates: [...new Set(window.evalDates.filter(Boolean))].sort(),
    forms: window.forms.map((form) => {
      const { __evalDateObj, ...cleanForm } = form
      return cleanForm
    }),
  }))
}

function averageRatings(values = []) {
  const nums = values.filter((v) => isFilled(v)).map((v) => Number(v))
  if (!nums.length) return null
  return roundToHalf(nums.reduce((sum, n) => sum + n, 0) / nums.length)
}

function resolveWindowGrowthStage(forms = []) {
  return averageGrowthStage(forms.map((form) => form?.growthStage))
}

function buildWindowSnapshot(windowBucket = {}) {
  const forms = Array.isArray(windowBucket?.forms) ? windowBucket.forms : []
  const evaluators = Array.from(
    new Set(forms.map((f) => safeStr(f?.evaluatorId || f?.roleId)).filter(Boolean))
  )

  const mergedAbilities = {}

  for (const item of abilitiesList) {
    const id = item?.id
    if (!id) continue

    if (id === 'growthStage') {
      mergedAbilities[id] = resolveWindowGrowthStage(forms)
      continue
    }

    const values = forms.map((form) => form?.abilities?.[id])
    mergedAbilities[id] = averageRatings(values)
  }

  return {
    windowIndex: windowBucket?.windowIndex || null,
    windowKey: windowBucket?.windowKey || 'undated',
    windowStart: windowBucket?.windowStart || null,
    windowEnd: windowBucket?.windowEnd || null,
    formsCount: forms.length,
    evaluatorsCount: evaluators.length,
    evaluatorIds: evaluators,
    evalDates: [...new Set(forms.map((f) => f?.evalDate).filter(Boolean))].sort(),
    abilities: mergedAbilities,
  }
}

function resolveWindowMergeStrategy(prevWindow = null, nextWindow = null) {
  const prevEnd = parseIsoDateOnly(prevWindow?.windowEnd)
  const nextStart = parseIsoDateOnly(nextWindow?.windowStart)
  const gapDays = diffDays(prevEnd, nextStart)

  if (gapDays == null) {
    return {
      gapDays: null,
      mode: 'replace',
      oldWeight: 0,
      newWeight: 1,
    }
  }

  if (gapDays <= MERGE_16_WEEKS_DAYS) {
    return {
      gapDays,
      mode: 'merge_70_30',
      oldWeight: 0.3,
      newWeight: 0.7,
    }
  }

  if (gapDays <= MERGE_6_MONTHS_DAYS) {
    return {
      gapDays,
      mode: 'merge_80_20',
      oldWeight: 0.2,
      newWeight: 0.8,
    }
  }

  return {
    gapDays,
    mode: 'replace',
    oldWeight: 0,
    newWeight: 1,
  }
}

function mergeWindowAbilitiesHistory(windows = []) {
  if (!windows.length) {
    return {
      abilities: normalizeAbilities({}),
      lastWindowKey: null,
      windowsCount: 0,
      mergeLog: [],
    }
  }

  let merged = normalizeAbilities(windows[0]?.abilities || {})
  const mergeLog = []

  for (let i = 1; i < windows.length; i += 1) {
    const prevWindow = windows[i - 1]
    const nextWindow = windows[i]
    const current = normalizeAbilities(nextWindow?.abilities || {})
    const strategy = resolveWindowMergeStrategy(prevWindow, nextWindow)

    if (strategy.mode === 'replace') {
      const replaced = {}

      for (const item of abilitiesList) {
        const id = item?.id
        if (!id) continue

        if (id === 'growthStage') {
          const nextGrowth = toNum(current?.growthStage, null)
          const prevGrowth = toNum(merged?.growthStage, null)
          replaced.growthStage = Number.isFinite(nextGrowth) ? nextGrowth : prevGrowth
          continue
        }

        const newVal = toNum(current?.[id], null)
        const oldVal = toNum(merged?.[id], null)
        replaced[id] = newVal == null ? oldVal : newVal
      }

      merged = replaced
      mergeLog.push({
        fromWindowKey: prevWindow?.windowKey || null,
        toWindowKey: nextWindow?.windowKey || null,
        gapDays: strategy.gapDays,
        mode: strategy.mode,
        oldWeight: strategy.oldWeight,
        newWeight: strategy.newWeight,
      })
      continue
    }

    const next = {}

    for (const item of abilitiesList) {
      const id = item?.id
      if (!id) continue

      if (id === 'growthStage') {
        const nextGrowth = toNum(current?.growthStage, null)
        const prevGrowth = toNum(merged?.growthStage, null)
        next.growthStage = Number.isFinite(nextGrowth) ? nextGrowth : prevGrowth
        continue
      }

      const oldVal = toNum(merged?.[id], null)
      const newVal = toNum(current?.[id], null)

      if (newVal == null && oldVal == null) next[id] = null
      else if (newVal == null) next[id] = oldVal
      else if (oldVal == null) next[id] = newVal
      else next[id] = roundToHalf(oldVal * strategy.oldWeight + newVal * strategy.newWeight)
    }

    merged = next

    mergeLog.push({
      fromWindowKey: prevWindow?.windowKey || null,
      toWindowKey: nextWindow?.windowKey || null,
      gapDays: strategy.gapDays,
      mode: strategy.mode,
      oldWeight: strategy.oldWeight,
      newWeight: strategy.newWeight,
    })
  }

  return {
    abilities: merged,
    lastWindowKey: windows[windows.length - 1]?.windowKey || null,
    windowsCount: windows.length,
    mergeLog,
  }
}

module.exports = {
  groupFormsByWindow,
  averageRatings,
  resolveWindowGrowthStage,
  buildWindowSnapshot,
  mergeWindowAbilitiesHistory,
}
