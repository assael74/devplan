// teamProfile/modules/abilities/logic/abilities.drilldown.logic.js

import {
  resolvePlayerAbilitiesMap,
  resolvePlayerFullName,
} from '../../../../../../shared/abilities/abilities.resolvers.js'

const safeNum = (v) => {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

function getPlayerPosText(player) {
  const arr = Array.isArray(player?.positions) ? player.positions : []
  const uniq = Array.from(new Set(arr.filter(Boolean)))
  return uniq.length ? uniq.join(', ') : '—'
}

function hasPos(player, posCode) {
  if (!posCode || posCode === 'all') return true
  const arr = Array.isArray(player?.positions) ? player.positions : []
  return arr.includes(posCode)
}

export function buildAbilityPlayersRows(players, abilityId, { posCode = 'all', minVal = 0 } = {}) {
  const list = Array.isArray(players) ? players : []

  return list
    .filter((player) => hasPos(player, posCode))
    .map((player) => {
      const abilities = resolvePlayerAbilitiesMap(player)
      const value = safeNum(abilities?.[abilityId])

      return {
        id: player?.id,
        name: resolvePlayerFullName(player),
        pos: getPlayerPosText(player),
        photoUrl: player?.photo || null,
        value,
        raw: player,
      }
    })
    .filter((row) => row.value > Math.max(0, safeNum(minVal)))
    .sort((a, b) => b.value - a.value)
}

export function buildDomainPlayersRows(
  players,
  domainAbilityIds,
  { posCode = 'all', minFilled = 1 } = {}
) {
  const ids = Array.isArray(domainAbilityIds) ? domainAbilityIds.filter(Boolean) : []
  const list = Array.isArray(players) ? players : []

  return list
    .filter((player) => hasPos(player, posCode))
    .map((player) => {
      const abilities = resolvePlayerAbilitiesMap(player)
      const values = ids.map((id) => safeNum(abilities?.[id]))
      const filled = values.filter((value) => value > 0)
      const avg = filled.length
        ? filled.reduce((sum, value) => sum + value, 0) / filled.length
        : 0

      const row = {
        id: player?.id,
        name: resolvePlayerFullName(player),
        pos: getPlayerPosText(player),
        photoUrl: player?.photo || null,
        avg: Number(avg.toFixed(1)),
        filledCount: filled.length,
        raw: player,
      }

      ids.forEach((id, idx) => {
        row[`a${idx + 1}`] = safeNum(abilities?.[id])
        row[`ability:${id}`] = safeNum(abilities?.[id])
      })

      return row
    })
    .filter((row) => row.filledCount >= Math.max(1, Number(minFilled) || 1))
    .sort((a, b) => b.avg - a.avg)
}
