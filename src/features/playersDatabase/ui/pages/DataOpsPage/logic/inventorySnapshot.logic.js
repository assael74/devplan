// src/features/playersDatabase/ui/pages/DataOpsPage/logic/inventorySnapshot.logic.js

const INVENTORY_SNAPSHOT_STORAGE_KEY = 'devplan.playersDatabase.dataOps.inventory'

const parse = value => {
  try {
    return value ? JSON.parse(value) : null
  } catch {
    return null
  }
}

export const readInventorySnapshot = storage => {
  if (!storage || typeof storage.getItem !== 'function') return null
  try {
    const snapshot = parse(storage.getItem(INVENTORY_SNAPSHOT_STORAGE_KEY))
    return snapshot && Array.isArray(snapshot.collections) ? snapshot : null
  } catch {
    return null
  }
}

export const writeInventorySnapshot = ({ storage, snapshot }) => {
  if (!storage || typeof storage.setItem !== 'function' || !snapshot) return null
  try {
    storage.setItem(INVENTORY_SNAPSHOT_STORAGE_KEY, JSON.stringify(snapshot))
    return snapshot
  } catch {
    return null
  }
}

export const restoreInventorySnapshot = snapshot => {
  if (!snapshot || !Array.isArray(snapshot.collections)) return null

  return {
    ...snapshot,
    collections: snapshot.collections.map(item => ({
      ...item,
      delta: typeof item.delta === 'number' ? item.delta : null,
    })),
  }
}

export const addInventoryDeltas = ({ current, previous }) => {
  const previousCounts = new Map(
    (previous && Array.isArray(previous.collections) ? previous.collections : [])
      .map(item => [item.id, Number(item.count) || 0])
  )

  return {
    ...current,
    collections: current.collections.map(item => ({
      ...item,
      delta: previousCounts.has(item.id)
        ? item.count - previousCounts.get(item.id)
        : null,
    })),
  }
}

