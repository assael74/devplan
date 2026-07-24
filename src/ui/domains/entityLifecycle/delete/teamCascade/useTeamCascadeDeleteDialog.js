// src/ui/domains/entityLifecycle/delete/teamCascade/useTeamCascadeDeleteDialog.js

import { useCallback, useMemo, useState } from 'react'

import {
  executeTeamCascadeDelete,
  prepareTeamCascadeDeletePlan,
} from '../../../../../application/index.js'

export function useTeamCascadeDeleteDialog({
  shorts,
  notify,
  onAfterSuccess,
} = {}) {
  const [state, setState] = useState({
    open: false,
    entity: null,
    plan: null,
  })

  const [busy, setBusy] = useState(false)

  const openTeamCascadeDelete = useCallback(
    entity => {
      if (!entity?.id) return

      const plan = prepareTeamCascadeDeletePlan({
        entity,
        shorts,
      })

      setBusy(false)
      setState({
        open: true,
        entity,
        plan,
      })
    },
    [shorts]
  )

  const closeTeamCascadeDelete = useCallback(() => {
    if (busy) return
    setState({ open: false, entity: null, plan: null })
  }, [busy])

  const confirmTeamCascadeDelete = useCallback(async () => {
    const plan = state.plan
    const entity = state.entity

    if (!plan?.teamId || busy) return

    setBusy(true)

    try {
      const res = await executeTeamCascadeDelete({ plan })

      notify?.({
        status: 'success',
        action: 'delete',
        entityType: 'team',
        entityName: entity?.name || plan?.teamSnapshot?.name || '',
        message: `קבוצה נמחקה במחיקה מלאה: ${plan?.teamSnapshot?.name || ''}`,
        meta: {
          cascade: true,
          result: res,
        },
      })

      onAfterSuccess?.({
        action: 'delete',
        entityType: 'team',
        id: plan.teamId,
        cascade: true,
        result: res,
      })

      setState({ open: false, entity: null, plan: null })
    } catch (error) {
      notify?.({
        status: 'error',
        action: 'delete',
        entityType: 'team',
        entityName: entity?.name || plan?.teamSnapshot?.name || '',
        message: 'שגיאה במחיקה מלאה של קבוצה',
        details: error?.message || null,
        meta: {
          cascade: true,
          error,
        },
      })
    } finally {
      setBusy(false)
    }
  }, [state.plan, state.entity, busy, notify, onAfterSuccess])

  const dialogProps = useMemo(
    () => ({
      open: state.open,
      plan: state.plan,
      busy,
      onClose: closeTeamCascadeDelete,
      onConfirm: confirmTeamCascadeDelete,
    }),
    [state.open, state.plan, busy, closeTeamCascadeDelete, confirmTeamCascadeDelete]
  )

  return {
    openTeamCascadeDelete,
    closeTeamCascadeDelete,
    teamCascadeDeleteDialogProps: dialogProps,
  }
}
