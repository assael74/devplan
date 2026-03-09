/// ui/forms/create/useCreateModal.js
import React, { useState } from 'react'

function emptyDraft() {
  return {}
}

function defaultSurfaceState() {
  return {
    surface: 'modal',
    drawerAnchor: 'right',
    drawerWidth: 760,
  }
}

export function useCreateModalState() {
  const [open, setOpen] = React.useState(false)
  const [type, setType] = React.useState(null)
  const [context, setContext] = useState({})
  const [draft, setDraft] = React.useState(emptyDraft())
  const [initialDraft, setInitialDraft] = React.useState(emptyDraft())
  const [isValid, setIsValid] = React.useState(false)
  const [busy, setBusy] = React.useState(false)
  const [surface, setSurface] = React.useState(defaultSurfaceState().surface)
  const [drawerAnchor, setDrawerAnchor] = React.useState(defaultSurfaceState().drawerAnchor)
  const [drawerWidth, setDrawerWidth] = React.useState(defaultSurfaceState().drawerWidth)

  const openCreate = React.useCallback((nextType, presetDraft, ctx, options = {}) => {
    const base = presetDraft || emptyDraft()

    setType(nextType)
    setDraft(base)
    setInitialDraft(base)
    setIsValid(false)
    setOpen(true)
    setContext(ctx || {})
    setBusy(false)

    setSurface(options.surface || 'modal')
    setDrawerAnchor(options.drawerAnchor || 'right')
    setDrawerWidth(options.drawerWidth || 760)
  }, [])

  const reset = React.useCallback(() => {
    setDraft(initialDraft)
    setIsValid(false)
    setBusy(false)
  }, [initialDraft])

  const close = React.useCallback(() => {
    setOpen(false)
    setType(null)
    setBusy(false)
    setContext({})
    setSurface(defaultSurfaceState().surface)
    setDrawerAnchor(defaultSurfaceState().drawerAnchor)
    setDrawerWidth(defaultSurfaceState().drawerWidth)
  }, [])

  return {
    open,
    type,
    draft,
    isValid,
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
