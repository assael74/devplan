// src/features/playersDatabase/services/cache/documentCache.js

const documentCache = new Map()
const pendingRequests = new Map()
const subscribersByKey = new Map()
const aliases = new Map()
let cacheRevision = 0

const EMPTY_SNAPSHOT = Object.freeze({
  data: null,
  status: 'idle',
  error: null,
  refreshError: null,
  cachedAt: null,
})

const cloneCacheValue = value => value

const buildSnapshot = ({
  value = null,
  status = 'idle',
  error = null,
  refreshError = null,
  cachedAt = null,
} = {}) => Object.freeze({
  data: cloneCacheValue(value),
  status,
  error,
  refreshError,
  cachedAt,
})

const resolveCacheKey = key => {
  let current = key
  const visited = new Set()

  while (aliases.has(current) && !visited.has(current)) {
    visited.add(current)
    current = aliases.get(current)
  }

  return current
}

const notifySubscribers = key => {
  const canonicalKey = resolveCacheKey(key)
  const notified = new Set()

  subscribersByKey.forEach((subscribers, subscribedKey) => {
    if (resolveCacheKey(subscribedKey) !== canonicalKey) return

    subscribers.forEach(callback => {
      if (notified.has(callback)) return
      notified.add(callback)
      callback()
    })
  })
}

const setCacheEntry = ({
  key,
  value,
  status = 'ready',
  error = null,
  refreshError = null,
  cachedAt = Date.now(),
}) => {
  const canonicalKey = resolveCacheKey(key)
  const snapshot = buildSnapshot({
    value,
    status,
    error,
    refreshError,
    cachedAt,
  })

  documentCache.set(canonicalKey, {
    value: cloneCacheValue(value),
    hasValue: true,
    valid: true,
    cachedAt,
    snapshot,
  })
  notifySubscribers(canonicalKey)
  return value
}

const setTransientSnapshot = ({
  key,
  status,
  error = null,
  refreshError = null,
}) => {
  const canonicalKey = resolveCacheKey(key)
  const current = documentCache.get(canonicalKey)
  const value = current?.value ?? null
  const hasValue = current?.hasValue === true
  const valid = current?.valid !== false
  const cachedAt = current?.cachedAt ?? null

  documentCache.set(canonicalKey, {
    value,
    hasValue,
    valid,
    cachedAt,
    snapshot: buildSnapshot({
      value,
      status,
      error,
      refreshError,
      cachedAt,
    }),
  })
  notifySubscribers(canonicalKey)
}

export const getDocumentCacheResolvedKey = key => resolveCacheKey(key)

export const setDocumentCacheAlias = ({ aliasKey, targetKey } = {}) => {
  const safeAliasKey = String(aliasKey === undefined || aliasKey === null ? '' : aliasKey).trim()
  const safeTargetKey = String(targetKey === undefined || targetKey === null ? '' : targetKey).trim()
  if (!safeAliasKey || !safeTargetKey) return ''

  const canonicalTargetKey = resolveCacheKey(safeTargetKey)
  if (safeAliasKey === canonicalTargetKey) {
    aliases.delete(safeAliasKey)
    return canonicalTargetKey
  }

  aliases.set(safeAliasKey, canonicalTargetKey)
  notifySubscribers(canonicalTargetKey)
  return canonicalTargetKey
}

export const getDocumentCacheEntry = key => {
  const canonicalKey = resolveCacheKey(key)
  if (
    !documentCache.has(canonicalKey) ||
    documentCache.get(canonicalKey)?.hasValue !== true ||
    documentCache.get(canonicalKey)?.valid === false
  ) {
    return {
      hit: false,
      value: null,
    }
  }

  return {
    hit: true,
    value: cloneCacheValue(documentCache.get(canonicalKey)?.value),
  }
}

export const getDocumentStoreSnapshot = key => (
  documentCache.get(resolveCacheKey(key))?.snapshot || EMPTY_SNAPSHOT
)

