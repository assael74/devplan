// previewDomainCard/domains/team/players/components/newForm/newFormDrawer.utils.js

const safe = (v) => (v == null ? '' : String(v).trim())

const isValidDateFormat = (value) => {
  const date = safe(value)
  if (!date) return false

  return /^\d{4}-\d{2}-\d{2}$/.test(date) || /^\d{2}\/\d{2}\/\d{4}$/.test(date)
}

export function buildInitialDraft(context = {}) {
  const team = context?.team || null
  const teamId = safe(context?.teamId || team?.id)
  const clubId = safe(context?.clubId || team?.clubId || team?.club?.id)

  return {
    playerFirstName: '',
    playerLastName: '',
    teamId,
    clubId,
    birth: '',
  }
}

export function getValidity(draft = {}) {
  const playerFirstName = safe(draft?.playerFirstName)
  const playerLastName = safe(draft?.playerLastName)
  const teamId = safe(draft?.teamId)
  const clubId = safe(draft?.clubId)
  const birth = safe(draft?.birth)

  return {
    okFirstName: !!playerFirstName,
    okLastName: !!playerLastName,
    okTeamId: !!teamId,
    okClubId: !!clubId,
    okBirth: !birth || isValidDateFormat(birth),
  }
}

export function getIsValid(validity = {}) {
  return Boolean(
    validity?.okFirstName &&
      validity?.okLastName &&
      validity?.okTeamId &&
      validity?.okClubId &&
      validity?.okBirth
  )
}

export function getIsDirty(draft = {}, initial = {}) {
  return JSON.stringify(draft) !== JSON.stringify(initial)
}
