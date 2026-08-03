import React from 'react'

import { readOfficialFirestoreUsage } from '../services/firestoreOfficialUsage.api.js'

const INITIAL_STATE = {
  status: 'idle',
  data: null,
  error: null,
  lastUpdatedAt: null,
}

export default function useOfficialFirestoreUsage() {
  const [state, setState] = React.useState(INITIAL_STATE)

  const refresh = React.useCallback(async () => {
    setState(current => ({
      ...current,
      status: 'loading',
      error: null,
    }))

    try {
      const result = await readOfficialFirestoreUsage()

      setState({
        status: result.status,
        data: result.data,
        error: null,
        lastUpdatedAt: new Date().toISOString(),
      })
    } catch (error) {
      setState(current => ({
        ...current,
        status: 'error',
        error: error?.message || 'Official usage request failed',
        lastUpdatedAt: new Date().toISOString(),
      }))
    }
  }, [])

  React.useEffect(() => {
    refresh()
  }, [refresh])

  return {
    ...state,
    refresh,
  }
}
