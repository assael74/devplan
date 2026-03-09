// src/features/players/components/preview/PreviewDomainCard/domains/team/abilities/abilities.team.domain.logic.js
import { resolveAbilitiesDomain } from '../../../../../../../../shared/abilities/abilities.domain.logic'
import { abilitiesList } from '../../../../../../../../shared/abilities/abilities.list'
import { roundTo, toNum } from '../../../../../../../../shared/abilities/abilities.utils'

const pickAbilitiesTeam = (entity) => (entity || {}).abilitiesTeam || null

const pickSliceNode = (abilitiesTeam, scope, key) => {
  if (!abilitiesTeam) return null
  if (scope === 'layer') return abilitiesTeam.byLayer[key] || null
  if (scope === 'position') return abilitiesTeam.byPosition[key] || null
  return abilitiesTeam
}

const pickByAbilityId = (node) => (node?.byAbilityId && typeof node.byAbilityId === 'object' ? node.byAbilityId : {})

const buildAbilitiesMapFromAvg = (byAbilityId) => {
  const out = {}
  for (const [id, a] of Object.entries(byAbilityId || {})) {
    const v = roundTo(a?.avg, 1)
    if (v != null) out[id] = v
  }
  return out
}

const buildCoverageMap = (byAbilityId) => {
  const map = {}
  for (const [id, a] of Object.entries(byAbilityId || {})) {
    map[id] = {
      count: Math.round(toNum(a?.count, 0)),
      missing: Math.round(toNum(a?.missing, 0)),
      total: Number.isFinite(Number(a?.total)) ? Math.round(Number(a.total)) : null,
    }
  }
  return map
}

const buildCoverageSummary = (coverageMap) => {
  let count = 0
  let missing = 0
  let total = 0
  let hasTotal = false

  for (const c of Object.values(coverageMap || {})) {
    count += toNum(c?.count, 0)
    missing += toNum(c?.missing, 0)
    if (c?.total != null) {
      total += toNum(c.total, 0)
      hasTotal = true
    }
  }

  const denom = hasTotal ? total : count + missing
  const pct = denom ? Math.round((count / denom) * 100) : 0

  return {
    count: Math.round(count),
    missing: Math.round(missing),
    total: Math.round(hasTotal ? total : count + missing),
    pct,
  }
}

function buildPlayersUsedByDomain(byAbilityId) {
  const map = {}

  for (const a of abilitiesList) {
    const domain = a.domain
    if (!domain) continue

    const count = Number(byAbilityId[a.id]?.count || 0)
    map[domain] = Math.max(map[domain] || 0, count)
  }

  return map
}

// --- API ---
export function resolveTeamAbilitiesDomain({ entity, scope = 'global', key = null }) {
  const node = pickSliceNode(pickAbilitiesTeam(entity), scope, key)
  const byAbilityId = pickByAbilityId(node)
  const playersUsedByDomain = buildPlayersUsedByDomain(byAbilityId)

  const abilities = buildAbilitiesMapFromAvg(byAbilityId)
  const coverageMap = buildCoverageMap(byAbilityId)
  const coverageSummary = buildCoverageSummary(coverageMap)

  const model = resolveAbilitiesDomain({ abilities })

  model.domains = model.domains.map((d) => ({
    ...d,
    playersUsed: playersUsedByDomain[d.domain] || 0,
  }))

  model.summary.playersUsed = Math.max(
    ...model.domains.map((d) => d.playersUsed || 0),
    0
  )

  return { ...model, coverageMap, coverageSummary, meta: { scope, key } }
}
