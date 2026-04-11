// functions/src/domain/abilities/abilitiesCalculator.js

// קובץ מקביל: src/shared/abilities/abilitiesCalculator.js
// הערה: בכל שינוי בקובץ זה יש לבדוק ולעדכן גם את הקובץ המקביל בצד ה־src.

function roundToHalf(num) {
  return Math.round(num * 2) / 2
}

function toNum(v) {
  if (v == null || v === '') return 0
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

function clamp(num, min, max) {
  return Math.max(min, Math.min(max, num))
}

function calcLevelAndPotential({ abilities = {}, abilitiesList = [] }) {
  let sum = 0
  let totalWeight = 0

  for (const it of abilitiesList) {
    const id = it?.id
    const weight = Number(it?.weight ?? 1) || 1
    if (!id || id === 'growthStage') continue

    const v = toNum(abilities[id])
    if (v > 0) {
      sum += v * weight
      totalWeight += weight
    }
  }

  const level = totalWeight === 0 ? 0 : roundToHalf(sum / totalWeight)

  const growthStage = toNum(abilities?.growthStage)
  let levelPotential = level
  if (growthStage > 3) levelPotential += 0.5
  else if (growthStage < 3) levelPotential -= 0.5

  levelPotential = clamp(roundToHalf(levelPotential), 1, 5)

  return { level, levelPotential }
}

function mergeAbilitiesWeighted({
  oldAbilities = {},
  newAbilities = {},
  playerId = null,
  abilitiesList = [],
}) {
  const result = {}

  for (const it of abilitiesList) {
    const id = it?.id
    if (!id || id === 'growthStage') continue

    const oldVal = toNum(oldAbilities[id])
    const newVal = toNum(newAbilities[id])

    let finalVal = 0
    if (oldVal === 0) finalVal = newVal
    else if (newVal === 0) finalVal = oldVal
    else finalVal = roundToHalf(oldVal * 0.3 + newVal * 0.7)

    result[id] = finalVal
  }

  const growthStage = toNum(newAbilities?.growthStage)
  const mergedAbilities = { ...result, growthStage }

  const { level, levelPotential } = calcLevelAndPotential({
    abilities: mergedAbilities,
    abilitiesList,
  })

  return {
    id: playerId,
    abilities: mergedAbilities,
    level,
    levelPotential,
  }
}

function buildAbilitiesFull({ draftAbilities = {}, abilitiesList = [] }) {
  const full = {}

  for (const it of abilitiesList) {
    const id = it?.id
    if (!id) continue
    full[id] = null
  }

  for (const [k, v] of Object.entries(draftAbilities || {})) {
    if (!k) continue
    if (v == null || v === '') full[k] = null
    else full[k] = Number.isFinite(Number(v)) ? Number(v) : null
  }

  return full
}

function mergeAbilitiesEqual({
  oldAbilities = {},
  newAbilities = {},
  abilitiesList = [],
}) {
  const result = {}

  for (const it of abilitiesList) {
    const id = it?.id
    if (!id) continue

    const oldVal = oldAbilities?.[id]
    const newVal = newAbilities?.[id]

    if (newVal == null && oldVal == null) {
      result[id] = null
    } else if (newVal == null) {
      result[id] = oldVal ?? null
    } else if (oldVal == null) {
      result[id] = newVal
    } else {
      result[id] = Math.round((oldVal + newVal) * 10) / 20
    }
  }

  return result
}

module.exports = {
  calcLevelAndPotential,
  mergeAbilitiesWeighted,
  buildAbilitiesFull,
  mergeAbilitiesEqual,
}
