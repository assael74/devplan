// previewDomainCard/domains/team/games/components/newForm/NewFormDrawer.js

import React, { useEffect, useMemo, useState, useCallback } from 'react'
import { Box } from '@mui/joy'

import DrawerShell from '../../../../../../../../../../../ui/patterns/drawer/DrawerShell.js'
import DrawerHeaderShell from '../../../../../../../../../../../ui/patterns/drawer/DrawerHeaderShell.js'
import GameCreateFields from '../../../../../../../../../../../ui/forms/ui/games/GameCreateFields.js'

import useGameHubCreate from '../../../../../../../../../hooks/games/useGameHubCreate.js'

import {
  buildTeamGameCreateDraft,
  getTeamGameCreateFieldErrors,
  validateTeamGameCreateDraft,
  isTeamGameCreateDirty,
  buildTeamGameCreateMeta,
} from '../../../../../../../../../createLogic/index.js'

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
  const initial = useMemo(() => buildTeamGameCreateDraft(context), [context])
  const [draft, setDraft] = useState(initial)

  useEffect(() => {
    if (!open) return
    setDraft(initial)
  }, [open, initial])

  const fieldErrors = useMemo(() => getTeamGameCreateFieldErrors(draft), [draft])
  const validation = useMemo(() => validateTeamGameCreateDraft(draft), [draft])
  const meta = useMemo(() => buildTeamGameCreateMeta(draft, context), [draft, context])
  const isDirty = useMemo(() => isTeamGameCreateDirty(draft, initial), [draft, initial])

  const { saving, runCreateGame } = useGameHubCreate()

  const canSave = isDirty && validation?.ok && !saving

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
    ? { text: meta?.savingText || 'שומר משחק חדש...', color: 'primary' }
    : !isDirty
    ? { text: 'אין שינויים', color: 'neutral' }
    : !validation?.ok
    ? { text: validation?.message || 'יש להשלים את כל שדות החובה', color: 'warning' }
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
