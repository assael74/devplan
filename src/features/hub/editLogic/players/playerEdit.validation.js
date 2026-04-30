// features/hub/editLogic/players/playerEdit.validation.js

const safe = (value) => (value == null ? '' : String(value))
const clean = (value) => safe(value).trim()

export function getPlayerEditFieldErrors(draft = {}) {
  const firstName = clean(draft?.playerFirstName)
  const lastName = clean(draft?.playerLastName)
  const shortName = clean(draft?.playerShortName)

  const hasName = Boolean(firstName || lastName || shortName)

  return {
    name: !hasName,
  }
}

export function getIsPlayerEditValid(draft = {}) {
  return !Object.values(getPlayerEditFieldErrors(draft)).some(Boolean)
}
