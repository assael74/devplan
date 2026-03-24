import React, { useState } from 'react'

const CLOSE_DELAY_MS = 300

function emptyDraft() {
  return {}
}

function cloneDraft(value) {
  if (!value || typeof value !== 'object') return {}
  return JSON.parse(JSON.stringify(value))
}

function defaultSurfaceState() {
  return {
    surface: 'drawer',
    drawerAnchor: 'bottom',
    drawerWidth: 800,
  }
}

function areDraftsEqual(a, b) {
  return JSON.stringify(a || {}) === JSON.stringify(b || {})
}

export function useCreateModalState() {
  const closeTimerRef = React.useRef(null)

  const [open, setOpen] = React.useState(false)
  const [type, setType] = React.useState(null)
  const [context, setContext] = useState({})
  const [draft, setDraftState] = React.useState(emptyDraft())
  const [initialDraft, setInitialDraft] = React.useState(emptyDraft())
  const [isValid, setIsValid] = React.useState(false)
  const [busy, setBusy] = React.useState(false)
  const [surface, setSurface] = React.useState(defaultSurfaceState().surface)
  const [drawerAnchor, setDrawerAnchor] = React.useState(defaultSurfaceState().drawerAnchor)
  const [drawerWidth, setDrawerWidth] = React.useState(defaultSurfaceState().drawerWidth)

  const isDirty = React.useMemo(() => {
    return !areDraftsEqual(draft, initialDraft)
  }, [draft, initialDraft])

  const clearCloseTimer = React.useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }
  }, [])

  React.useEffect(() => {
    return () => clearCloseTimer()
  }, [clearCloseTimer])

  const setDraft = React.useCallback((next) => {
    setDraftState((prev) => {
      if (typeof next === 'function') return next(prev)
      return next || {}
    })
  }, [])

  const cleanupClose = React.useCallback(() => {
    clearCloseTimer()
    setType(null)
    setBusy(false)
    setContext({})
    setDraftState(emptyDraft())
    setInitialDraft(emptyDraft())
    setIsValid(false)
    setSurface(defaultSurfaceState().surface)
    setDrawerAnchor(defaultSurfaceState().drawerAnchor)
    setDrawerWidth(defaultSurfaceState().drawerWidth)
  }, [clearCloseTimer])

  const openCreate = React.useCallback((nextType, presetDraft, ctx, options = {}) => {
    clearCloseTimer()

    const base = cloneDraft(presetDraft || emptyDraft())

    setType(nextType)
    setDraftState(base)
    setInitialDraft(cloneDraft(base))
    setIsValid(false)
    setContext(ctx || {})
    setBusy(false)

    setSurface(options.surface || 'drawer')
    setDrawerAnchor(options.drawerAnchor || 'bottom')
    setDrawerWidth(options.drawerWidth || 800)

    setOpen(true)
  }, [clearCloseTimer])

  const reset = React.useCallback(() => {
    setDraftState(cloneDraft(initialDraft))
    setIsValid(false)
    setBusy(false)
  }, [initialDraft])

  const requestClose = React.useCallback(() => {
    clearCloseTimer()
    setOpen(false)

    closeTimerRef.current = setTimeout(() => {
      cleanupClose()
    }, CLOSE_DELAY_MS)
  }, [clearCloseTimer, cleanupClose])

  return {
    open,
    type,
    draft,
    isValid,
    isDirty,
    setDraft,
    setIsValid,
    openCreate,
    reset,
    requestClose,
    cleanupClose,
    context,
    busy,
    setBusy,
    surface,
    drawerAnchor,
    drawerWidth,
  }
}
