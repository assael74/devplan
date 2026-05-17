// features/hub/editLogic/players/playerEdit.model.js

export const safe = (value) => (value == null ? '' : String(value))
export const clean = (value) => safe(value).trim()

export const safeArr = (value) => {
  return Array.isArray(value) ? value.filter(Boolean) : []
}

export const sameArr = (a, b) => {
  const x = safeArr(a)
  const y = safeArr(b)

  if (x.length !== y.length) return false

  for (let index = 0; index < x.length; index += 1) {
    if (x[index] !== y[index]) return false
  }

  return true
}

const getBool = (value, fallback = false) => {
  if (value == null) return fallback
  return value === true
}

const getSource = (player = {}) => {
  if (!player || typeof player !== 'object') return {}

  return {
    ...player?.raw,
    ...player?.player,
    ...player,
  }
}

const getId = (source = {}) => {
  return clean(source?.id || source?.playerId)
}

const padMonth = (value) => {
  const str = clean(value)
  if (!str) return ''
  return str.padStart(2, '0')
}

const resolvePrimaryPosition = ({ positions = [], primaryPosition = '' }) => {
  const safePositions = safeArr(positions)
  const primary = clean(primaryPosition)

  if (!safePositions.length) return ''

  if (primary && safePositions.includes(primary)) {
    return primary
  }

  return ''
}

const parseBirthValue = (birth) => {
  const raw = clean(birth)
  if (!raw) return { month: '', year: '' }

  const [monthRaw = '', yearRaw = ''] = raw.split('-')

  return {
    month: padMonth(monthRaw),
    year: clean(yearRaw),
  }
}

const buildBirthValue = (month, year) => {
  const safeMonth = padMonth(month)
  const safeYear = clean(year)

  if (!safeMonth || !safeYear) return ''
  return `${safeMonth}-${safeYear}`
}

export const buildPlayerName = (player = {}) => {
  return (
    [player?.playerFirstName, player?.playerLastName]
      .filter(Boolean)
      .join(' ')
      .trim() ||
    player?.playerFullName ||
    player?.fullName ||
    player?.name ||
    player?.playerShortName ||
    'שחקן'
  )
}

export const buildPlayerMeta = (player = {}) => {
  return (
    player?.teamName ||
    player?.team?.teamName ||
    player?.team?.name ||
    player?.clubName ||
    player?.club?.clubName ||
    player?.club?.name ||
    'שחקן'
  )
}

function addIfChanged(next, draft, initial, key) {
  if (draft[key] !== initial[key]) {
    next[key] = clean(draft[key])
  }
}

function addNullableIfChanged(next, draft, initial, key) {
  if (draft[key] !== initial[key]) {
    const value = clean(draft[key])
    next[key] = value || null
  }
}

function addBoolIfChanged(next, draft, initial, key) {
  if (draft[key] !== initial[key]) {
    next[key] = draft[key] === true
  }
}

function addArrayIfChanged(next, draft, initial, key) {
  if (!sameArr(draft[key], initial[key])) {
    next[key] = safeArr(draft[key])
  }
}

export function buildPlayerEditInitial(player = {}) {
  const source = getSource(player)
  const id = getId(source)
  const birthParts = parseBirthValue(source?.birth)
  const positions = safeArr(source?.positions)
  const primaryPosition = resolvePrimaryPosition({
    positions,
    primaryPosition: source?.primaryPosition,
  })

  return {
    id,
    playerId: id,
    raw: source,

    clubId: clean(source?.clubId),
    teamId: clean(source?.teamId),

    heightCm: clean(source?.heightCm ?? source?.height ?? source?.physical?.heightCm),
    weightKg: clean(source?.weightKg ?? source?.weight ?? source?.physical?.weightKg),

    name: buildPlayerName(source),
    photo: source?.photo || '',
    teamName: buildPlayerMeta(source),

    playerFirstName: clean(source?.playerFirstName),
    playerLastName: clean(source?.playerLastName),
    playerShortName: clean(source?.playerShortName),

    birth: clean(source?.birth),
    month: birthParts.month,
    year: birthParts.year,
    birthDay: clean(source?.birthDay),
    phone: clean(source?.phone),
    ifaLink: clean(source?.ifaLink),

    positions,
    primaryPosition,

    active: getBool(source?.active, false),
    squadRole: clean(source?.squadRole),
    type: clean(source?.type || 'noneType'),
    projectStatus: clean(source?.projectStatus),
  }
}

