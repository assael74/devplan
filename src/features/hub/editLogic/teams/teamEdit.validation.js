// features/hub/editLogic/teams/teamEdit.validation.js

const safe = (value) => (value == null ? '' : String(value))
const clean = (value) => safe(value).trim()

export function getTeamEditFieldErrors(draft = {}) {
  const teamName = clean(draft?.teamName)
  const teamYear = clean(draft?.teamYear)

  return {
    teamName: !teamName,
    teamYear: !teamYear,
  }
}

export function getIsTeamEditValid(draft = {}) {
  return !Object.values(getTeamEditFieldErrors(draft)).some(Boolean)
}
