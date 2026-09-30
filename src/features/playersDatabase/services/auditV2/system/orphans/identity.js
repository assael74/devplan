// src/features/playersDatabase/services/auditV2/system/orphans/identity.js

import { cleanValue } from '../../../../model/shared/value.model.js'
import { resolveSeasonLookupKey } from '../../../../model/shared/season.model.js'

const clean = cleanValue
const positiveSlot = value => {
  const slot = Number(value)
  return Number.isFinite(slot) && slot > 0 ? slot : 0
}

export const buildOrphanPlayerSeasonIdentity = ({
  player = {},
  season = {},
  row = {},
} = {}) => ({
  playerId: clean(player.playerId || row.playerId),
  seasonId: resolveSeasonLookupKey({
    seasonId: season.seasonId || row.seasonId,
    seasonKey: season.seasonKey || row.seasonKey,
  }),
  birthTeamId: clean(season.birthTeamId || row.birthTeamId || row.teamId),
  birthTeamSlot: positiveSlot(
    season?.scoutIdentityContext?.birthTeamSlot ||
    row.birthTeamSlot ||
    row.teamSlot
  ),
})

export const buildOrphanPlayerSeasonIdentityKey = identity => {
  if (
    !clean(identity?.playerId) ||
    !clean(identity?.seasonId) ||
    !clean(identity?.birthTeamId) ||
    !positiveSlot(identity?.birthTeamSlot)
  ) return ''

  return [
    clean(identity.playerId),
    clean(identity.seasonId),
    clean(identity.birthTeamId),
    String(positiveSlot(identity.birthTeamSlot)),
  ].join('::')
}
