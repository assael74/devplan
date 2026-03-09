// src/ui/snackbar/SnackbarProvider.js
import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'
import { DEFAULTS, DEFAULT_DURATIONS, SNACK_STATUS } from './snackbar.model.js'
import { buildDedupeKey } from './snackbar.format.js'

const SnackbarCtx = createContext(null)

export const useSnackbar = () => {
  const ctx = useContext(SnackbarCtx)
  if (!ctx) throw new Error('useSnackbar must be used within <SnackbarProvider>')
  return ctx
}

const now = () => Date.now()

export default function SnackbarProvider({ children, options }) {
  const cfg = { ...DEFAULTS, ...(options || {}) }

  const [queue, setQueue] = useState([])
  const [active, setActive] = useState(null)

  const lastShownRef = useRef(new Map())
  const retryRef = useRef(null)

  const enqueue = useCallback((payload) => {
    setQueue((prev) => {
      const max = cfg.maxSnack || DEFAULTS.maxSnack
      const next = [...prev, payload]
      return next.length > max ? next.slice(next.length - max) : next
    })
  }, [cfg.maxSnack])

  const notify = useCallback((input) => {
    const status = input.status || SNACK_STATUS.SUCCESS
    const durationMs =
      Number.isFinite(input?.durationMs) ? input.durationMs : DEFAULT_DURATIONS[status]

    const payload = {
      id: input?.id || `${now()}_${Math.random().toString(16).slice(2)}`,
      status,
      action: input?.action || null,
      entityType: input?.entityType || null,
      entityName: input?.entityName || null,
      title: input?.title || null,
      message: input?.message || null,
      details: input?.details || null,
      durationMs,
      meta: input?.meta || null,
      // callbacks
      onRetry: typeof input?.onRetry === 'function' ? input.onRetry : null,
      onClose: typeof input?.onClose === 'function' ? input.onClose : null,
      // chips control
      showChips: input?.showChips !== false,
      // internal
      _dedupeKey: buildDedupeKey(input || {}),
    }

    // dedupe window
    const key = payload._dedupeKey
    const ts = lastShownRef.current.get(key)
    if (ts && now() - ts < (cfg.dedupeWindowMs || DEFAULTS.dedupeWindowMs)) return

    lastShownRef.current.set(key, now())
    enqueue(payload)
  }, [cfg.dedupeWindowMs, enqueue])

  const showNext = useCallback(() => {
    setQueue((prev) => {
      if (!prev.length) return prev
      const [next, ...rest] = prev
      setActive(next)
      retryRef.current = next?.onRetry || null
      return rest
    })
  }, [])

  const closeActive = useCallback((reason) => {
    setActive((cur) => {
      if (cur?.onClose) {
        try { cur.onClose(reason) } catch (e) {}
      }
      return null
    })
  }, [])

  const retryActive = useCallback(async () => {
    const fn = retryRef.current
    if (typeof fn !== 'function') return
    try {
      await fn()
    } catch (e) {
      // intentionally swallow: תעדכנו את הזרימה שתקרא notify על שגיאה
    }
  }, [])

  // “מנוע” קטן: אם אין active ויש תור — מציג הבא
  if (!active && queue.length) {
    // safe synchronous kick (לא setState בלולאה): defer microtask
    Promise.resolve().then(showNext)
  }

  const api = useMemo(() => ({
    notify,
    active,
    closeActive,
    retryActive,
  }), [notify, active, closeActive, retryActive])

  return <SnackbarCtx.Provider value={api}>{children}</SnackbarCtx.Provider>
}
