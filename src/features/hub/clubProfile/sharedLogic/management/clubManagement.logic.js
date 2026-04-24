/// features/hub/clubProfile/sharedLogic/menagement/clubManagement.logic.js

export function buildClubManagementModel(club) {
  const c = club || {}

  return {
    clubName: String(c.clubName || ''),
    ifaLink: String(c.ifaLink || ''),
    active: Boolean(c.active),
  }
}

export function buildClubManagementPatch(prevModel, nextModel) {
  const p = prevModel || {}
  const n = nextModel || {}
  const patch = {}

  if (p.clubName !== n.clubName) patch.clubName = n.clubName
  if (p.ifaLink !== n.ifaLink) patch.ifaLink = n.ifaLink
  if (p.active !== n.active) patch.active = n.active

  return patch
}
