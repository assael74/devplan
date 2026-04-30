// previewDomainCard/domains/team/videos/components/newForm/NewFormDrawer.js

import React, { useEffect, useMemo, useState, useCallback } from 'react'
import { Box } from '@mui/joy'

import DrawerShell from '../../../../../../../../../../../ui/patterns/drawer/DrawerShell.js'
import DrawerHeaderShell from '../../../../../../../../../../../ui/patterns/drawer/DrawerHeaderShell.js'
import VideoAnalysisCreateFields from '../../../../../../../../../../../ui/forms/ui/videoAnalysis/VideoAnalysisCreateFields.js'

import useVideoAnalysisHubCreate from '../../../../../../../../../hooks/videoAnalysis/useVideoAnalysisHubCreate.js'

import {
  buildTeamVideoCreateDraft,
  buildVideoAnalysisFieldConfig,
  getVideoCreateValidity,
  validateVideoCreateDraft,
  isVideoCreateDirty,
  buildVideoCreateMeta,
} from '../../../../../../../../../createLogic/index.js'

const layout = {
  topCols: { xs: '1fr', md: '1fr 1fr' },
  mainCols: { xs: '1fr', md: '1fr 1fr' },
  metaCols: { xs: '1fr', md: '1fr 1fr 1fr' },
  timeCols: { xs: '1fr 1fr', md: '1fr 1fr' },
}

export default function NewFormDrawer({
  open,
  onClose,
  onSaved,
  context,
}) {
  const initial = useMemo(() => buildTeamVideoCreateDraft(context), [context])
  const [draft, setDraft] = useState(initial)

  useEffect(() => {
    if (!open) return
    setDraft(initial)
  }, [open, initial])

  const validity = useMemo(() => getVideoCreateValidity(draft), [draft])
  const validation = useMemo(() => validateVideoCreateDraft(draft), [draft])
  const meta = useMemo(() => buildVideoCreateMeta(draft, context), [draft, context])
  const isDirty = useMemo(() => isVideoCreateDirty(draft, initial), [draft, initial])

  const {
    locks,
    visible,
    disabled,
    isMeetingMode,
    isEntityMode,
    objectTypeOptions,
    contextTypeOptions,
  } = useMemo(() => buildVideoAnalysisFieldConfig(draft, context), [draft, context])

  const { saving, runCreateVideoAnalysis } = useVideoAnalysisHubCreate()

  const canSave = isDirty && validation?.ok && !saving

  const handleSave = useCallback(async () => {
    if (!canSave || saving) return

    try {
      const created = await runCreateVideoAnalysis({ draft, context })
      onSaved?.(created || draft)
      onClose?.()
    } catch (error) {
      console.error('create videoAnalysis failed:', error)
    }
  }, [canSave, saving, runCreateVideoAnalysis, draft, context, onSaved, onClose])

  const handleReset = useCallback(() => {
    if (saving) return
    setDraft(initial)
  }, [saving, initial])

  const status = saving
    ? { text: meta?.savingText || 'שומר וידאו חדש...', color: 'primary' }
    : !isDirty
    ? { text: 'אין שינויים', color: 'neutral' }
    : !validation?.ok
    ? { text: validation?.message || 'יש להשלים את כל שדות החובה', color: 'warning' }
    : { text: 'מוכן לשמירה', color: 'success' }

  return (
    <DrawerShell
      entity="videoAnalysis"
      open={open}
      onClose={onClose}
      saving={saving}
      isDirty={isDirty}
      canSave={canSave}
      actions={{
        onSave: handleSave,
        onReset: handleReset,
      }}
      texts={{
        save: meta?.saveText || 'שמירה',
        saving: meta?.savingText || 'שומר...',
        cancel: 'ביטול',
      }}
      tooltips={{
        reset: 'איפוס טופס',
      }}
      status={status}
      header={
        <DrawerHeaderShell
          entity="team"
          title={draft?.name || 'וידאו חדש'}
          subline={context?.team?.teamName || 'וידאו אנליזה לקבוצה'}
          titleIconId="video"
        />
      }
    >
      <Box className="dpScrollThin" sx={{ display: 'grid', gap: 1, minHeight: 0 }}>
        <VideoAnalysisCreateFields
          draft={draft}
          onDraft={setDraft}
          context={context}
          layout={layout}
          validity={validity}
          locks={locks}
          visible={visible}
          disabled={disabled}
          isMeetingMode={isMeetingMode}
          isEntityMode={isEntityMode}
          objectTypeOptions={objectTypeOptions}
          contextTypeOptions={contextTypeOptions}
        />
      </Box>
    </DrawerShell>
  )
}
