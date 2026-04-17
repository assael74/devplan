// previewDomainCard/domains/player/games/components/newExForm/NewExFormDrawer.js

import React, { useEffect, useMemo, useState, useCallback } from 'react'
import {
  Accordion,
  AccordionDetails,
  AccordionGroup,
  AccordionSummary,
  Box,
  Typography,
} from '@mui/joy'
import AddIcon from '@mui/icons-material/Add'

import DrawerShell from '../../../../../../../../../../../ui/patterns/drawer/DrawerShell.js'
import DrawerHeaderShell from '../../../../../../../../../../../ui/patterns/drawer/DrawerHeaderShell.js'
import GameCreateFields from '../../../../../../../../../../../ui/forms/ui/games/GameCreateFields.js'
import GameEntryFields from '../../../../../../../../../../../ui/forms/ui/games/GameEntryFields.js'

import useGameHubCreate from '../../../../../../../../../hooks/games/useGameHubCreate.js'

import {
  buildInitialExDraft,
  buildExternalGameEntryLimits,
  getExFieldErrors,
  getExValidity,
  getIsExDirty,
  normalizeExDraftBeforeSave,
} from './newExFormDrawer.utils.js'

const layout = {
  topCols: { xs: '1fr', sm: '1fr 1fr' },
  mainCols: { xs: '1fr', sm: '1fr 1fr' },
  metaCols: { xs: '1fr', sm: 'repeat(3, minmax(0, 1fr))' },
  resultCols: { xs: '1fr', sm: 'repeat(3, minmax(0, 1fr))' },
}

const sx = {
  playerHeader: {
    width: '100%',
    textAlign: 'center',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 1,
    flexWrap: 'wrap',
  },
  playerChip: {
    borderRadius: 'sm',
    fontSize: 14,
    px: 1,
    py: 0.25,
  },
}

export default function NewExFormDrawer({
  open,
  onClose,
  onSaved,
  context,
}) {
  const player = context?.player || context?.entity || null

  const initial = useMemo(() => buildInitialExDraft(context), [context])
  const [draft, setDraft] = useState(initial)

  const { saving, runCreateGame } = useGameHubCreate()

  useEffect(() => {
    if (!open) return
    setDraft(buildInitialExDraft(context))
  }, [open, context])

  const validity = useMemo(() => getExValidity(draft), [draft])
  const fieldErrors = useMemo(() => getExFieldErrors(draft), [draft])
  const entryLimits = useMemo(() => buildExternalGameEntryLimits(draft), [draft])
  const isDirty = useMemo(() => getIsExDirty(draft, initial), [draft, initial])

  const canSave = isDirty && validity?.ok && !saving

  const isPrivatePlayer = player?.isPrivatePlayer === true

  const setField = useCallback((key, value) => {
    setDraft((prev) => ({
      ...prev,
      [key]: value,
    }))
  }, [])

  const handleReset = useCallback(() => {
    if (saving) return
    setDraft(initial)
  }, [saving, initial])

  const handleSave = useCallback(async () => {
    if (!canSave) return

    const normalizedDraft = normalizeExDraftBeforeSave(draft)

    const payload = {
      ...normalizedDraft,
      playerId: normalizedDraft?.playerId || player?.id || null,
      teamId: normalizedDraft?.teamId || context?.teamId || player?.teamId || '',
      clubId: normalizedDraft?.clubId || context?.clubId || player?.clubId || '',
      gameSource: 'external',
      isExternalGame: true,
      playerSource: 'private',
    }

    const created = await runCreateGame({
      draft: payload,
      context: {
        ...context,
        player,
        playerId: payload.playerId,
        teamId: payload.teamId,
        clubId: payload.clubId,
        gameSource: 'external',
        isExternalGame: true,
        playerSource: 'private',
      },
    })

    onSaved(created)
    onClose()
  }, [canSave, draft, runCreateGame, context, player, onSaved, onClose])

  const gameTitle = draft?.rivel || 'משחק חיצוני חדש'

  const status = !isDirty
    ? { text: 'אין שינויים', color: 'neutral' }
    : !validity?.ok
    ? { text: validity?.message || 'יש להשלים נתונים תקינים', color: 'warning' }
    : saving
    ? { text: 'יוצר משחק חיצוני חדש...', color: 'primary' }
    : { text: 'מוכן ליצירה', color: 'success' }

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
        save: 'יצירת משחק',
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
          subline={gameTitle}
          titleIconId="games"
        />
      }
    >
      <Box className="dpScrollThin" sx={{ display: 'grid', gap: 1, minHeight: 0 }}>
        <GameCreateFields
          draft={draft}
          onDraft={setDraft}
          context={{
            ...context,
            player,
            clubs: context?.clubs || [],
            teams: context?.teams || [],
          }}
          fieldErrors={fieldErrors}
          layout={layout}
          isPrivatePlayer={isPrivatePlayer}
        />

        <AccordionGroup variant="plain" transition="0.2s">
          <Accordion defaultExpanded>
            <AccordionSummary indicator={<AddIcon />}>
              <Box sx={sx.playerHeader}>
                <Typography level="body-sm">פרטי ההשתתפות של</Typography>

                <Typography color="success" variant="soft" sx={sx.playerChip}>
                  {player?.playerFullName || 'שחקן'}
                </Typography>
              </Box>
            </AccordionSummary>

            <AccordionDetails variant="soft">
              <GameEntryFields
                draft={draft}
                onFieldChange={setField}
                limits={entryLimits}
                pending={saving}
                labels={{
                  goalUpdatesNotice: '',
                  goalsLockedText: 'הקבוצה לא כבשה',
                  assistsLockedText: 'הקבוצה לא כבשה',
                }}
              />
            </AccordionDetails>
          </Accordion>
        </AccordionGroup>
      </Box>
    </DrawerShell>
  )
}
