// previewDomainCard/domains/Player/videos/components/newForm/newFormDrawer.utils.js

const safe = (v) => (v == null ? '' : String(v).trim())

export function buildInitialDraft(context = {}) {
  const playerId = safe(context?.playerId || context?.player?.id)
  const teamId = safe(context?.teamId || context?.team?.id)
  const clubId = safe(context?.clubId || context?.team?.clubId)

  return {
    name: '',
    link: '',
    contextType: playerId ? 'entity' : '',
    objectType: playerId ? 'playerId' : '',
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    meetingId: '',
    teamId: teamId || '',
    playerId: playerId || '',
    clubId: clubId || '',
    __locks: playerId
      ? {
          lockContextType: true,
          lockObjectType: true,
          lockTeamId: true,
          expected: {
            contextType: 'entity',
            objectType: 'player',
            playerId,
          },
        }
      : {},
  }
}

export function getIsDirty(draft, initial) {
  return JSON.stringify(draft) !== JSON.stringify(initial)
}
