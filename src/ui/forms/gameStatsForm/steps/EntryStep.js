// src/ui/forms/gameStatsForm/steps/EntryStep.js

import React from 'react'
import {
  Box,
  Divider,
  Sheet,
  Typography,
} from '@mui/joy'

import { entryStepSx as sx } from './sx/entryStep.sx.js'

import {
  buildEntryFields,
  buildEntryStepModel,
  buildResetActivePlayerPatch,
  buildRestoreActivePlayerPatch,
  buildSetActivePlayerPatch,
  buildUpdatePlayerStatsPatch,
  getVisibleParms,
} from '../logic/index.js'

import { EntryEmptyPlayersState } from './parts/EntryEmptyPlayersState.js'
import { EntryPlayerHeader } from './parts/EntryPlayerHeader.js'
import { EntryPlayerTabs } from './parts/EntryPlayerTabs.js'

import {
  RegularFieldsSection,
  TripletFieldsSection,
} from './parts/EntryFieldsSection.js'

// אחריות:
// Step מילוי הנתונים בטופס יצירת סטטיסטיקה.

export function EntryStep({ draft, savedDraft, onDraft }) {
  const selectedParmIds = Array.isArray(draft.selectedParmIds)
    ? draft.selectedParmIds
    : []

  const visibleParms = getVisibleParms(selectedParmIds)
  const fields = buildEntryFields(visibleParms)

  const model = buildEntryStepModel({
    draft,
    savedDraft,
    fields,
  })

  const setActivePlayer = playerId => {
    onDraft(buildSetActivePlayerPatch(playerId))
  }

  const resetActivePlayer = () => {
    if (!model.activePlayerId || model.locked) return

    onDraft(
      buildResetActivePlayerPatch({
        draft,
        playerId: model.activePlayerId,
      })
    )
  }

  const restoreActivePlayer = () => {
    if (!model.activePlayerId || !savedDraft || model.locked) return

    onDraft(
      buildRestoreActivePlayerPatch({
        draft,
        savedDraft,
        playerId: model.activePlayerId,
        savedRow: model.savedRow,
      })
    )
  }

  const updateRow = patch => {
    if (model.locked) return

    onDraft(
      buildUpdatePlayerStatsPatch({
        draft,
        playerId: model.activePlayerId,
        patch,
      })
    )
  }

  if (!model.selectedPlayerIds.length) {
    return <EntryEmptyPlayersState />
  }

  return (
    <Box sx={sx.stepContent}>
      <Box>
        <Typography level="title-sm">
          מילוי נתונים
        </Typography>

        <Typography level="body-sm" color="neutral">
          בחר שחקן פעיל ומלא רק את הפרמטרים שסומנו בשלב הקודם.
        </Typography>
      </Box>

      <EntryPlayerTabs
        players={model.players}
        selectedPlayerIds={model.selectedPlayerIds}
        activePlayerId={model.activePlayerId}
        onActivePlayer={setActivePlayer}
      />

      <Sheet variant="outlined" sx={sx.entryCard}>
        <EntryPlayerHeader
          activePlayer={model.activePlayer}
          progress={model.progress}
          onReset={resetActivePlayer}
          onRestore={restoreActivePlayer}
          canRestore={model.canRestore}
          locked={model.locked}
        />

        <RegularFieldsSection
          fields={model.regularFields}
          row={model.row}
          locked={model.locked}
          onUpdateRow={updateRow}
        />

        <Divider sx={{ mt: 1 }} />

        <TripletFieldsSection
          fields={model.tripletFields}
          row={model.row}
          locked={model.locked}
          onUpdateRow={updateRow}
        />
      </Sheet>
    </Box>
  )
}
