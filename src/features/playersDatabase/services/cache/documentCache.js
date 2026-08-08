// features/playersDatabase/services/cache/documentCache.js

const documentCache = new Map()
const pendingRequests = new Map()
let cacheRevision = 0

const cloneCacheValue = value => value

export const getDocumentCacheEntry = key => {
  if (!documentCache.has(key)) {
    return {
      hit: false,
      value: null,
    }
  }

  return {
    hit: true,
    value: cloneCacheValue(documentCache.get(key)?.value),
  }
}

export const setDocumentCacheValue = ({ key, value }) => {
  documentCache.set(key, {
    value: cloneCacheValue(value),
    cachedAt: Date.now(),
  })

  return value
}

export const deleteDocumentCacheValue = key => {
  cacheRevision += 1
  documentCache.delete(key)
  pendingRequests.delete(key)
}

export const invalidateDocumentCacheByPrefix = prefix => {
  const safePrefix = String(prefix === undefined || prefix === null ? '' : prefix).trim()
  if (!safePrefix) return

  cacheRevision += 1

  Array.from(documentCache.keys()).forEach(key => {
    if (key === safePrefix || key.startsWith(`${safePrefix}:`)) {
      documentCache.delete(key)
    }
  })

  Array.from(pendingRequests.keys()).forEach(key => {
    if (key === safePrefix || key.startsWith(`${safePrefix}:`)) {
      pendingRequests.delete(key)
    }
  })
}

export const clearPlayersDatabaseDocumentCache = () => {
  cacheRevision += 1
  documentCache.clear()
  pendingRequests.clear()
}

export const readWithDocumentCache = async ({ key, read }) => {
  const cached = getDocumentCacheEntry(key)
  if (cached.hit) return cached.value

  if (pendingRequests.has(key)) {
    return pendingRequests.get(key)
  }

  const requestRevision = cacheRevision
  const request = Promise.resolve()
    .then(read)
    .then(value => {
      if (requestRevision === cacheRevision) {
        setDocumentCacheValue({
          key,
          value,
        })
      }

      return value
    })
    .finally(() => {
      if (pendingRequests.get(key) === request) {
        pendingRequests.delete(key)
      }
    })

  pendingRequests.set(key, request)
  return request
}

export const getPlayersDatabaseCacheDebugSnapshot = () => ({
  revision: cacheRevision,
  cachedKeys: Array.from(documentCache.keys()),
  pendingKeys: Array.from(pendingRequests.keys()),
})
