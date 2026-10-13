// src/features/playersDatabase/ui/components/page/usePageSidePanelCollapsed.js

import * as React from 'react'

const readCollapsedState = storageKey => {
  try {
    return window.localStorage.getItem(storageKey) !== '0'
  } catch {
    return true
  }
}

export default function usePageSidePanelCollapsed(storageKey) {
  const [collapsed, setCollapsed] = React.useState(() => (
    readCollapsedState(storageKey)
  ))

  const setPersistentCollapsed = React.useCallback(nextCollapsed => {
    const nextValue = Boolean(nextCollapsed)

    setCollapsed(nextValue)

    try {
      window.localStorage.setItem(storageKey, nextValue ? '1' : '0')
    } catch {
      // The layout remains usable when browser storage is unavailable.
    }
  }, [storageKey])

  return [collapsed, setPersistentCollapsed]
}
