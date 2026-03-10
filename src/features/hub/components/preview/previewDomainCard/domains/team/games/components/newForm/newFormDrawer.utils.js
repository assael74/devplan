// previewDomainCard/domains/team/games/components/newForm/newFormDrawer.utils.js

const safe = (v) => (v == null ? '' : String(v).trim())

export function buildInitialDraft(context = {}) {
  const entity = context?.entity || null
  const teamId = safe(context?.teamId || entity?.id || context?.team?.id)
  const clubId = safe(
    context?.clubId ||
    entity?.clubId ||
    context?.team?.clubId
  )

  return {
    gameDate: '',
    gameHour: '',
    rivel: '',
    teamId,
    clubId,
    home: true,
    difficulty: '',
    type: '',
    gameDuration: '',
    goalsFor: 0,
    goalsAgainst: 0,
    result: ''
  }
}

export function getIsDirty(draft, initial) {
  return JSON.stringify(draft) !== JSON.stringify(initial)
}
