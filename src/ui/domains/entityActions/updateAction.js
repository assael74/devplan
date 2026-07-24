// src/ui/entityActions/updateAction.js
import { useCallback, useMemo, useState } from 'react'

import { useSnackbar } from '../../core/feedback/snackbar/SnackbarProvider.js'
import { mapFirestoreErrorToDetails } from '../../core/feedback/snackbar/snackbar.format.js'
import { SNACK_ACTION, SNACK_STATUS } from '../../core/feedback/snackbar/snackbar.model.js'

import {
  getActionDebugMode,
  logActionDebug,
  shouldLogActionPayload,
  updateEntity,
  unwrapActionResult,
} from '../../../application/index.js'

/**
 * UI Update Action
 * - routerEntityType: לפי shortsUpdateRouterMap (למשל 'videoAnalysis')
 * - snackEntityType:  לפי snackbar labels (למשל 'video')
 */
export function useUpdateAction({
  routerEntityType,
  snackEntityType,
  id,
  entityName,
  requireAnyUpdated = true,
  createIfMissing = false,
} = {}) {
  const { notify } = useSnackbar()

  const [pending, setPending] = useState(false)
  const [lastUpdatedAt, setLastUpdatedAt] = useState(null)

  const lastUpdatedLabel = useMemo(() => {
    if (!lastUpdatedAt) return null
    try {
      return new Date(lastUpdatedAt).toLocaleString('he-IL')
    } catch {
      return null
    }
  }, [lastUpdatedAt])

  const runUpdate = useCallback(
    async (fieldsPatch, meta) => {
      const effectiveId = meta?.id || meta?.videoId || id

      if (!effectiveId) throw new Error('[useUpdateAction] missing id')
      if (!routerEntityType) throw new Error('[useUpdateAction] missing routerEntityType')
      if (!fieldsPatch || typeof fieldsPatch !== 'object') throw new Error('[useUpdateAction] fieldsPatch must be object')

      // ✅ meta overrides (מאפשר createIfMissing רק במקרים ספציפיים כמו tagIds)
      const effectiveCreateIfMissing = meta?.createIfMissing ?? createIfMissing
      const effectiveRequireAnyUpdated = meta?.requireAnyUpdated ?? requireAnyUpdated

      const ctx = {
        routerEntityType,
        id: effectiveId,
        section: meta?.section || null,
        meta: meta || null,
        fieldsKeys: Object.keys(fieldsPatch),
        mode: getActionDebugMode(),
        createIfMissing: effectiveCreateIfMissing,
        requireAnyUpdated: effectiveRequireAnyUpdated,
      }

      logActionDebug('UI_UPDATE_ACTION:start', {
        ...ctx,
        payload: shouldLogActionPayload() ? fieldsPatch : '[payload hidden]',
      })

      setPending(true)
      try {
        const result = await updateEntity({
          entityType: routerEntityType,
          id: effectiveId,
          fieldsPatch,
          createIfMissing: effectiveCreateIfMissing,
          requireAnyUpdated: effectiveRequireAnyUpdated,
          metadata: meta || null,
        })

        const res = unwrapActionResult(result)

        setLastUpdatedAt(Date.now())

        logActionDebug('UI_UPDATE_ACTION:success', { ...ctx, res })

        notify({
          status: SNACK_STATUS.SUCCESS,
          action: SNACK_ACTION.UPDATE,
          entityType: snackEntityType,
          entityName,
          meta: { ...ctx, res },
        })

        return res
      } catch (err) {
        const details = mapFirestoreErrorToDetails(err)

        if (err?.code === 'ROUTER_UNKNOWN_FIELD') {
          const badField = err?.meta?.fieldKey
          const ent = err?.meta?.entityType
          const avail = (err?.meta?.availableKeys || []).slice(0, 12).join(', ')

          details.title = 'שגיאת מיפוי עדכון'
          details.message = `השדה "${badField}" לא ממופה ב־router עבור "${ent}".`
          details.hint = avail ? `שדות ממופים לדוגמה: ${avail}` : 'בדוק shortsUpdateRouter.js'
        }

        logActionDebug('UI_UPDATE_ACTION:error', { ...ctx, err: String(err?.message || err) })

        notify({
          status: SNACK_STATUS.ERROR,
          action: SNACK_ACTION.UPDATE,
          entityType: snackEntityType,
          entityName,
          details,
          meta: { ...ctx, err: String(err?.message || err) },
          onRetry: async () => {
            await runUpdate(fieldsPatch, meta)
          },
        })

        throw err
      } finally {
        setPending(false)
      }
    },
    [
      notify,
      id,
      routerEntityType,
      snackEntityType,
      entityName,
      requireAnyUpdated,
      createIfMissing,
    ]
  )

  return { runUpdate, pending, lastUpdatedAt, lastUpdatedLabel }
}
