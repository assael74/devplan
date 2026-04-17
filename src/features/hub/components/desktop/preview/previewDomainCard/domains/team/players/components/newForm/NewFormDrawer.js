// previewDomainCard/domains/team/players/components/newForm/NewFormDrawer.js

import React, { useEffect, useMemo, useState, useCallback } from 'react'
import { Box } from '@mui/joy'

import DrawerShell from '../../../../../../../../../../../ui/patterns/drawer/DrawerShell.js'
import DrawerHeaderShell from '../../../../../../../../../../../ui/patterns/drawer/DrawerHeaderShell.js'
import PlayerCreateFields from '../../../../../../../../../../../ui/forms/ui/players/PlayerCreateFields.js'

import usePlayerHubCreate from '../../../../../../../../../hooks/players/usePlayerHubCreate.js'

import {
  buildInitialDraft,
  getValidity,
  getIsValid,
  getIsDirty,
} from './newFormDrawer.utils.js'

const layout = {
  topCols: { xs: '1fr', md: '1fr 1fr' },
  mainCols: { xs: '1fr', md: '1fr 1fr' },
  metaCols: { xs: '1fr', md: '1fr 1fr' },
}

export default function NewFormDrawer({
  open,
  onClose,
  onSaved,
  context,
}) {
  const initial = useMemo(() => buildInitialDraft(context), [context])
  const [draft, setDraft] = useState(initial)

  useEffect(() => {
    if (!open) return
    setDraft(initial)
  }, [open, initial])

  const validity = useMemo(() => getValidity(draft), [draft])
  const isValid = useMemo(() => getIsValid(validity), [validity])
  const isDirty = useMemo(() => getIsDirty(draft, initial), [draft, initial])

  const { saving, runCreatePlayer } = usePlayerHubCreate()
  const canSave = isDirty && isValid && !saving

  const handleSave = useCallback(async () => {
    if (!canSave || saving) return

    try {
      const created = await runCreatePlayer({ draft, context })
      onSaved(created || draft)
      onClose()
    } catch (error) {
      console.error('create player failed:', error)
    }
  }, [canSave, saving, runCreatePlayer, draft, context, onSaved, onClose])

  const handleReset = useCallback(() => {
    if (saving) return
    setDraft(initial)
  }, [saving, initial])

  const status = saving
    ? { text: 'שומר שחקן חדש...', color: 'primary' }
    : !isDirty
    ? { text: 'אין שינויים', color: 'neutral' }
    : !isValid
    ? { text: 'יש להשלים את כל שדות החובה', color: 'warning' }
    : { text: 'מוכן לשמירה', color: 'success' }

  return (
    <DrawerShell
      entity="player"
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
          title={
            [draft?.playerFirstName || '', draft?.playerLastName || '']
              .filter(Boolean)
              .join(' ') || 'שחקן חדש'
          }
          subline={context?.team?.teamName || 'יצירת שחקן'}
          titleIconId="players"
        />
      }
    >
      <Box className="dpScrollThin" sx={{ display: 'grid', gap: 1, minHeight: 0 }}>
        <PlayerCreateFields
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
