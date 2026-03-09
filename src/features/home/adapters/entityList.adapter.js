import { safeArr } from './_utils/array.utils'
import { toIso, formatUpdatedLabel } from './_utils/date.utils'

function sortByUpdatedDesc(arr) {
  return safeArr(arr)
    .slice()
    .sort((a, b) => {
      const aIso = toIso(a?.updatedAt || a?.lastUpdated || a?.modifiedAt || a?.createdAt)
      const bIso = toIso(b?.updatedAt || b?.lastUpdated || b?.modifiedAt || b?.createdAt)
      return (bIso || '').localeCompare(aIso || '')
    })
}

function mapRow(x) {
  const title = x?.name || x?.title || x?.displayName || x?.label || 'ללא שם'
  const updatedAt = x?.updatedAt || x?.lastUpdated || x?.modifiedAt || x?.createdAt
  return {
    id: x?.id || x?._id || x?.uid || `${title}-${Math.random()}`,
    title,
    subtitle: formatUpdatedLabel(updatedAt),
    rightMeta: x?.tag || x?.statusLabel || '',
  }
}

export function buildEntityItems(entityKey, data = {}, limit = 5) {
  const { players, videos, teams, notes } = data

  if (entityKey === 'players') return sortByUpdatedDesc(players).slice(0, limit).map(mapRow)
  if (entityKey === 'videos') return sortByUpdatedDesc(videos).slice(0, limit).map(mapRow)
  if (entityKey === 'teams') return sortByUpdatedDesc(teams).slice(0, limit).map(mapRow)
  if (entityKey === 'notes') return sortByUpdatedDesc(notes).slice(0, limit).map(mapRow)
  return []
}
