// ui/forms/create/useCreateModal.js

import React, { useState } from 'react'

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

  const setDraft = React.useCallback((next) => {
    setDraftState((prev) => {
      if (typeof next === 'function') return next(prev)
      return next || {}
    })
  }, [])

  const openCreate = React.useCallback((nextType, presetDraft, ctx, options = {}) => {
    const base = cloneDraft(presetDraft || emptyDraft())

    setType(nextType)
    setDraftState(base)
    setInitialDraft(cloneDraft(base))
    setIsValid(false)
    setOpen(true)
    setContext(ctx || {})
    setBusy(false)

    setSurface(options.surface || 'drawer')
    setDrawerAnchor(options.drawerAnchor || 'bottom')
    setDrawerWidth(options.drawerWidth || 800)
  }, [])

  const reset = React.useCallback(() => {
    setDraftState(cloneDraft(initialDraft))
    setIsValid(false)
    setBusy(false)
  }, [initialDraft])

  const close = React.useCallback(() => {
    setOpen(false)
    setType(null)
    setBusy(false)
    setContext({})
    setDraftState(emptyDraft())
    setInitialDraft(emptyDraft())
    setIsValid(false)
    setSurface(defaultSurfaceState().surface)
    setDrawerAnchor(defaultSurfaceState().drawerAnchor)
    setDrawerWidth(defaultSurfaceState().drawerWidth)
  }, [])

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
    close,
    context,
    busy,
    setBusy,
    surface,
    drawerAnchor,
    drawerWidth,
  }
}
