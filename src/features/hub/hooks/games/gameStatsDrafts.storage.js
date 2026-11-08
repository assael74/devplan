// src/features/hub/hooks/games/gameStatsDrafts.storage.js

export function getGameStatsDraftsKey(userId, profileKey) {
  return userId && profileKey ? `devplan:gameStatsDrafts:${userId}:${profileKey}` : ''
}

export function readGameStatsDrafts(key) {
  if (!key || typeof window === 'undefined') return {}

  try {
    const stored = JSON.parse(window.localStorage.getItem(key) || 'null')
    if (stored?.version !== 1 || !stored.items || typeof stored.items !== 'object') return {}

    return Object.fromEntries(Object.entries(stored.items).filter(([gameId, item]) => {
      return item?.payload?.status === 'draft' &&
        item.payload.gameId === gameId && item.draft?.gameId === gameId
    }))
  } catch {
    return {}
  }
}

export function writeGameStatsDrafts(key, items) {
  if (!key || typeof window === 'undefined') {
    throw new Error('לא ניתן לשמור טיוטה ללא משתמש ופרופיל פעילים')
  }

  if (Object.keys(items).length) {
    window.localStorage.setItem(key, JSON.stringify({ version: 1, items }))
  } else {
    window.localStorage.removeItem(key)
  }
}
