// features/playersDatabase/model/teamIdentity.model.js

import {
  cleanValue,
  pickFirstValue,
  toPositiveNumberOrFallback,
} from './value.model.js'

export const normalizeTeamIdentity = ({
  team = {},
  fallback = {},
} = {}) => {
  const teamId = cleanValue(pickFirstValue(
    team.teamId,
    fallback.teamId
  ))
  const teamDocumentId = cleanValue(pickFirstValue(
    team.teamDocumentId,
    fallback.teamDocumentId,
    teamId
  ))
  const birthTeamId = cleanValue(pickFirstValue(
    team.birthTeamId,
    team.teamId,
    fallback.birthTeamId,
    fallback.teamId
  ))
  const birthTeamDocumentId = cleanValue(pickFirstValue(
    team.birthTeamDocumentId,
    team.teamDocumentId,
    fallback.birthTeamDocumentId,
    fallback.teamDocumentId,
    birthTeamId
  ))
  const teamSlot = toPositiveNumberOrFallback(
    pickFirstValue(team.teamSlot, fallback.teamSlot),
    1
  )
  const birthTeamSlot = toPositiveNumberOrFallback(
    pickFirstValue(
      team.birthTeamSlot,
      team.teamSlot,
      fallback.birthTeamSlot,
      fallback.teamSlot
    ),
    1
  )

  return {
    clubId: cleanValue(pickFirstValue(team.clubId, fallback.clubId)),
    teamId,
    teamDocumentId,
    birthTeamId,
    birthTeamDocumentId,
    teamSlot,
    birthTeamSlot,
    teamSlotId: cleanValue(pickFirstValue(
      team.teamSlotId,
      fallback.teamSlotId
    )),
  }
}

export const resolveTeamDocumentId = team =>
  normalizeTeamIdentity({ team }).teamDocumentId

export const resolveBirthTeamId = team =>
  normalizeTeamIdentity({ team }).birthTeamId

export const resolveBirthTeamDocumentId = team =>
  normalizeTeamIdentity({ team }).birthTeamDocumentId

export const resolveBirthTeamSlot = team =>
  normalizeTeamIdentity({ team }).birthTeamSlot

export const resolveTeamLookupKey = team => {
  const identity = normalizeTeamIdentity({ team })

  return (
    identity.birthTeamDocumentId ||
    identity.teamDocumentId ||
    identity.birthTeamId ||
    identity.teamId ||
    identity.teamSlotId
  )
}
