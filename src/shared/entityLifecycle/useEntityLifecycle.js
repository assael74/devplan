// src/shared/entityLifecycle/useEntityLifecycle.js
import { useCallback, useMemo, useState } from 'react'
import { resolveDeletePolicy } from './resolveDeletePolicy.js'
import { buildLifecycleMessage } from './lifecycle.messages.js'

export function useEntityLifecycle({ deps, notify, onAfterSuccess } = {}) {
  const [archiveState, setArchiveState] = useState({ open: false, entity: null })
  const [restoreState, setRestoreState] = useState({ open: false, entity: null })
  const [lifecycleState, setLifecycleState] = useState({ open: false, entity: null, meta: null })

  const [archiveBusy, setArchiveBusy] = useState(false)
  const [restoreBusy, setRestoreBusy] = useState(false)
  const [lifecycleBusy, setLifecycleBusy] = useState(false)

  const safeAfterSuccess = useCallback(
    ({ action, entityType, id }) => {
      if (typeof onAfterSuccess !== 'function') return
      try {
        onAfterSuccess({ action, entityType, id })
      } catch (err) {
        console.warn('[useEntityLifecycle] onAfterSuccess failed', err)
      }
    },
    [onAfterSuccess]
  )

  const closeArchive = useCallback(() => {
    if (archiveBusy) return
    setArchiveBusy(false)
    setArchiveState({ open: false, entity: null })
  }, [archiveBusy])

  const closeRestore = useCallback(() => {
    if (restoreBusy) return
    setRestoreBusy(false)
    setRestoreState({ open: false, entity: null })
  }, [restoreBusy])

  const closeLifecycle = useCallback(() => {
    if (lifecycleBusy) return
    setLifecycleState({ open: false, entity: null, meta: null })
  }, [lifecycleBusy])

  const openArchive = useCallback((entity) => {
    setArchiveBusy(false)
    setArchiveState({ open: true, entity })
  }, [])

  const openRestore = useCallback((entity) => {
    setRestoreBusy(false)
    setRestoreState({ open: true, entity })
  }, [])

  const openLifecycle = useCallback(
    async (entity, meta) => {
      setLifecycleBusy(false)

      const metaIn = meta ?? null
      const hasGuard =
        typeof metaIn?.isDeletable === 'boolean' ||
        Number.isFinite(metaIn?.players) ||
        Number.isFinite(metaIn?.teams) ||
        metaIn?.forcePolicy === true

      const metaAuto = !hasGuard && deps?.getMeta ? await deps.getMeta(entity, metaIn) : null
      const resolvedMeta = { ...(metaIn || {}), ...(metaAuto || {}) }

      setLifecycleState({ open: true, entity, meta: resolvedMeta })
    },
    [deps]
  )

  const lifecyclePolicy = useMemo(() => {
    const e = lifecycleState.entity
    if (!e) return null
    return resolveDeletePolicy(e.entityType, lifecycleState.meta || {})
  }, [lifecycleState.entity, lifecycleState.meta])

  const emit = useCallback(
    ({ status, action, entityType, entityName, error }) => {
      if (!notify) return
      const message = buildLifecycleMessage({ status, action, entityType, entityName })
      notify({
        tone: status === 'success' ? 'success' : 'danger',
        message,
        action,
        entityType,
        entityName,
        error,
      })
    },
    [notify]
  )

  const confirmArchive = useCallback(async () => {
    const e = archiveState.entity
    if (!e?.id || !e?.entityType) return
    if (archiveBusy) return

    setArchiveBusy(true)
    try {
      if (!deps?.archive) throw new Error('Missing deps.archive')

      await deps.archive({ entityType: e.entityType, id: e.id })
      emit({ status: 'success', action: 'archive', entityType: e.entityType, entityName: e.name })

      safeAfterSuccess({ action: 'archive', entityType: e.entityType, id: e.id })
      setArchiveState({ open: false, entity: null })
    } catch (error) {
      emit({ status: 'error', action: 'archive', entityType: e.entityType, entityName: e.name, error })
    } finally {
      setArchiveBusy(false)
    }
  }, [archiveState.entity, archiveBusy, deps, emit, safeAfterSuccess])

  const confirmRestore = useCallback(async () => {
    const e = restoreState.entity
    if (!e?.id || !e?.entityType) return
    if (restoreBusy) return

    setRestoreBusy(true)
    try {
      if (!deps?.restore) throw new Error('Missing deps.restore')
      await deps.restore({ entityType: e.entityType, id: e.id })
      emit({ status: 'success', action: 'restore', entityType: e.entityType, entityName: e.name })

      safeAfterSuccess({ action: 'restore', entityType: e.entityType, id: e.id })
      setRestoreState({ open: false, entity: null })
    } catch (error) {
      emit({ status: 'error', action: 'restore', entityType: e.entityType, entityName: e.name, error })
    } finally {
      setRestoreBusy(false)
    }
  }, [restoreState.entity, restoreBusy, deps, emit, safeAfterSuccess])

  const confirmDeleteOrArchiveFromLifecycle = useCallback(async () => {
    const e = lifecycleState.entity
    if (!e?.id || !e?.entityType) return
    if (lifecycleBusy) return

    const policy = resolveDeletePolicy(e.entityType, lifecycleState.meta || {})
    const shouldDelete = !!policy?.canDelete

    setLifecycleBusy(true)
    try {
      if (shouldDelete) {
        if (!deps?.remove) throw new Error('Missing deps.remove')

        await deps.remove({ entityType: e.entityType, id: e.id })
        emit({ status: 'success', action: 'delete', entityType: e.entityType, entityName: e.name })

        safeAfterSuccess({ action: 'delete', entityType: e.entityType, id: e.id })
        setLifecycleState({ open: false, entity: null, meta: null })
        return
      }

      if (!deps?.archive) throw new Error('Missing deps.archive')

      await deps.archive({ entityType: e.entityType, id: e.id })
      emit({ status: 'success', action: 'archive', entityType: e.entityType, entityName: e.name })

      safeAfterSuccess({ action: 'archive', entityType: e.entityType, id: e.id })
      setLifecycleState({ open: false, entity: null, meta: null })
    } catch (error) {
      emit({
        status: 'error',
        action: shouldDelete ? 'delete' : 'archive',
        entityType: e.entityType,
        entityName: e.name,
        error,
      })
    } finally {
      setLifecycleBusy(false)
    }
  }, [lifecycleState.entity, lifecycleState.meta, lifecycleBusy, deps, emit, safeAfterSuccess])

  const archiveDialogProps = useMemo(() => {
    const e = archiveState.entity
    return {
      open: archiveState.open,
      entityType: e?.entityType || null,
      entityName: e?.name || '',
      busy: archiveBusy,
      onConfirm: confirmArchive,
      onClose: closeArchive,
    }
  }, [archiveState.open, archiveState.entity, archiveBusy, confirmArchive, closeArchive])

  const restoreDialogProps = useMemo(() => {
    const e = restoreState.entity
    return {
      open: restoreState.open,
      entityType: e?.entityType || null,
      entityName: e?.name || '',
      busy: restoreBusy,
      onConfirm: confirmRestore,
      onClose: closeRestore,
    }
  }, [restoreState.open, restoreState.entity, restoreBusy, confirmRestore, closeRestore])

  const lifecycleDialogProps = useMemo(() => {
    const e = lifecycleState.entity
    return {
      open: lifecycleState.open,
      entityType: e?.entityType || null,
      entityName: e?.name || '',
      policy: lifecyclePolicy,
      busy: lifecycleBusy,
      onDelete: confirmDeleteOrArchiveFromLifecycle,
      onArchive: confirmDeleteOrArchiveFromLifecycle,
      onClose: closeLifecycle,
    }
  }, [
    lifecycleState.open,
    lifecycleState.entity,
    lifecyclePolicy,
    lifecycleBusy,
    confirmDeleteOrArchiveFromLifecycle,
    closeLifecycle,
  ])

  return {
    openArchive,
    archiveDialogProps,

    openLifecycle,
    lifecycleDialogProps,

    openRestore,
    restoreDialogProps,

    closeArchive,
    closeRestore,
    closeLifecycle,
  }
}
