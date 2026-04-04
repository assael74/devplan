// previewDomainCard/domains/team/players/components/newForm/newFormDrawer.utils.js

const safe = (v) => (v == null ? '' : String(v).trim())

export function buildInitialDraft(context = {}) {
  const entity = context?.team || null
  const teamId = safe(context?.teamId || entity?.id || context?.team?.id)
  const clubId = safe(context?.team?.clubId || context?.team?.club?.id)

  return {
    playerFirstName: '',
    playerLastName: '',
    teamId,
    clubId,
    birth: ''
  }
}

export function getIsDirty(draft, initial) {
  return JSON.stringify(draft) !== JSON.stringify(initial)
}
