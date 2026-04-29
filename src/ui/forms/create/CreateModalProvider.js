// ui/forms/create/CreateModalProvider.js

import React, { useMemo, useCallback } from 'react'
import ObjectCreateModal from './ObjectCreateModal'
import { useCreateModalState } from './useCreateModal'
import { useCoreData } from '../../../features/coreData/CoreDataProvider'
import { createActions } from './createActions'
import { getCreateMeta } from './createRegistry'

import { useSnackbar } from '../../core/feedback/snackbar/SnackbarProvider'
import { SNACK_ACTION, SNACK_STATUS } from '../../core/feedback/snackbar/snackbar.model'
import { mapFirestoreErrorToDetails } from '../../core/feedback/snackbar/snackbar.format'

const Ctx = React.createContext(null)

export function useCreateModal() {
  const v = React.useContext(Ctx)
  if (!v) throw new Error('useCreateModal must be used within CreateModalProvider')
  return v
}

const resolveEntityName = (type, draft) => {
  const d = draft || {}
  if (type === 'player') {
    const full = `${d.playerFirstName || ''} ${d.playerLastName || ''}`.trim()
    return full || null
  }
  if (type === 'team') return d.teamName || null
  if (type === 'club') return d.clubName || null
  return d.name || d.title || null
}

export default function CreateModalProvider({ children }) {
  const st = useCreateModalState()
  const core = useCoreData()
  const { notify } = useSnackbar()

  const defaultContext = useMemo(
    () => ({
      clubs: core.clubs || [],
      teams: core.teams || [],
      players: core.players || [],
      meetings: core.meetings || [],
      tags: core.tags || [],
      roles: core.roles || [],
    }),
    [core.clubs, core.teams, core.players, core.meetings, core.tags, core.roles]
  )

  const openCreate = useCallback(
    (type, draftSeed = {}, ctxOverride = {}, options = {}) => {
      const ctx = { ...defaultContext, ...(ctxOverride || {}) }
      const meta = getCreateMeta(type)

      st.openCreate(type, draftSeed, ctx, {
        size: options.size || meta.size || 'sm',
      })
    },
    [st, defaultContext]
  )

  const closeCreate = useCallback(() => {
    st.requestClose()
  }, [st])

  const handleConfirm = useCallback(async () => {
    const type = st.type
    const action = createActions[type]
    const entityName = resolveEntityName(type, st.draft)

    try {
      if (!action) throw new Error(`No create action for type "${type}"`)

      st.setBusy(true)

      await action({
        draft: st.draft,
        context: st.context,
      })

      notify({
        status: SNACK_STATUS.SUCCESS,
        action: SNACK_ACTION.CREATE,
        entityType: type,
        entityName,
      })

      st.requestClose()
    } catch (e) {
      notify({
        status: SNACK_STATUS.ERROR,
        action: SNACK_ACTION.CREATE,
        entityType: type,
        entityName,
        details: mapFirestoreErrorToDetails(e),
      })

      console.error('[CreateModal]', e)
    } finally {
      st.setBusy(false)
    }
  }, [st, notify])

  const sharedProps = {
    open: st.open,
    type: st.type,
    draft: st.draft,
    onDraft: st.setDraft,
    onValidChange: st.setIsValid,
    isValid: st.isValid,
    isDirty: st.isDirty,
    onConfirm: handleConfirm,
    onReset: st.reset,
    onClose: st.requestClose,
    context: { ...defaultContext, ...(st.context || {}) },
    busy: st.busy,
    size: st.size,
  }

  return (
    <Ctx.Provider value={{ openCreate, closeCreate }}>
      {children}
      <ObjectCreateModal {...sharedProps} />
    </Ctx.Provider>
  )
}
