// src/features/playersDatabase/services/cache/documentCache.test.js

import {
  clearPlayersDatabaseDocumentCache,
  deleteDocumentCacheValue,
  getDocumentCacheEntry,
  getDocumentStoreSnapshot,
  getDocumentCacheResolvedKey,
  invalidateDocumentCacheValueKeepingSnapshot,
  readWithDocumentCache,
  refreshWithDocumentCache,
  setDocumentCacheAlias,
  setDocumentCacheValue,
  updateDocumentCacheValue,
  subscribeDocumentStoreKey,
} from './documentCache.js'

beforeEach(() => {
  clearPlayersDatabaseDocumentCache()
})

test('deduplicates concurrent reads for the same key', async () => {
  let resolveRead
  const read = jest.fn(() => new Promise(resolve => { resolveRead = resolve }))

  const first = readWithDocumentCache({ key: 'league:1', read })
  const second = readWithDocumentCache({ key: 'league:1', read })

  await Promise.resolve()
  expect(read).toHaveBeenCalledTimes(1)

  resolveRead({ id: '1' })
  await expect(Promise.all([first, second])).resolves.toEqual([{ id: '1' }, { id: '1' }])
  expect(read).toHaveBeenCalledTimes(1)
})

test('invalidation during an active request prevents the stale result from repopulating cache', async () => {
  let resolveRead
  const read = jest.fn(() => new Promise(resolve => { resolveRead = resolve }))

  const request = readWithDocumentCache({ key: 'club:1', read })
  await Promise.resolve()
  deleteDocumentCacheValue('club:1')
  resolveRead({ id: '1', stale: true })
  await request

  expect(getDocumentCacheEntry('club:1')).toEqual({ hit: false, value: null })
  expect(getDocumentStoreSnapshot('club:1').status).toBe('idle')
})

test('getSnapshot keeps the same reference until the store entry changes', () => {
  setDocumentCacheValue({ key: 'league:1', value: { id: '1' } })

  const first = getDocumentStoreSnapshot('league:1')
  const second = getDocumentStoreSnapshot('league:1')
  expect(second).toBe(first)

  setDocumentCacheValue({ key: 'league:1', value: { id: '1', name: 'Updated' } })
  expect(getDocumentStoreSnapshot('league:1')).not.toBe(first)
})

test('failed refresh keeps previous data and exposes refreshError', async () => {
  const error = new Error('refresh failed')
  setDocumentCacheValue({ key: 'league:1', value: { id: '1', name: 'Existing' } })

  await expect(refreshWithDocumentCache({
    key: 'league:1',
    read: async () => { throw error },
  })).rejects.toThrow('refresh failed')

  const snapshot = getDocumentStoreSnapshot('league:1')
  expect(snapshot.status).toBe('ready')
  expect(snapshot.data).toEqual({ id: '1', name: 'Existing' })
  expect(snapshot.refreshError).toBe(error)
})

test('alias keys resolve to one canonical entry and notify alias subscribers', () => {
  const callback = jest.fn()
  const unsubscribe = subscribeDocumentStoreKey('player:legacy-1', callback)

  setDocumentCacheValue({
    key: 'player:canonical-1',
    value: { id: 'canonical-1' },
  })
  setDocumentCacheAlias({
    aliasKey: 'player:legacy-1',
    targetKey: 'player:canonical-1',
  })

  expect(getDocumentCacheResolvedKey('player:legacy-1')).toBe('player:canonical-1')
  expect(getDocumentCacheEntry('player:legacy-1')).toEqual({
    hit: true,
    value: { id: 'canonical-1' },
  })
  expect(getDocumentStoreSnapshot('player:legacy-1')).toBe(
    getDocumentStoreSnapshot('player:canonical-1')
  )
  expect(callback).toHaveBeenCalled()

  unsubscribe()
})


test('snapshot-preserving invalidation keeps visible data but forces the next read', async () => {
  const read = jest.fn(async () => ({ id: 'team-page-1', version: 2 }))
  setDocumentCacheValue({
    key: 'teamPage:league-1:team-1',
    value: { id: 'team-page-1', version: 1 },
  })

  invalidateDocumentCacheValueKeepingSnapshot('teamPage:league-1:team-1')

  expect(getDocumentStoreSnapshot('teamPage:league-1:team-1').data).toEqual({
    id: 'team-page-1',
    version: 1,
  })
  expect(getDocumentCacheEntry('teamPage:league-1:team-1').hit).toBe(false)

  await expect(readWithDocumentCache({
    key: 'teamPage:league-1:team-1',
    read,
  })).resolves.toEqual({ id: 'team-page-1', version: 2 })
  expect(read).toHaveBeenCalledTimes(1)
  expect(getDocumentStoreSnapshot('teamPage:league-1:team-1').data).toEqual({
    id: 'team-page-1',
    version: 2,
  })
})


