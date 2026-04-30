// features/hub/editLogic/videoAnalysis/videoAnalysisEdit.model.js

export const safe = (value) => (value == null ? '' : String(value))

export const clean = (value) => safe(value).trim()

const asArr = (value) => (Array.isArray(value) ? value.filter(Boolean) : [])

const sameArr = (a, b) => {
  const next = asArr(a)
  const prev = asArr(b)

  if (next.length !== prev.length) return false

  for (let index = 0; index < next.length; index += 1) {
    if (next[index] !== prev[index]) return false
  }

  return true
}

const buildPlayerDisplayName = (player = {}) => {
  return (
    clean(player?.playerFullName) ||
    [player?.playerFirstName, player?.playerLastName]
      .map(clean)
      .filter(Boolean)
      .join(' ')
  )
}

const buildTeamDisplayName = (team = {}) => {
  return clean(team?.teamName || team?.name)
}

const buildDateLabel = (video = {}) => {
  const month = clean(video?.month)
  const year = clean(video?.year)

  if (month && year) return `${month}/${year}`
  return year || ''
}

export const buildVideoAnalysisMeta = (video = {}, context = {}) => {
  const objectType = clean(
    context?.objectType ||
      context?.targetType ||
      video?.objectType ||
      video?.targetType
  )

  const playerName =
    buildPlayerDisplayName(video?.player) ||
    buildPlayerDisplayName(context?.player)

  const teamName =
    buildTeamDisplayName(video?.team) ||
    buildTeamDisplayName(context?.team)

  const objectName =
    objectType === 'player'
      ? playerName
      : objectType === 'team'
      ? teamName
      : playerName || teamName

  const videoName = clean(video?.name)
  const dateLabel = buildDateLabel(video)

  return [objectName, videoName || dateLabel].filter(Boolean).join(' | ') || 'פרטי וידאו'
}

const getSource = (video = {}) => {
  if (!video || typeof video !== 'object') return {}

  return {
    ...video?.raw,
    ...video?.video,
    ...video,
  }
}

export function buildVideoAnalysisEditInitial(video = {}, context = {}) {
  const source = getSource(video)

  return {
    id: clean(source?.id || source?.videoId),
    raw: source,

    entityType: 'videoAnalysis',
    objectType: clean(context?.objectType || source?.objectType || source?.targetType),

    name: clean(source?.name),
    notes: clean(source?.notes),
    link: clean(source?.link || source?.vLink || ''),

    month: source?.month ?? '',
    year: source?.year ?? '',

    tagIds: asArr(source?.tagIds),

    metaLabel: buildVideoAnalysisMeta(source, context),
  }
}

export function buildVideoAnalysisEditPatch(draft = {}, initial = {}) {
  const next = {}

  if (draft.name !== initial.name) next.name = clean(draft.name)
  if (draft.notes !== initial.notes) next.notes = clean(draft.notes)
  if (draft.link !== initial.link) next.link = clean(draft.link)

  if (draft.month !== initial.month) {
    next.month = draft.month === '' ? '' : Number(draft.month)
  }

  if (draft.year !== initial.year) {
    next.year = draft.year === '' ? '' : Number(draft.year)
  }

  if (!sameArr(draft.tagIds, initial.tagIds)) {
    next.tagIds = asArr(draft.tagIds)
  }

  return next
}

export function isVideoAnalysisEditDirty(draft = {}, initial = {}) {
  return (
    draft.name !== initial.name ||
    draft.notes !== initial.notes ||
    draft.link !== initial.link ||
    draft.month !== initial.month ||
    draft.year !== initial.year ||
    !sameArr(draft.tagIds, initial.tagIds)
  )
}
