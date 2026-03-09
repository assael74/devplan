// C:\projects\devplan\src\ui\forms\helpers\abilities\abilitiesCreateForm.derived.js
import { clean, buildDomainsFromDraftAbilities } from './abilitiesCreateForm.helpers.js'

export function pickDraftBits(draft = {}) {
  const lockPlayerId = Boolean(draft?.__locks?.lockPlayerId)
  const playerId = clean(draft?.playerId)
  const evalDate = clean(draft?.evalDate)
  const objectType = clean(draft?.objectType)
  const teamId = clean(draft?.teamId)
  const roleId = clean(draft?.roleId)

  const abilitiesValues = draft?.abilities || {}
  const growthStageValue = abilitiesValues?.growthStage ?? null
  const hasGrowthStage = !(growthStageValue == null || growthStageValue === '')
  const missingGrowthStage = !hasGrowthStage

  return {
    lockPlayerId,
    playerId,
    evalDate,
    objectType,
    teamId,
    roleId,
    abilitiesValues,
    growthStageValue,
    hasGrowthStage,
    missingGrowthStage,
  }
}

export function calcHasAtLeastOneAbility(draft) {
  const a = draft?.abilities || {}
  return Object.entries(a).some(([key, v]) => {
    if (key === 'growthStage') return false
    if (v == null) return false
    if (typeof v === 'string') return v.trim() !== ''
    return true
  })
}

export function calcReady({ playerId, roleId, hasGrowthStage, hasAtLeastOneAbility }) {
  return Boolean(playerId && roleId && hasGrowthStage && hasAtLeastOneAbility)
}

export function calcPlayers({ context, objectType, teamId }) {
  const all = Array.isArray(context?.players) ? context.players : []
  if (objectType === 'team' && teamId) return all.filter((p) => clean(p?.teamId) === teamId)
  return all
}

export function calcDomains(abilitiesValues) {
  const all = buildDomainsFromDraftAbilities(abilitiesValues)
  return all.filter((d) => d.id !== 'growth')
}
