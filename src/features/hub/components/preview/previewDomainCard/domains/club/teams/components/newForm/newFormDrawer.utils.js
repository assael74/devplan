// previewDomainCard/domains/club/teams/components/newForm/newFormDrawer.utils.js

const safe = (v) => (v == null ? '' : String(v).trim())

export function buildInitialDraft(context = {}) {
  const entity = context?.team || null
  const clubId = safe(context?.club?.clubId || context?.club?.id)

  return {
    teamName: '',
    clubId,
    teamYear: '',
    ifaLink: ''
  }
}

export function getIsDirty(draft, initial) {
  return JSON.stringify(draft) !== JSON.stringify(initial)
}
