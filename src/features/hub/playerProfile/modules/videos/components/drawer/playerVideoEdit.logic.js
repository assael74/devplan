// playerProfile/modules/videos/components/drawer/playerVideoEdit.logic.js

export const safe = (value) => (value == null ? '' : String(value))

const clean = (value) => safe(value).trim()

const asArr = (value) => (Array.isArray(value) ? value : [])

const buildPlayerDisplayName = (player) => {
  return [player?.playerFirstName, player?.playerLastName]
    .map((value) => clean(value))
    .filter(Boolean)
    .join(' ')
}

export const buildVideoMeta = (video) => {
  const playerName =
    clean(video?.player?.playerFullName) ||
    buildPlayerDisplayName(video?.player)

  const month = clean(video?.month)
  const year = clean(video?.year)
  const dateLabel =
    month && year
      ? `${month}/${year}`
      : year || ''

  const videoName = clean(video?.name)

  return [playerName, videoName || dateLabel].filter(Boolean).join(' | ') || 'פרטי וידאו'
}

export function buildInitialDraft(video) {
  const source = video || {}

  return {
    id: source?.id || '',
    name: clean(source?.name),
    notes: clean(source?.notes),
    link: clean(source?.link || ''),
    month: source?.month ?? '',
    year: source?.year ?? '',
    tagIds: asArr(source?.tagIds).filter(Boolean),
    raw: source,
    metaLabel: buildVideoMeta(source),
  }
}

export function buildPatch(draft, initial) {
  const next = {}

  if (draft.name !== initial.name) next.name = draft.name || ''
  if (draft.notes !== initial.notes) next.notes = draft.notes || ''
  if (draft.link !== initial.link) next.link = draft.link || ''
  if (draft.month !== initial.month) next.month = draft.month === '' ? '' : Number(draft.month)
  if (draft.year !== initial.year) next.year = draft.year === '' ? '' : Number(draft.year)

  const nextTags = Array.isArray(draft.tagIds) ? draft.tagIds : []
  const prevTags = Array.isArray(initial.tagIds) ? initial.tagIds : []

  if (JSON.stringify(nextTags) !== JSON.stringify(prevTags)) {
    next.tagIds = nextTags
  }

  return next
}

export function getIsDirty(draft, initial) {
  return (
    draft.name !== initial.name ||
    draft.notes !== initial.notes ||
    draft.link !== initial.link ||
    draft.month !== initial.month ||
    draft.year !== initial.year ||
    JSON.stringify(draft.tagIds || []) !== JSON.stringify(initial.tagIds || [])
  )
}
