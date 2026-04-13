// previewDomainCard/domains/club/teams/components/newForm/newFormDrawer.utils.js

const safe = (v) => (v == null ? '' : String(v).trim())

export function buildInitialDraft(context = {}) {
  const clubId = safe(context?.club?.clubId || context?.club?.id)

  return {
    teamName: '',
    clubId,
    teamYear: '',
    ifaLink: '',
    project: false,
  }
}

export function getValidity(draft = {}, context = {}) {
  const teamName = safe(draft?.teamName)
  const clubId = safe(draft?.clubId)
  const teamYear = safe(draft?.teamYear)

  const clubs = Array.isArray(context?.clubs) ? context.clubs : []
  const hasClubOptions = clubs.length > 0

  return {
    okTeamName: teamName.length > 0,
    okClub: hasClubOptions ? clubs.some((club) => safe(club?.id || club?.clubId) === clubId) : clubId.length > 0,
    okTeamYear: teamYear.length > 0,
  }
}

export function getIsValid(validity = {}) {
  return Boolean(validity?.okTeamName && validity?.okClub && validity?.okTeamYear)
}

export function getIsDirty(draft = {}, initial = {}) {
  return JSON.stringify(draft) !== JSON.stringify(initial)
}
