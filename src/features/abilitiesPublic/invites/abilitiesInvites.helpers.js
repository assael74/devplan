// features/abilitiesPublic/invites/abilitiesInvites.helpers.js

export function cleanToken(token) {
  return String(token || '').trim()
}

export function isInviteExpired(invite) {
  const expiresAt = invite?.expiresAt
  if (!expiresAt) return false

  const time = new Date(expiresAt).getTime()
  if (!Number.isFinite(time)) return false

  return Date.now() > time
}

export function isInviteSubmitted(invite) {
  return invite?.status === 'submitted'
}

export function isInviteCancelled(invite) {
  return invite?.status === 'cancelled'
}

export function isInviteInvalid(invite) {
  if (!invite) return true
  if (!cleanToken(invite?.token)) return true
  if (!invite?.player?.id) return true
  if (!invite?.player?.fullName) return true
  return false
}

export function resolveInviteViewState(invite) {
  if (!invite) return 'invalid'
  if (isInviteCancelled(invite)) return 'cancelled'
  if (isInviteExpired(invite)) return 'expired'
  if (isInviteSubmitted(invite)) return 'submitted'
  if (isInviteInvalid(invite)) return 'invalid'
  return 'ready'
}
