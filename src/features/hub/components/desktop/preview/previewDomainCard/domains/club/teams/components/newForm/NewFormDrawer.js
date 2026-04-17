// previewDomainCard/domains/club/teams/components/newForm/NewFormDrawer.js

import React, { useEffect, useMemo, useState, useCallback } from 'react'
import { Box } from '@mui/joy'

import DrawerShell from '../../../../../../../../../../../ui/patterns/drawer/DrawerShell.js'
import DrawerHeaderShell from '../../../../../../../../../../../ui/patterns/drawer/DrawerHeaderShell.js'
import TeamCreateFields from '../../../../../../../../../../../ui/forms/ui/teams/TeamCreateFields.js'

import useTeamHubCreate from '../../../../../../../../../hooks/teams/useTeamHubCreate.js'

import {
  buildInitialDraft,
  getValidity,
  getIsValid,
  getIsDirty,
} from './newFormDrawer.utils.js'

const layout = {
  topCols: { xs: '1fr', md: '1fr 1fr' },
  metaCols: { xs: '1fr', md: '1fr' },
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

  const validity = useMemo(() => getValidity(draft, context), [draft, context])
  const isValid = useMemo(() => getIsValid(validity), [validity])
  const isDirty = useMemo(() => getIsDirty(draft, initial), [draft, initial])

  const { saving, runCreateTeam } = useTeamHubCreate()
  const canSave = isDirty && isValid && !saving

  const handleSave = useCallback(async () => {
    if (!canSave || saving) return

    try {
      const res = await runCreateTeam({ draft, context })
      onSaved(res || draft)
      onClose()
    } catch (error) {
      console.error('create team failed:', error)
    }
  }, [canSave, saving, runCreateTeam, draft, context, onSaved, onClose])

  const handleReset = useCallback(() => {
    if (saving) return
    setDraft(initial)
  }, [saving, initial])

  const status = saving
    ? { text: 'שומר קבוצה חדשה...', color: 'primary' }
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
          title={draft?.teamName || 'קבוצה חדשה'}
          subline={context?.club?.clubName || context?.club?.name || 'יצירת קבוצה'}
          titleIconId="teams"
        />
      }
    >
      <Box className="dpScrollThin" sx={{ display: 'grid', gap: 1, minHeight: 0 }}>
        <TeamCreateFields
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
