// features/hub/editLogic/clubs/clubEdit.validation.js

const safe = (value) => (value == null ? '' : String(value))
const clean = (value) => safe(value).trim()

export function getClubEditFieldErrors(draft = {}) {
  const clubName = clean(draft?.clubName)

  return {
    clubName: !clubName,
  }
}

export function getIsClubEditValid(draft = {}) {
  return !Object.values(getClubEditFieldErrors(draft)).some(Boolean)
}
