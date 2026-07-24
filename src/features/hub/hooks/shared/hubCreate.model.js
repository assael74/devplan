// src/features/hub/hooks/shared/hubCreate.model.js

function joinNameParts(parts = []) {
  const value = parts.filter(Boolean).join(' ').trim()
  return value || null
}

export function resolveStaticEntityType(entityType) {
  return () => entityType
}

export function resolveTeamCreateName({ draft = {}, created = {} }) {
  return joinNameParts([
    created.teamName || draft.teamName,
    created.teamYear || draft.teamYear,
  ])
}

export function resolveClubCreateName({ draft = {}, created = {} }) {
  return joinNameParts([created.clubName || draft.clubName])
}

export function resolvePlayerCreateName({ draft = {}, created = {} }) {
  return joinNameParts([
    created.playerFirstName || draft.playerFirstName,
    created.playerLastName || draft.playerLastName,
  ])
}

export function resolvePlayerCreateType({ draft = {}, context = {} }) {
  const isPrivate =
    draft.playerSource === 'private' ||
    draft.isPrivatePlayer === true ||
    context.playerSource === 'private' ||
    context.isPrivatePlayer === true

  return isPrivate ? 'privatePlayer' : 'player'
}

export function resolveGameCreateName({ draft = {}, created = {} }) {
  return joinNameParts([
    created.rival || created.rivel || draft.rival || draft.rivel,
    created.gameDate || draft.gameDate,
  ])
}

export function resolveGameCreateType({ draft = {}, context = {} }) {
  const isExternal =
    draft.gameSource === 'external' ||
    draft.isExternalGame === true ||
    context.gameSource === 'external' ||
    context.isExternalGame === true ||
    context.playerSource === 'private'

  return isExternal ? 'externalGame' : 'game'
}

export function resolveMeetingCreateName({ draft = {}, created = {} }) {
  return joinNameParts([
    created.meetingFor || draft.meetingFor,
    created.meetingDate || draft.meetingDate,
  ])
}

export function resolvePaymentCreateName({ draft = {}, created = {} }) {
  return joinNameParts([
    created.paymentFor || draft.paymentFor,
    created.price || draft.price,
  ])
}

export function resolveVideoAnalysisCreateName({ draft = {}, created = {} }) {
  return joinNameParts([created.name || draft.name])
}
