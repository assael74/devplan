// src/services/firestore/shorts/gameStats/shared/gameStats.list.js

export function safeArr(value) {
  if (Array.isArray(value)) return value

  return []
}

export function findListItem(list = [], id) {
  return safeArr(list).find(item => item && item.id === id) || null
}

export function upsertListItem(list = [], id, nextItem) {
  const rows = safeArr(list)
  const idx = rows.findIndex(item => item && item.id === id)

  if (idx < 0) return [...rows, nextItem]

  return rows.map((item, index) => {
    if (index === idx) return nextItem

    return item
  })
}

export function updateExistingListItem(list = [], id, nextItem) {
  const rows = safeArr(list)
  const idx = rows.findIndex(item => item && item.id === id)

  if (idx < 0) return rows

  return rows.map((item, index) => {
    if (index === idx) return nextItem

    return item
  })
}

export function getRowPlayerId(row) {
  if (!row) return ''

  return String(row.playerId || row.id || '').trim()
}