export function isPlayerEditDirty(draft = {}, initial = {}) {
  const draftPositions = safeArr(draft?.positions)
  const initialPositions = safeArr(initial?.positions)

  const draftPrimaryPosition = resolvePrimaryPosition({
    positions: draftPositions,
    primaryPosition: draft?.primaryPosition,
  })

  const initialPrimaryPosition = resolvePrimaryPosition({
    positions: initialPositions,
    primaryPosition: initial?.primaryPosition,
  })

  return (
    draft.month !== initial.month ||
    draft.year !== initial.year ||
    draft.clubId !== initial.clubId ||
    draft.teamId !== initial.teamId ||
    draft.heightCm !== initial.heightCm ||
    draft.weightKg !== initial.weightKg ||
    draft.playerFirstName !== initial.playerFirstName ||
    draft.playerLastName !== initial.playerLastName ||
    draft.playerShortName !== initial.playerShortName ||
    draft.birth !== initial.birth ||
    draft.birthDay !== initial.birthDay ||
    draft.phone !== initial.phone ||
    draft.ifaLink !== initial.ifaLink ||
    draftPrimaryPosition !== initialPrimaryPosition ||
    !sameArr(draftPositions, initialPositions) ||
    draft.active !== initial.active ||
    draft.squadRole !== initial.squadRole ||
    draft.type !== initial.type ||
    draft.projectStatus !== initial.projectStatus
  )
}

export function buildPlayerEditPatch(draft = {}, initial = {}) {
  const next = {}
  const draftBirth = buildBirthValue(draft?.month, draft?.year)
  const initialBirth = buildBirthValue(initial?.month, initial?.year)
  const draftPositions = safeArr(draft?.positions)
  const initialPositions = safeArr(initial?.positions)

  const draftPrimaryPosition = resolvePrimaryPosition({
    positions: draftPositions,
    primaryPosition: draft?.primaryPosition,
  })

  const initialPrimaryPosition = resolvePrimaryPosition({
    positions: initialPositions,
    primaryPosition: initial?.primaryPosition,
  })

  if (!sameArr(draftPositions, initialPositions)) {
    next.positions = draftPositions
  }

  if (draftPrimaryPosition !== initialPrimaryPosition) {
    next.primaryPosition = draftPrimaryPosition || null
  }

  if (draftBirth !== initialBirth) {
    next.birth = draftBirth || null
  }

  addNullableIfChanged(next, draft, initial, 'playerFirstName')
  addNullableIfChanged(next, draft, initial, 'playerLastName')
  addNullableIfChanged(next, draft, initial, 'playerShortName')

  addNullableIfChanged(next, draft, initial, 'clubId')
  addNullableIfChanged(next, draft, initial, 'teamId')
  addNullableIfChanged(next, draft, initial, 'heightCm')
  addNullableIfChanged(next, draft, initial, 'weightKg')

  addNullableIfChanged(next, draft, initial, 'birth')
  addNullableIfChanged(next, draft, initial, 'birthDay')
  addNullableIfChanged(next, draft, initial, 'phone')

  addIfChanged(next, draft, initial, 'ifaLink')

  addBoolIfChanged(next, draft, initial, 'active')

  addIfChanged(next, draft, initial, 'squadRole')

  if (draft?.type !== initial?.type) {
    next.type = clean(draft?.type || 'noneType')
  }

  addIfChanged(next, draft, initial, 'projectStatus')

  return next
}