test('failed refresh after snapshot-preserving invalidation keeps stale data invalid for retry', async () => {
  const error = new Error('refresh failed')
  const key = 'teamPage:league-1:team-1'
  setDocumentCacheValue({
    key,
    value: { id: 'team-page-1', version: 1 },
  })
  invalidateDocumentCacheValueKeepingSnapshot(key)

  await expect(readWithDocumentCache({
    key,
    read: async () => { throw error },
  })).rejects.toThrow('refresh failed')

  const snapshot = getDocumentStoreSnapshot(key)
  expect(snapshot.status).toBe('ready')
  expect(snapshot.data).toEqual({ id: 'team-page-1', version: 1 })
  expect(snapshot.refreshError).toBe(error)
  expect(getDocumentCacheEntry(key)).toEqual({ hit: false, value: null })

  const retry = jest.fn(async () => ({ id: 'team-page-1', version: 2 }))
  await expect(readWithDocumentCache({ key, read: retry })).resolves.toEqual({
    id: 'team-page-1',
    version: 2,
  })
  expect(retry).toHaveBeenCalledTimes(1)
})


test('authoritative write-through prevents an older pending read from overwriting the Store', async () => {
  let resolveRead
  const read = jest.fn(() => new Promise(resolve => { resolveRead = resolve }))
  const key = 'league:1'

  setDocumentCacheValue({
    key,
    value: { id: '1', name: 'Before write' },
  })

  const pendingRefresh = refreshWithDocumentCache({ key, read })
  await Promise.resolve()

  updateDocumentCacheValue({
    key,
    updater: current => ({ ...current, name: 'After write' }),
  })

  resolveRead({ id: '1', name: 'Stale server response' })
  await expect(pendingRefresh).resolves.toEqual({ id: '1', name: 'Stale server response' })

  expect(getDocumentCacheEntry(key)).toEqual({
    hit: true,
    value: { id: '1', name: 'After write' },
  })
  expect(getDocumentStoreSnapshot(key).data).toEqual({
    id: '1',
    name: 'After write',
  })
})


test('authoritative write-through cancellation leaves an empty key idle and ignores the stale read result', async () => {
  let resolveRead
  const read = jest.fn(() => new Promise(resolve => { resolveRead = resolve }))
  const key = 'league:empty'
  const callback = jest.fn()
  const unsubscribe = subscribeDocumentStoreKey(key, callback)

  const pendingRead = readWithDocumentCache({ key, read })
  await Promise.resolve()
  expect(getDocumentStoreSnapshot(key).status).toBe('loading')

  expect(updateDocumentCacheValue({
    key,
    updater: current => ({ ...current, name: 'After write' }),
  })).toBeNull()

  expect(getDocumentStoreSnapshot(key).status).toBe('idle')
  expect(callback).toHaveBeenCalled()

  resolveRead({ id: 'stale', name: 'Stale server response' })
  await expect(pendingRead).resolves.toEqual({ id: 'stale', name: 'Stale server response' })

  expect(getDocumentCacheEntry(key)).toEqual({ hit: false, value: null })
  expect(getDocumentStoreSnapshot(key).status).toBe('idle')

  unsubscribe()
})


test('authoritative write-through cancellation keeps an invalid stale snapshot ready for a later retry', async () => {
  let resolveRead
  const read = jest.fn(() => new Promise(resolve => { resolveRead = resolve }))
  const key = 'league:stale'

  setDocumentCacheValue({
    key,
    value: { id: '1', name: 'Stale visible value' },
  })
  invalidateDocumentCacheValueKeepingSnapshot(key)

  const pendingRead = readWithDocumentCache({ key, read })
  await Promise.resolve()
  expect(getDocumentStoreSnapshot(key).status).toBe('loading')

  expect(updateDocumentCacheValue({
    key,
    updater: current => ({ ...current, name: 'After write' }),
  })).toBeNull()

  expect(getDocumentStoreSnapshot(key).status).toBe('ready')
  expect(getDocumentStoreSnapshot(key).data).toEqual({
    id: '1',
    name: 'Stale visible value',
  })
  expect(getDocumentCacheEntry(key)).toEqual({ hit: false, value: null })

  resolveRead({ id: '1', name: 'Older server response' })
  await pendingRead

  expect(getDocumentStoreSnapshot(key).status).toBe('ready')
  expect(getDocumentStoreSnapshot(key).data).toEqual({
    id: '1',
    name: 'Stale visible value',
  })
  expect(getDocumentCacheEntry(key)).toEqual({ hit: false, value: null })
})
