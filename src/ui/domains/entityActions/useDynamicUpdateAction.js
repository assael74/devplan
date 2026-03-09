// src/ui/entityActions/useDynamicUpdateAction.js
import { useCallback, useMemo, useState } from 'react'

import { useSnackbar } from '../../core/feedback/snackbar/SnackbarProvider.js'
import { mapFirestoreErrorToDetails } from '../../core/feedback/snackbar/snackbar.format.js'
import { SNACK_ACTION, SNACK_STATUS } from '../../core/feedback/snackbar/snackbar.model.js'

import { updateByRouterFields } from '../../../services/firestore/shorts/shortsUpdateByRouter.js'
import { debugLog } from '../../../services/firestore/shorts/shortsDebug.utils.js'
import { SHORTS_DEBUG } from '../../../services/firestore/shorts/shortsDebug.config.js'

export function useDynamicUpdateAction({
  routerEntityType,
  snackEntityType,
  requireAnyUpdated = true,
  createIfMissing = false,
} = {}) {
  const { notify } = useSnackbar()

  // ✅ תומך גם בכמה פעולות במקביל
  const [pendingCount, setPendingCount] = useState(0)
  const pending = pendingCount > 0

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
    async ({ id, entityName, fieldsPatch, meta } = {}) => {
      if (!id) throw new Error('[useDynamicUpdateAction] missing id')
      if (!routerEntityType) throw new Error('[useDynamicUpdateAction] missing routerEntityType')
      if (!fieldsPatch || typeof fieldsPatch !== 'object') throw new Error('[useDynamicUpdateAction] fieldsPatch must be object')

      // ✅ meta overrides
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

      debugLog('UI_DYNAMIC_UPDATE_ACTION:start', {
        ...ctx,
        payload: SHORTS_DEBUG?.logPayload ? fieldsPatch : '[payload hidden]',
      })

      setPendingCount((n) => n + 1)
      try {
        const res = await updateByRouterFields({
          entityType: routerEntityType,
          id,
          fieldsPatch,
          createIfMissing: effectiveCreateIfMissing,
          requireAnyUpdated: effectiveRequireAnyUpdated,
        })

        setLastUpdatedAt(Date.now())

        debugLog('UI_DYNAMIC_UPDATE_ACTION:success', { ...ctx, res })

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

        debugLog('UI_DYNAMIC_UPDATE_ACTION:error', { ...ctx, err: String(err?.message || err) })

        notify({
          status: SNACK_STATUS.ERROR,
          action: SNACK_ACTION.UPDATE,
          entityType: snackEntityType,
          entityName,
          details,
          meta: { ...ctx, err: String(err?.message || err) },
          onRetry: async () => {
            await runUpdate({ id, entityName, fieldsPatch, meta })
          },
        })

        throw err
      } finally {
        setPendingCount((n) => Math.max(0, n - 1))
      }
    },
    [notify, routerEntityType, snackEntityType, requireAnyUpdated, createIfMissing]
  )

  return { runUpdate, pending, pendingCount, lastUpdatedAt, lastUpdatedLabel }
}
