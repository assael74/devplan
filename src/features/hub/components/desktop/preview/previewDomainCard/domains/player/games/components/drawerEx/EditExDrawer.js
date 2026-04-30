// previewDomainCard/domains/player/games/components/drawerEx/EditExDrawer.js

import React, { useEffect, useMemo, useState, useCallback } from 'react'
import { Box, Accordion, AccordionDetails, AccordionSummary, AccordionGroup, Typography } from '@mui/joy'
import AddIcon from '@mui/icons-material/Add'

import playerImage from '../../../../../../../../../../../ui/core/images/playerImage.jpg'

import DrawerShell from '../../../../../../../../../../../ui/patterns/drawer/DrawerShell.js'
import DrawerHeaderShell from '../../../../../../../../../../../ui/patterns/drawer/DrawerHeaderShell.js'

import { useGameHubUpdate } from '../../../../../../../../../hooks/games/useGameHubUpdate.js'

import GameEntryFields from '../../../../../../../../../../../ui/forms/ui/games/GameEntryFields.js'
import GameCreateFields from '../../../../../../../../../../../ui/forms/ui/games/GameCreateFields.js'

import {
  buildExternalGameEditInitial,
  buildExternalGameEditFieldErrors,
  getIsExternalGameEditValid,
  isExternalGameEditDirty,
  buildExternalGameEditPatch,
  buildExternalGameEntryLimits,
} from '../../../../../../../../../editLogic/games/externalGames/index.js'

const layout = {
  topCols: { xs: '1fr', sm: '1fr 1fr' },
  mainCols: { xs: '1fr', sm: '1fr 1fr' },
  metaCols: { xs: '1fr', sm: 'repeat(3, minmax(0, 1fr))' },
  resultCols: { xs: '1fr', sm: 'repeat(3, minmax(0, 1fr))' },
}

export default function EditExDrawer({
  open,
  game,
  onClose,
  onSaved,
  context,
}) {
  const player = context?.player || {}
  const activeGame = game || null

  const initial = useMemo(() => buildExternalGameEditInitial(game, context), [game, context])
  const [draft, setDraft] = useState(initial)

  useEffect(() => {
    if (!open) return
    setDraft(initial)
  }, [open, initial])

  const { run, pending } = useGameHubUpdate(activeGame)

  const fieldErrors = useMemo(() => buildExternalGameEditFieldErrors(draft), [draft])
  const isValid = useMemo(() => getIsExternalGameEditValid(draft), [draft])
  const isDirty = useMemo(() => isExternalGameEditDirty(draft, initial), [draft, initial])

  const entryLimits = useMemo(() => buildExternalGameEntryLimits(draft), [draft])

  const canSave = !!draft?.gameId && isDirty && isValid && !pending

  const setField = useCallback((key, value) => {
    setDraft((prev) => ({ ...prev, [key]: value }))
  }, [])

  const handleReset = useCallback(() => {
    if (pending) return
    setDraft(initial)
  }, [initial, pending])

  const handleSave = useCallback(async () => {
    if (!canSave) return

    const patch = buildExternalGameEditPatch({ draft })

    await run('updateExternalGame', patch, {
      gameId: activeGame?.id,
      routerEntityType: 'externalGames',
      gameSource: 'external',
      isExternalGame: true,
      game: activeGame,
      createIfMissing: false,
    })

    onSaved(patch)
    onClose()
  }, [canSave, activeGame, draft, run, onSaved, onClose])

  const headerAvatar = player?.photo || playerImage
  const gameTitle = activeGame?.rivel || activeGame?.rival || 'משחק'
  const gameDate = activeGame?.gameDate || activeGame?.dateLabel || ''

  const status = !isDirty
    ? { text: 'אין שינויים', color: 'neutral' }
    : !isValid
    ? { text: 'יש להשלים נתונים תקינים', color: 'warning' }
    : { text: 'יש שינויים שלא נשמרו', color: 'danger' }

  return (
    <DrawerShell
      entity="private"
      open={open}
      onClose={onClose}
      saving={pending}
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
        reset: 'איפוס השינויים',
      }}
      status={status}
      header={
        <DrawerHeaderShell
          entity="player"
          title={player?.playerFullName || 'שחקן'}
          subline={`${gameTitle} - ${gameDate}`}
          titleIconId="games"
          avatar={headerAvatar}
        />
      }
    >
      <Box sx={{ display: 'grid', gap: 1 }}>
        <GameCreateFields
          draft={draft}
          onDraft={(nextDraft) => {
            const safeDraft =
              typeof nextDraft === 'function' ? nextDraft(draft) : nextDraft

            Object.entries(safeDraft || {}).forEach(([key, value]) => {
              setField(key, value)
            })
          }}
          context={{
            ...context,
            player,
            clubs: context?.clubs || [],
            teams: context?.teams || [],
          }}
          fieldErrors={fieldErrors}
          layout={layout}
          isPrivatePlayer
        />

        <AccordionGroup variant="plain" transition="0.2s">
          <Accordion defaultExpanded>
            <AccordionSummary indicator={<AddIcon />}>
              <Box sx={{ width: '100%', textAlign: 'center', display: 'flex', alignItems: 'center' }}>
                <Typography level="body-sm">עדכון השתתפות של</Typography>

                <Typography color="success" variant="soft" sx={{ borderRadius: 'sm', ml: 1, fontSize: 14 }}>
                  {player?.playerFullName}
                </Typography>
              </Box>
            </AccordionSummary>

            <AccordionDetails variant="soft">
              <GameEntryFields
                draft={draft}
                onFieldChange={setField}
                limits={entryLimits}
                pending={pending}
              />
            </AccordionDetails>
          </Accordion>
        </AccordionGroup>
      </Box>
    </DrawerShell>
  )
}
