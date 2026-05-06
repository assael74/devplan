// shared/games/insights/player/common/playerPosition.js

import { getPlayerGeneralPosition } from '../../../../players/player.positions.utils.js'
import { POSITION_LAYERS } from '../../../../players/players.constants.js'

const POSITION_FALLBACK = {
  layerKey: '',
  layerLabel: 'לא עודכן',
  positionCodes: [],
  positions: [],
  isDefined: false,
}

function buildPositionItems(codes = []) {
  const items = []

  for (const code of codes || []) {
    for (const [layerKey, list] of Object.entries(POSITION_LAYERS)) {
      const found = list.find((item) => item.code === code)

      if (found) {
        items.push({
          ...found,
          layerKey,
        })
      }
    }
  }

  return items
}

function resolvePositionCodes(player = {}) {
  if (Array.isArray(player?.positions)) return player.positions
  if (Array.isArray(player?.position)) return player.position

  if (player?.position) return [player.position]

  return []
}

export function resolvePlayerPosition(player = {}) {
  const positionCodes = resolvePositionCodes(player)
  const general = getPlayerGeneralPosition(positionCodes)
  const positions = buildPositionItems(positionCodes)

  if (!general?.layerKey) {
    return POSITION_FALLBACK
  }

  return {
    layerKey: general.layerKey,
    layerLabel: general.layerLabel,
    positionCodes,
    positions,
    isDefined: true,

    isAttack: general.layerKey === 'attack',
    isAttackingMidfield: general.layerKey === 'atMidfield',
    isMidfield: general.layerKey === 'midfield',
    isDefensiveMidfield: general.layerKey === 'dmMid',
    isDefense: general.layerKey === 'defense',
    isGoalkeeper: general.layerKey === 'goalkeeper',
  }
}
