// src/ui/entityActions/updateAction.js
import { useCallback, useMemo, useState } from 'react'

import { useSnackbar } from '../../core/feedback/snackbar/SnackbarProvider.js'
import { mapFirestoreErrorToDetails } from '../../core/feedback/snackbar/snackbar.format.js'
import { SNACK_ACTION, SNACK_STATUS } from '../../core/feedback/snackbar/snackbar.model.js'

import { updateByRouterFields } from '../../../services/firestore/shorts/shortsUpdateByRouter.js'
import { debugLog } from '../../../services/firestore/shorts/shortsDebug.utils.js'
import { SHORTS_DEBUG } from '../../../services/firestore/shorts/shortsDebug.config.js'

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
      if (!id) throw new Error('[useUpdateAction] missing id')
      if (!routerEntityType) throw new Error('[useUpdateAction] missing routerEntityType')
      if (!fieldsPatch || typeof fieldsPatch !== 'object') throw new Error('[useUpdateAction] fieldsPatch must be object')

      // ✅ meta overrides (מאפשר createIfMissing רק במקרים ספציפיים כמו tagIds)
      const effectiveCreateIfMissing = meta?.createIfMissing ?? createIfMissing
      const effectiveRequireAnyUpdated = meta?.requireAnyUpdated ?? requireAnyUpdated

      const ctx = {
        routerEntityType,
        id,
        section: meta?.section || null,
        meta: meta || null,
        fieldsKeys: Object.keys(fieldsPatch),
        mode: SHORTS_DEBUG?.dryRun ? 'DRY_RUN' : 'WRITE',
        createIfMissing: effectiveCreateIfMissing,
        requireAnyUpdated: effectiveRequireAnyUpdated,
      }

      debugLog('UI_UPDATE_ACTION:start', {
        ...ctx,
        payload: SHORTS_DEBUG?.logPayload ? fieldsPatch : '[payload hidden]',
      })

      setPending(true)
      try {
        const res = await updateByRouterFields({
          entityType: routerEntityType,
          id,
          fieldsPatch,
          createIfMissing: effectiveCreateIfMissing,
          requireAnyUpdated: effectiveRequireAnyUpdated,
        })

        setLastUpdatedAt(Date.now())

        debugLog('UI_UPDATE_ACTION:success', { ...ctx, res })

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

        debugLog('UI_UPDATE_ACTION:error', { ...ctx, err: String(err?.message || err) })

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
