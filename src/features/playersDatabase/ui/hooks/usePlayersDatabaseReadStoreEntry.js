// src/features/playersDatabase/ui/hooks/usePlayersDatabaseReadStoreEntry.js

import {
  useCallback,
  useSyncExternalStore,
} from 'react'

import {
  getDocumentStoreSnapshot,
  subscribeDocumentStoreKey,
} from '../../services/cache/index.js'

export default function usePlayersDatabaseReadStoreEntry(key) {
  const subscribe = useCallback(
    callback => subscribeDocumentStoreKey(key, callback),
    [key]
  )
  const getSnapshot = useCallback(
    () => getDocumentStoreSnapshot(key),
    [key]
  )

  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
}