export const subscribeDocumentStoreKey = (key, callback) => {
  if (!key || typeof callback !== 'function') return () => {}

  if (!subscribersByKey.has(key)) {
    subscribersByKey.set(key, new Set())
  }

  const subscribers = subscribersByKey.get(key)
  subscribers.add(callback)

  return () => {
    subscribers.delete(callback)
    if (!subscribers.size) {
      subscribersByKey.delete(key)
    }
  }
}

export const setDocumentCacheValue = ({ key, value }) => setCacheEntry({
  key,
  value,
})

export const updateDocumentCacheValue = ({ key, updater }) => {
  if (typeof updater !== 'function') return null

  const canonicalKey = resolveCacheKey(key)

  // A local write-through is authoritative for this key. Any older in-flight
  // read may still resolve for its caller, but it must not repopulate the Store.
  pendingRequests.delete(canonicalKey)

  const current = getDocumentCacheEntry(canonicalKey)
  if (!current.hit) {
    const existing = documentCache.get(canonicalKey)

    if (!existing?.hasValue) {
      documentCache.delete(canonicalKey)
      notifySubscribers(canonicalKey)
      return null
    }

    documentCache.set(canonicalKey, {
      ...existing,
      valid: false,
      snapshot: buildSnapshot({
        value: existing.value,
        status: 'ready',
        error: null,
        refreshError: existing.snapshot?.refreshError ?? null,
        cachedAt: existing.cachedAt ?? null,
      }),
    })
    notifySubscribers(canonicalKey)
    return null
  }

  const nextValue = updater(current.value)
  return setDocumentCacheValue({ key: canonicalKey, value: nextValue })
}

export const deleteDocumentCacheValue = key => {
  const canonicalKey = resolveCacheKey(key)
  cacheRevision += 1
  documentCache.delete(canonicalKey)
  pendingRequests.delete(canonicalKey)
  notifySubscribers(canonicalKey)
}


export const invalidateDocumentCacheValueKeepingSnapshot = key => {
  const canonicalKey = resolveCacheKey(key)
  const current = documentCache.get(canonicalKey)
  cacheRevision += 1
  pendingRequests.delete(canonicalKey)

  if (!current?.hasValue) {
    documentCache.delete(canonicalKey)
    notifySubscribers(canonicalKey)
    return
  }

  documentCache.set(canonicalKey, {
    ...current,
    valid: false,
  })
  notifySubscribers(canonicalKey)
}

export const invalidateDocumentCacheByPrefixKeepingSnapshot = prefix => {
  const safePrefix = String(prefix === undefined || prefix === null ? '' : prefix).trim()
  if (!safePrefix) return

  const keys = new Set([
    ...documentCache.keys(),
    ...pendingRequests.keys(),
  ])

  keys.forEach(key => {
    if (key === safePrefix || key.startsWith(`${safePrefix}:`)) {
      invalidateDocumentCacheValueKeepingSnapshot(key)
    }
  })
}

export const invalidateDocumentCacheByPrefix = prefix => {
  const safePrefix = String(prefix === undefined || prefix === null ? '' : prefix).trim()
  if (!safePrefix) return

  cacheRevision += 1
  const invalidatedKeys = new Set()

  Array.from(documentCache.keys()).forEach(key => {
    if (key === safePrefix || key.startsWith(`${safePrefix}:`)) {
      documentCache.delete(key)
      invalidatedKeys.add(key)
    }
  })

  Array.from(pendingRequests.keys()).forEach(key => {
    if (key === safePrefix || key.startsWith(`${safePrefix}:`)) {
      pendingRequests.delete(key)
      invalidatedKeys.add(key)
    }
  })

  invalidatedKeys.forEach(notifySubscribers)
}

export const clearPlayersDatabaseDocumentCache = () => {
  cacheRevision += 1
  const keys = new Set([
    ...documentCache.keys(),
    ...pendingRequests.keys(),
    ...subscribersByKey.keys(),
    ...aliases.keys(),
  ])

  documentCache.clear()
  pendingRequests.clear()
  aliases.clear()
  keys.forEach(notifySubscribers)
}

