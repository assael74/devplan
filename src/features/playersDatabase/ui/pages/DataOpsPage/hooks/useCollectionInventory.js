// src/features/playersDatabase/ui/pages/DataOpsPage/hooks/useCollectionInventory.js

import { useCallback, useEffect, useRef, useState } from 'react'

import { readPlayersDatabaseCollectionInventory } from '../../../../services/read/inventory/collectionInventory.read.js'
import {
  addInventoryDeltas,
  readInventorySnapshot,
  restoreInventorySnapshot,
  writeInventorySnapshot,
} from '../logic/inventorySnapshot.logic.js'

const browserStorage = () => (
  typeof window === 'undefined' ? null : window.localStorage
)

export default function useCollectionInventory() {
  const [storedInventory] = useState(() => (
    restoreInventorySnapshot(readInventorySnapshot(browserStorage()))
  ))
  const [inventory, setInventory] = useState(storedInventory)
  const [loading, setLoading] = useState(!storedInventory)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')
  const initialLoadStartedRef = useRef(false)

  const load = useCallback(async ({ refresh = false } = {}) => {
    if (refresh) setRefreshing(true)
    else setLoading(true)
    setError('')

    try {
      const storage = browserStorage()
      const previous = readInventorySnapshot(storage)
      const current = await readPlayersDatabaseCollectionInventory()
      const nextInventory = addInventoryDeltas({ current, previous })
      writeInventorySnapshot({ storage, snapshot: nextInventory })
      setInventory(nextInventory)
      return nextInventory
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'טעינת כמויות המסמכים נכשלה')
      throw loadError
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    if (storedInventory || initialLoadStartedRef.current) return
    initialLoadStartedRef.current = true
    load().catch(() => {})
  }, [load, storedInventory])

  return {
    inventory,
    loading,
    refreshing,
    error,
    reload: () => load({ refresh: true }),
  }
}

