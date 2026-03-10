// previewDomainCard/domains/team/videos/components/newForm/newFormDrawer.utils.js

const safe = (v) => (v == null ? '' : String(v).trim())

export function buildInitialDraft(context = {}) {
  const teamId = safe(context?.teamId || context?.team?.id)
  const clubId = safe(context?.clubId || context?.team?.clubId)

  return {
    name: '',
    link: '',
    contextType: teamId ? 'entity' : '',
    objectType: teamId ? 'team' : '',
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    meetingId: '',
    teamId: teamId || '',
    playerId: '',
    clubId: clubId || '',
    __locks: teamId
      ? {
          lockContextType: true,
          lockObjectType: true,
          lockTeamId: true,
          expected: {
            contextType: 'entity',
            objectType: 'team',
            teamId,
          },
        }
      : {},
  }
}

export function getIsDirty(draft, initial) {
  return JSON.stringify(draft) !== JSON.stringify(initial)
}