export const readWithDocumentCache = async ({ key, read }) => {
  const canonicalKey = resolveCacheKey(key)
  const cached = getDocumentCacheEntry(canonicalKey)
  if (cached.hit) return cached.value

  const staleEntry = documentCache.get(canonicalKey)
  const staleValue = staleEntry?.hasValue === true ? staleEntry.value : null
  const hasStaleValue = staleEntry?.hasValue === true
  const staleCachedAt = staleEntry?.cachedAt ?? null

  if (pendingRequests.has(canonicalKey)) {
    return pendingRequests.get(canonicalKey)
  }

  const request = Promise.resolve()
    .then(read)
    .then(value => {
      if (pendingRequests.get(canonicalKey) === request) {
        setDocumentCacheValue({
          key: canonicalKey,
          value,
        })
      }

      return value
    })
    .catch(error => {
      if (pendingRequests.get(canonicalKey) === request) {
        if (hasStaleValue) {
          documentCache.set(canonicalKey, {
            value: cloneCacheValue(staleValue),
            hasValue: true,
            valid: false,
            cachedAt: staleCachedAt,
            snapshot: buildSnapshot({
              value: staleValue,
              status: 'ready',
              refreshError: error,
              cachedAt: staleCachedAt,
            }),
          })
          notifySubscribers(canonicalKey)
        } else {
          setTransientSnapshot({
            key: canonicalKey,
            status: 'error',
            error,
          })
        }
      }
      throw error
    })
    .finally(() => {
      if (pendingRequests.get(canonicalKey) === request) {
        pendingRequests.delete(canonicalKey)
      }
    })

  pendingRequests.set(canonicalKey, request)
  setTransientSnapshot({ key: canonicalKey, status: 'loading' })
  return request
}

export const refreshWithDocumentCache = async ({ key, read }) => {
  const canonicalKey = resolveCacheKey(key)
  if (pendingRequests.has(canonicalKey)) {
    return pendingRequests.get(canonicalKey)
  }

  const currentEntry = documentCache.get(canonicalKey)
  const previousValue = currentEntry?.hasValue === true
    ? currentEntry.value
    : null
  const hadPreviousValue = currentEntry?.hasValue === true
  const previousWasValid = currentEntry?.valid !== false
  const previousCachedAt = currentEntry?.cachedAt ?? null
  const request = Promise.resolve()
    .then(read)
    .then(value => {
      if (pendingRequests.get(canonicalKey) === request) {
        setDocumentCacheValue({
          key: canonicalKey,
          value,
        })
      }
      return value
    })
    .catch(error => {
      if (pendingRequests.get(canonicalKey) === request) {
        if (hadPreviousValue) {
          documentCache.set(canonicalKey, {
            value: cloneCacheValue(previousValue),
            hasValue: true,
            valid: previousWasValid,
            cachedAt: previousCachedAt,
            snapshot: buildSnapshot({
              value: previousValue,
              status: 'ready',
              refreshError: error,
              cachedAt: previousCachedAt,
            }),
          })
          notifySubscribers(canonicalKey)
        } else {
          setTransientSnapshot({
            key: canonicalKey,
            status: 'error',
            error,
          })
        }
      }
      throw error
    })
    .finally(() => {
      if (pendingRequests.get(canonicalKey) === request) {
        pendingRequests.delete(canonicalKey)
      }
    })

  pendingRequests.set(canonicalKey, request)
  setTransientSnapshot({
    key: canonicalKey,
    status: hadPreviousValue ? 'refreshing' : 'loading',
  })
  return request
}

export const getPlayersDatabaseCacheDebugSnapshot = () => ({
  revision: cacheRevision,
  cachedKeys: Array.from(documentCache.keys()),
  pendingKeys: Array.from(pendingRequests.keys()),
  subscribedKeys: Array.from(subscribersByKey.keys()),
  aliases: Array.from(aliases.entries()),
})
