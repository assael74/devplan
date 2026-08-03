// src/features/hub/sharedProfile/videoEdit/VideoEditDrawer.js

import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'

import DrawerShell from '../../../../ui/patterns/drawer/DrawerShell.js'
import DrawerHeaderShell from '../../../../ui/patterns/drawer/DrawerHeaderShell.js'
import { useLifecycle } from '../../../../ui/domains/entityLifecycle/LifecycleProvider.js'

import { useVideoUpdate } from '../../hooks/videoAnalysis/useVideoUpdate.js'

import VideoAttachDrawerBody from './VideoAttachDrawerBody.js'
import VideoEditDrawerBody from './VideoEditDrawerBody.js'

import {
  VIDEO_EDIT_DRAWER_MODE,
  buildInitial,
  buildPatch,
  getAttachModes,
  getIsAttachMode,
  getIsDirty,
  getIsValid,
  getStatus,
  getSubline,
} from './videoEdit.logic.js'

export { VIDEO_EDIT_DRAWER_MODE }

export default function VideoEditDrawer({
  open,
  onClose,
  video,
  context,
  mode = VIDEO_EDIT_DRAWER_MODE.ANALYSIS_EDIT,
  anchor = 'right',
  titleFallback = 'וידאו',
  locks = {},
  objectTypeOptions,
  contextTypeOptions,
}) {
  const initial = useMemo(() => {
    return buildInitial({ mode, video })
  }, [mode, video])

  const [draft, setDraft] = useState(initial)
  const [isSaving, setIsSaving] = useState(false)

  const lifecycle = useLifecycle()
  const { run, pending } = useVideoUpdate(video)

  useEffect(() => {
    if (!open) return

    setDraft(initial)
    setIsSaving(false)
  }, [open, initial])

  const isAttachMode = getIsAttachMode(mode)

  const patch = useMemo(() => {
    return buildPatch({ mode, draft, initial })
  }, [mode, draft, initial])

  const isDirty = useMemo(() => {
    return getIsDirty({ mode, draft, initial })
  }, [mode, draft, initial])

  const isValid = useMemo(() => {
    return getIsValid({ mode, draft })
  }, [mode, draft])

  const saving = isSaving || pending
  const canSave = Boolean(initial?.id) && isDirty && isValid && !saving

  const attachModes = useMemo(() => {
    if (!isAttachMode) {
      return {
        disabled: {
          disableObjectType: false,
          disableMeeting: false,
          disablePlayer: false,
          disableTeam: false,
        },
        isMeetingMode: false,
        isEntityMode: false,
      }
    }

    return getAttachModes(draft)
  }, [isAttachMode, draft])

  const handleSave = useCallback(async () => {
    if (!canSave) return

    try {
      setIsSaving(true)

      await run('analysis', patch, {
        section: isAttachMode
          ? 'videoAttachDrawer'
          : 'videoEditDrawer',
        videoId: initial?.id,
        createIfMissing: true,
      })

      onClose()
    } catch (error) {
      console.error('[Hub/VideoEditDrawer] save failed:', error)
    } finally {
      setIsSaving(false)
    }
  }, [
    canSave,
    run,
    patch,
    isAttachMode,
    initial?.id,
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
        entityType: 'videoAnalysis',
        id: video.id,
        name: video?.name || video?.title || titleFallback,
      },
      {
        onAfterSuccess: ({ action, id }) => {
          if (action !== 'delete') return
          if (id !== video.id) return

          onClose()
        },
      }
    )
  }, [
    lifecycle,
    video,
    titleFallback,
    onClose,
  ])

  return (
    <DrawerShell
      entity="videoAnalysis"
      open={open}
      size="md"
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
      status={getStatus({
        isValid,
        saving,
        isDirty,
        mode,
      })}
      header={
        <DrawerHeaderShell
          entity="videoAnalysis"
          title={`${isAttachMode ? 'שיוך וידאו' : 'עריכת ניתוח וידאו'}: "${video?.name || video?.title || titleFallback}"`}
          subline={getSubline({ mode, draft })}
          titleIconId={isAttachMode ? 'link' : 'videoAnalysis'}
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
          type="analysis"
        />
      )}
    </DrawerShell>
  )
}
