// previewDomainCard/domains/player/games/components/newForm/NewFormDrawer.js

import React, { useEffect, useMemo, useState, useCallback } from 'react'
import { Box, Typography } from '@mui/joy'

import DrawerShell from '../../../../../../../../../../ui/patterns/drawer/DrawerShell.js'
import DrawerHeaderShell from '../../../../../../../../../../ui/patterns/drawer/DrawerHeaderShell.js'
import GameSelectField from '../../../../../../../../../../ui/fields/selectUi/games/GameSelectField.js'
import GameEntryFields from '../../../../../../../../../../ui/forms/ui/games/GameEntryFields.js'

import { useGameHubUpdate } from '../../../../../../../../hooks/games/useGameHubUpdate.js'

import {
  buildInitialDraft,
  getIsDirty,
  getIsValid,
  buildPlayerListPatch,
  getGameStatsLimits,
} from './newFormDrawer.utils.js'

export default function NewFormDrawer({
  open,
  onClose,
  onSaved,
  context,
}) {
  const player = context?.player || context?.entity || null

  const initial = useMemo(() => buildInitialDraft(context), [context])
  const [draft, setDraft] = useState(initial)
  const [pending, setPending] = useState(false)

  const activeGame = useMemo(() => {
    const games = Array.isArray(player?.teamGames) ? player.teamGames : []
    return games.find((g) => String(g?.id) === String(draft?.gameId)) || null
  }, [player?.teamGames, draft?.gameId])

  const limits = useMemo(() => {
    return getGameStatsLimits({
      player,
      gameId: draft?.gameId,
      playerId: draft?.playerId,
      draft,
    })
  }, [player, draft])

  const { run } = useGameHubUpdate(activeGame)

  useEffect(() => {
    if (!open) return
    setDraft(buildInitialDraft(context))
  }, [open, context])

  const isDirty = useMemo(() => getIsDirty(draft, initial), [draft, initial])
  const isValid = useMemo(() => getIsValid(draft), [draft])
  const canSave = isDirty && isValid && !pending
  const isGameChosen = !!draft?.gameId

  const setField = useCallback((key, value) => {
    setDraft((prev) => ({ ...prev, [key]: value }))
  }, [])

  const handleReset = useCallback(() => {
    if (pending) return
    setDraft(initial)
  }, [initial, pending])

  const handleSave = useCallback(async () => {
    if (!canSave) return

    try {
      setPending(true)

      const patch = buildPlayerListPatch({
        game: activeGame,
        draft,
      })

      await run('updateGamePlayers', patch, {
        gameId: activeGame?.id,
        createIfMissing: true,
      })

      onSaved(patch)
      onClose()
    } finally {
      setPending(false)
    }
  }, [canSave, activeGame, draft, run, onSaved, onClose])

  const status = !isDirty
    ? { text: 'אין שינויים', color: 'neutral' }
    : !draft?.gameId
    ? { text: 'יש לבחור משחק', color: 'warning' }
    : !isValid
    ? { text: 'יש להשלים נתונים תקינים', color: 'warning' }
    : pending
    ? { text: 'שומר שיוך שחקן למשחק...', color: 'primary' }
    : { text: 'מוכן לשמירה', color: 'success' }

  return (
    <DrawerShell
      entity="player"
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
        reset: 'איפוס טופס',
      }}
      status={status}
      header={
        <DrawerHeaderShell
          entity="player"
          title={player?.playerFullName || 'שחקן'}
          subline={
            activeGame?.rivel || activeGame?.rival || 'שיוך שחקן למשחק'
          }
          titleIconId="games"
        />
      }
    >
      <Box className="dpScrollThin" sx={{ display: 'grid', gap: 1, minHeight: 0 }}>
        <GameSelectField
          value={draft?.gameId || ''}
          onChange={(nextGameId) => setField('gameId', nextGameId)}
          player={player}
          disabled={pending}
          label="בחירת משחק"
          size="md"
          placeholder="בחר משחק לשיוך השחקן"
        />

        <Typography
          level="body-xs"
          color={isGameChosen ? 'success' : 'warning'}
          sx={{ px: 0.25 }}
        >
          {isGameChosen
            ? 'המשחק נבחר, ניתן לעדכן נתוני שחקן למשחק'
            : 'יש לבחור משחק לפני עדכון שאר השדות'}
        </Typography>

        <GameEntryFields
          draft={draft}
          onFieldChange={setField}
          limits={limits}
          pending={pending}
        />
      </Box>
    </DrawerShell>
  )
}
