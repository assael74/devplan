// src/features/videoHub/sharedUi/editDrawer/EditDrawer.js

import React, { useEffect, useMemo, useState, useCallback } from 'react'

import DrawerShell from '../../../../ui/patterns/drawer/DrawerShell.js'
import DrawerHeaderShell from '../../../../ui/patterns/drawer/DrawerHeaderShell.js'

import { useLifecycle } from '../../../../ui/domains/entityLifecycle/LifecycleProvider.js'
import { useVideoHubUpdate } from '../../hooks/useVideoHubUpdate.js'

import VideoEditDrawerBody from './VideoEditDrawerBody.js'
import VideoAttachDrawerBody from './VideoAttachDrawerBody.js'

import {
  VIDEO_EDIT_DRAWER_MODE,
  buildVideoEditInitialDraft,
  buildVideoEditPatch,
  getVideoEditIsDirty,
  getVideoEditIsValid,
  getAttachModes,
  getDrawerStatus,
  getDrawerSubline,
  getEntityKey,
  getIsAttachMode,
  getLifecycleEntityType,
  getRunEntityType,
  getSection,
  getTitleIconId,
  getTitlePrefix,
  getVideoTitle,
} from '../../logic/drawer/editDrawer.logic.js'

export default function EditDrawer({
  open,
  onClose,
  video,
  onSaved,
  onSave,
  context,

  mode = VIDEO_EDIT_DRAWER_MODE.GENERAL_EDIT,
  entityType = 'general',
  anchor = 'right',

  titleFallback = 'וידאו',

  locks = {},
  objectTypeOptions,
  contextTypeOptions,
}) {
  const isAttachMode = getIsAttachMode(mode)
  const runEntityType = getRunEntityType(mode, entityType)
  const entity = getEntityKey(mode, entityType)

  const initial = useMemo(() => {
    return buildVideoEditInitialDraft({ mode, video })
  }, [mode, video])

  const [draft, setDraft] = useState(initial)
  const [isSaving, setIsSaving] = useState(false)

  const lifecycle = useLifecycle()
  const { run, pending } = useVideoHubUpdate(video)

  useEffect(() => {
    if (!open) return

    setDraft(initial)
    setIsSaving(false)
  }, [open, initial])

  const isDirty = useMemo(() => {
    return getVideoEditIsDirty({ mode, draft, initial })
  }, [mode, draft, initial])

  const patch = useMemo(() => {
    return buildVideoEditPatch({ mode, draft, initial })
  }, [mode, draft, initial])

  const isValid = useMemo(() => {
    return getVideoEditIsValid({ mode, draft })
  }, [mode, draft])

  const saving = isSaving || pending
  const canSave = Boolean(initial?.id) && isDirty && isValid && !saving

  const attachModes = useMemo(() => {
    return getAttachModes(draft)
  }, [draft])

  const handleSave = useCallback(async () => {
    if (!canSave) return

    try {
      setIsSaving(true)

      if (typeof onSave === 'function') {
        await onSave({
          video: initial?.raw,
          draft,
          patch,
        })
      } else {
        await run(runEntityType, patch, {
          section: getSection(mode, entityType),
          videoId: initial?.id,
          createIfMissing: true,
        })
      }

      if (typeof onSaved === 'function') {
        onSaved(patch, { ...initial?.raw, ...patch })
      }

      onClose()
    } catch (error) {
      console.error('[VideoHub/EditDrawer] save failed:', error)
    } finally {
      setIsSaving(false)
    }
  }, [
    canSave,
    onSave,
    initial,
    draft,
    patch,
    run,
    runEntityType,
    mode,
    entityType,
    onSaved,
    onClose,
  ])

  const handleReset = useCallback(() => {
    if (saving) return
    setDraft(initial)
  }, [saving, initial])

  const handleDelete = useCallback(() => {
    if (!video?.id) return

    lifecycle.openLifecycle(
      {
        entityType: getLifecycleEntityType(mode, entityType),
        id: video.id,
        name: getVideoTitle(video),
      },
      {
        onAfterSuccess: ({ action, id }) => {
          if (action !== 'delete') return
          if (id !== video.id) return

          onClose?.()
        },
      }
    )
  }, [
    lifecycle,
    mode,
    entityType,
    video,
    onClose,
  ])

  const status = getDrawerStatus({
    isValid,
    saving,
    isDirty,
    mode,
  })

  return (
    <DrawerShell
      entity={entity}
      open={open}
      size="lg"
      anchor={anchor}
      onClose={onClose}
      saving={saving}
      isDirty={isDirty}
      canSave={canSave}
      actions={{
        onSave: handleSave,
        onReset: handleReset,
        onDelete: handleDelete,
      }}
      texts={{
        save: 'שמירה',
        saving: 'שומר...',
        cancel: 'ביטול',
      }}
      tooltips={{
        reset: 'איפוס טופס',
        delete: 'מחיקת וידאו',
      }}
      status={status}
      header={
        <DrawerHeaderShell
          entity={entity}
          title={`${getTitlePrefix(mode, entityType)}: "${getVideoTitle(video, titleFallback)}"`}
          subline={getDrawerSubline({ mode, entityType, draft })}
          titleIconId={getTitleIconId(mode, entityType)}
        />
      }
    >
      {isAttachMode ? (
        <VideoAttachDrawerBody
          draft={draft}
          setDraft={setDraft}
          context={context}
          locks={locks}
          disabled={attachModes.disabled}
          isMeetingMode={attachModes.isMeetingMode}
          isEntityMode={attachModes.isEntityMode}
          objectTypeOptions={objectTypeOptions}
          contextTypeOptions={contextTypeOptions}
        />
      ) : (
        <VideoEditDrawerBody
          draft={draft}
          setDraft={setDraft}
          disabled={saving}
          context={context}
          type={entityType === 'analysis' ? 'analysis' : 'general'}
        />
      )}
    </DrawerShell>
  )
}

export { VIDEO_EDIT_DRAWER_MODE }
