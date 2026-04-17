// previewDomainCard/domains/player/meetings/components/newForm/NewFormDrawer.js

import React, { useEffect, useMemo, useState, useCallback } from 'react'
import { Box } from '@mui/joy'

import DrawerShell from '../../../../../../../../../../../ui/patterns/drawer/DrawerShell.js'
import DrawerHeaderShell from '../../../../../../../../../../../ui/patterns/drawer/DrawerHeaderShell.js'
import MeetingCreateFields from '../../../../../../../../../../../ui/forms/ui/meetings/MeetingCreateFields.js'

import useMeetingHubCreate from '../../../../../../../../../hooks/meetings/useMeetingHubCreate.js'

import {
  buildInitialDraft,
  getValidity,
  getIsValid,
  getIsDirty,
} from './newFormDrawer.utils.js'

const layout = {
  topCols: { xs: '1fr', md: '1fr 1fr' },
  mainCols: { xs: '1fr', md: '1fr 1fr' },
  metaCols: { xs: '1fr', md: '1fr' },
}

export default function NewFormDrawer({
  open,
  onClose,
  onSaved,
  context,
}) {
  const player = context?.player || context?.entity || null
  const initial = useMemo(() => buildInitialDraft(context), [context])

  const [draft, setDraft] = useState(initial)

  useEffect(() => {
    if (!open) return
    setDraft(initial)
  }, [open, initial])

  const validity = useMemo(() => getValidity(draft), [draft])
  const isValid = useMemo(() => getIsValid(validity), [validity])
  const isDirty = useMemo(() => getIsDirty(draft, initial), [draft, initial])

  const { saving, runCreateMeeting } = useMeetingHubCreate()
  const canSave = isDirty && isValid && !saving

  const handleSave = useCallback(async () => {
    if (!canSave || saving) return

    try {
      const res = await runCreateMeeting({ draft, context })
      onSaved?.(res || draft)
      onClose?.()
    } catch (error) {
      console.error('create meeting failed:', error)
    }
  }, [canSave, saving, runCreateMeeting, draft, context, onSaved, onClose])

  const handleReset = useCallback(() => {
    if (saving) return
    setDraft(initial)
  }, [saving, initial])

  const status = saving
    ? { text: 'שומר פגישה חדשה...', color: 'primary' }
    : !isDirty
    ? { text: 'אין שינויים', color: 'neutral' }
    : !isValid
    ? { text: 'יש להשלים את כל שדות החובה', color: 'warning' }
    : { text: 'מוכן לשמירה', color: 'success' }

  return (
    <DrawerShell
      entity="meeting"
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
        save: 'שמירה',
        saving: 'שומר...',
        cancel: 'ביטול',
      }}
      tooltips={{
        reset: 'איפוס טופס',
      }}
      status={status}
      header={
        <DrawerHeaderShell
          entity="player"
          title={player?.playerFullName || 'שחקן'}
          subline={draft?.type || 'פגישה חדשה'}
          titleIconId="meetings"
        />
      }
    >
      <Box className="dpScrollThin" sx={{ display: 'grid', gap: 1, minHeight: 0 }}>
        <MeetingCreateFields
          draft={draft}
          onDraft={setDraft}
          context={context}
          validity={validity}
          layout={layout}
        />
      </Box>
    </DrawerShell>
  )
}
