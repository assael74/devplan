import { clean } from './abilitiesPublic.helpers.js'

export function buildPublicAbilitiesSubmitPayload(draft = {}) {
  const rawAbilities = draft?.abilities || {}
  const abilities = {}

  for (const [key, value] of Object.entries(rawAbilities)) {
    if (value == null || value === '') continue
    abilities[key] = Number(value)
  }

  return {
    token: clean(draft?.token),
    inviteId: clean(draft?.inviteId),

    playerId: clean(draft?.playerId),
    playerName: clean(draft?.playerName),

    teamId: clean(draft?.teamId),
    teamName: clean(draft?.teamName),

    clubId: clean(draft?.clubId),
    clubName: clean(draft?.clubName),

    evaluatorId: clean(draft?.evaluatorId),
    evaluatorName: clean(draft?.evaluatorName),
    evaluatorType: clean(draft?.evaluatorType),

    evalDate: clean(draft?.evalDate),
    roleId: clean(draft?.roleId),

    abilities,
    domainScores: { ...(draft?.domainScores || {}) },

    source: 'public_invite',
  }
}
