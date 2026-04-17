// previewDomainCard/domains/team/games/components/newForm/NewFormDrawer.js

import React, { useEffect, useMemo, useState, useCallback } from 'react'
import { Box } from '@mui/joy'

import DrawerShell from '../../../../../../../../../../../ui/patterns/drawer/DrawerShell.js'
import DrawerHeaderShell from '../../../../../../../../../../../ui/patterns/drawer/DrawerHeaderShell.js'
import GameCreateFields from '../../../../../../../../../../../ui/forms/ui/games/GameCreateFields.js'

import useGameHubCreate from '../../../../../../../../../hooks/games/useGameHubCreate.js'

import {
  buildInitialDraft,
  getFieldErrors,
  getIsDirty,
  getIsValid,
} from './newFormDrawer.utils.js'

const layout = {
  topCols: { xs: '1fr 1fr', md: '1fr 1fr' },
  mainCols: { xs: '1fr', md: '1fr 1fr' },
  metaCols: { xs: '1fr', md: '1fr 1fr 1fr' },
  resultCols: { xs: '1fr 1fr', md: '1fr 1fr auto' },
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

  const fieldErrors = useMemo(() => getFieldErrors(draft), [draft])
  const isValid = useMemo(() => getIsValid(draft), [draft])
  const isDirty = useMemo(() => getIsDirty(draft, initial), [draft, initial])

  const { saving, runCreateGame } = useGameHubCreate()
  const canSave = isDirty && isValid && !saving

  const handleSave = useCallback(async () => {
    if (!canSave || saving) return

    try {
      const created = await runCreateGame({ draft, context })
      onSaved?.(created || draft)
      onClose?.()
    } catch (error) {
      console.error('create game failed:', error)
    }
  }, [canSave, saving, runCreateGame, draft, context, onSaved, onClose])

  const handleReset = useCallback(() => {
    if (saving) return
    setDraft(initial)
  }, [saving, initial])

  const status = saving
    ? { text: 'שומר משחק חדש...', color: 'primary' }
    : !isDirty
    ? { text: 'אין שינויים', color: 'neutral' }
    : !isValid
    ? { text: 'יש להשלים את כל שדות החובה', color: 'warning' }
    : { text: 'מוכן לשמירה', color: 'success' }

  return (
    <DrawerShell
      entity="team"
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
          entity="team"
          title={draft?.rivel || 'משחק חדש'}
          subline={context?.team?.teamName || 'יצירת משחק'}
          titleIconId="games"
        />
      }
    >
      <Box className="dpScrollThin" sx={{ display: 'grid', gap: 1, minHeight: 0 }}>
        <GameCreateFields
          draft={draft}
          onDraft={setDraft}
          context={context}
          fieldErrors={fieldErrors}
          layout={layout}
        />
      </Box>
    </DrawerShell>
  )
}
