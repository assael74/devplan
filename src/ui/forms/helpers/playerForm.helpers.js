// ui/forms/helpers/playerForm.helpers.js

const toText = (v) => String(v ?? '').trim()

function toTextBirth(value) {
  return String(value ?? '').trim()
}

function padMonth(value) {
  const raw = toTextBirth(value)
  if (!raw) return ''
  return raw.padStart(2, '0')
}

export function resolveBirthValue(draft = {}) {
  const birth = toTextBirth(draft?.birth)
  if (birth) return birth

  const month = padMonth(draft?.month)
  const year = toTextBirth(draft?.year)

  if (!month || !year) return ''

  return `${month}-${year}`
}

export const buildPlayerInfoItem = ({ id, draft, now }) => ({
  id,
  active: true,
  createdAt: now,
  updatedAt: now,
  type: 'noneType',
  birth: resolveBirthValue(draft),
})

export const buildPlayerNamesItem = ({ id, draft }) => ({
  id,
  playerFirstName: toText(draft?.playerFirstName),
  playerLastName: toText(draft?.playerLastName),
})

export const buildPlayerTeamItem = ({ id, draft }) => ({
  id,
  clubId: toText(draft?.clubId),
  teamId: toText(draft?.teamId),
})
