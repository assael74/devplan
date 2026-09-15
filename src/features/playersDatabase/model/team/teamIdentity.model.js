// features/playersDatabase/model/team/teamIdentity.model.js

import {
  cleanValue,
  pickFirstValue,
  toPositiveNumberOrFallback,
} from '../shared/value.model.js'
import {
  buildSeasonKey,
  normalizeSeasonLookupKey,
} from '../shared/season.model.js'

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

export const resolveTeamBirthYear = ({ teamId = '', team = {} } = {}) => {
  const directBirthYear = Number(
    team?.birthYear ||
    team?.identity?.birthYear ||
    team?.metadata?.birthYear ||
    0
  )
  if (directBirthYear >= 1900) return directBirthYear

  const match = cleanValue(teamId).match(/(?:^|_)((?:19|20)\d{2})(?:_|$)/)
  return match ? Number(match[1]) : null
}

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


export const buildTeamSeasonDocumentId = (birthTeamDocumentId, seasonKey) => {
  const safeBirthTeamDocumentId = cleanValue(birthTeamDocumentId)
  const normalizedSeasonKey = normalizeSeasonLookupKey(seasonKey)
  const safeSeasonKey = buildSeasonKey(normalizedSeasonKey)

  if (!safeBirthTeamDocumentId || !safeSeasonKey) return ''

  return `${safeBirthTeamDocumentId}__${safeSeasonKey}`
}
