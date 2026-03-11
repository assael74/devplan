// src/ui/fields/selectUi/videos/logic/videoSelect.logic.js

const clean = (v) => String(v ?? '').trim()

export function normalizeVideo(v, fallbackImage) {
  return {
    value: clean(v?.id),
    label: clean(v?.title || v?.name || v?.videoName) || 'וידאו',
    avatar: v?.thumbnail || v?.image || v?.poster || fallbackImage,
    playerId: clean(v?.playerId || v?.player?.id),
    teamId: clean(v?.teamId || v?.team?.id),
    playerName: clean(
      v?.player?.name ||
      `${v?.player?.playerFirstName || ''} ${v?.player?.playerLastName || ''}`.trim()
    ),
    dateLabel: clean(v?.dateLabel || v?.videoDate || v?.createdAtLabel),
    raw: v,
  }
}

export function buildOptions(options = [], filters = {}) {
  const pid = clean(filters?.playerId)
  const tid = clean(filters?.teamId)
  const fallbackImage = filters?.fallbackImage

  const arr = options
    .map((v) => normalizeVideo(v, fallbackImage))
    .filter((x) => x.value)

  const filtered = arr.filter((x) => {
    if (pid && x.playerId !== pid) return false
    if (tid && x.teamId !== tid) return false
    return true
  })

  return filtered.sort((a, b) => (a.label || '').localeCompare(b.label || '', 'he'))
}

export function findSelected(value, normalizedOptions) {
  const id = clean(value)
  if (!id) return null
  return normalizedOptions.find((o) => o.value === id) || null
}

export function formatAff(playerName, dateLabel) {
  const parts = [clean(playerName), clean(dateLabel)].filter(Boolean)
  return parts.join(' • ')
}
