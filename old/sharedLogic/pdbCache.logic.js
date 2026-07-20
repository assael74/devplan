// features/playersDatabase/sharedLogic/pdbCache.logic.js

import { clean } from './pdbText.logic.js'

const memoryStores = new Map()

const getMemoryStore = namespace => {
  const key = clean(namespace) || 'default'

  if (!memoryStores.has(key)) {
    memoryStores.set(key, new Map())
  }

  return memoryStores.get(key)
}

const canUseSessionStorage = () => {
  try {
    return typeof window !== 'undefined' && Boolean(window.sessionStorage)
  } catch {
    return false
  }
}

const getStorageKey = (namespace, key) =>
  `playersDatabase.${clean(namespace) || 'cache'}.${clean(key)}`

const readSessionValue = (namespace, key) => {
  if (!canUseSessionStorage()) return null

  try {
    const raw = window.sessionStorage.getItem(getStorageKey(namespace, key))
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

const writeSessionValue = (namespace, key, value) => {
  if (!canUseSessionStorage()) return

  try {
    window.sessionStorage.setItem(getStorageKey(namespace, key), JSON.stringify(value))
  } catch {
    // Session storage is an optimization only.
  }
}

const removeSessionValue = (namespace, key) => {
  if (!canUseSessionStorage()) return

  try {
    window.sessionStorage.removeItem(getStorageKey(namespace, key))
  } catch {
    // Session storage is an optimization only.
  }
}

const clearSessionByPrefix = (namespace, prefix = '') => {
  if (!canUseSessionStorage()) return

  const fullPrefix = getStorageKey(namespace, prefix)

  try {
    Object.keys(window.sessionStorage || {}).forEach(key => {
      if (key.startsWith(fullPrefix)) {
        window.sessionStorage.removeItem(key)
      }
    })
  } catch {
    // Session storage is an optimization only.
  }
}

export const createPdbCache = ({
  namespace = 'cache',
  session = true,
} = {}) => {
  const store = getMemoryStore(namespace)

  const get = key => {
    const safeKey = clean(key)
    if (!safeKey) return null

    const memoryValue = store.get(safeKey)
    if (memoryValue) return memoryValue

    if (!session) return null

    const sessionValue = readSessionValue(namespace, safeKey)
    if (!sessionValue) return null

    store.set(safeKey, sessionValue)
    return sessionValue
  }

  const set = (key, value) => {
    const safeKey = clean(key)
    if (!safeKey) return

    const payload = {
      value,
      savedAt: Date.now(),
    }

    store.set(safeKey, payload)
    if (session) writeSessionValue(namespace, safeKey, payload)
  }

  const setRaw = (key, value) => {
    const safeKey = clean(key)
    if (!safeKey) return

    store.set(safeKey, value)
    if (session) writeSessionValue(namespace, safeKey, value)
  }

  const remove = key => {
    const safeKey = clean(key)
    if (!safeKey) return

    store.delete(safeKey)
    if (session) removeSessionValue(namespace, safeKey)
  }

  const clearByPrefix = prefix => {
    const safePrefix = clean(prefix)
    if (!safePrefix) return

    Array.from(store.keys()).forEach(key => {
      if (key.startsWith(safePrefix)) {
        store.delete(key)
      }
    })

    if (session) clearSessionByPrefix(namespace, safePrefix)
  }

  const clear = () => {
    store.clear()
    if (session) clearSessionByPrefix(namespace)
  }

  return {
    get,
    set,
    setRaw,
    remove,
    clearByPrefix,
    clear,
  }
}
