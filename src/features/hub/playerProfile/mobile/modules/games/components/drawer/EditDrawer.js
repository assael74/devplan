// previewDomainCard/domains/player/games/components/drawer/EditDrawer.js

import React, { useEffect, useMemo, useState, useCallback } from 'react'

import { getFullDateIl } from '../../../../../../../../../../../shared/format/dateUtiles.js'
import playerImage from '../../../../../../../../../../../ui/core/images/playerImage.jpg'

import DrawerShell from '../../../../../../../../../../../ui/patterns/drawer/DrawerShell.js'
import DrawerHeaderShell from '../../../../../../../../../../../ui/patterns/drawer/DrawerHeaderShell.js'

import { useGameHubUpdate } from '../../../../../../../../../hooks/games/useGameHubUpdate.js'

import GameEntryFields from '../../../../../../../../../../../ui/forms/ui/games/GameEntryFields.js'

import {
  buildInitialDraft,
  buildUpdateGamePlayersPatch,
  buildRemovePlayerFromGamePatch,
  getGameStatsLimits,
  getIsDirty,
} from './editDrawer.utils.js'

export default function EditDrawer({
  open,
  game,
  onClose,
  onSaved,
  context,
}) {
  const initial = useMemo(() => buildInitialDraft(game), [game])
  const [draft, setDraft] = useState(initial)

  const player = context?.player || {}
  const activeGame = game || null

  useEffect(() => {
    if (!open) return
    setDraft(initial)
  }, [open, initial])

  const { run, pending } = useGameHubUpdate(activeGame)

  const limits = useMemo(() => {
    return getGameStatsLimits({
      game: draft?.raw,
      playerId: draft?.playerId,
      draft,
    })
  }, [draft])

  const isDirty = useMemo(() => getIsDirty(draft, initial), [draft, initial])
  const canSave = !!draft?.gameId && !!draft?.playerId && isDirty && !pending

  const setField = useCallback((key, value) => {
    setDraft((prev) => ({
      ...prev,
      [key]: value,
    }))
  }, [])

  const handleReset = useCallback(() => {
    if (pending) return
    setDraft(initial)
  }, [initial, pending])

  const handleSave = useCallback(async () => {
    if (!canSave) return

    const patch = buildUpdateGamePlayersPatch({
      game: activeGame,
      draft,
    })

    await run('updateGamePlayers', patch, {
      gameId: activeGame?.id,
      createIfMissing: true,
    })

    onSaved(patch)
    onClose()
  }, [canSave, activeGame, draft, run, onSaved, onClose])

  const handleRemoveFromGame = useCallback(async () => {
    if (!draft?.playerId || !activeGame?.id) return

    const patch = buildRemovePlayerFromGamePatch({
      game: activeGame,
      playerId: draft.playerId,
    })

    await run('removePlayerFromGame', patch, {
      gameId: activeGame?.id,
      createIfMissing: false,
    })

    onSaved(patch)
    onClose()
  }, [activeGame, draft?.playerId, run, onSaved, onClose])

  const headerAvatar = player?.photo || playerImage
  const gameTitle = activeGame?.rivel || activeGame?.rival || 'משחק'
  const gameDate =
    activeGame?.gameDate || activeGame?.dateRaw || activeGame?.dateLabel || ''

  const status = isDirty
    ? { text: 'יש שינויים שלא נשמרו', color: 'danger' }
    : { text: 'אין שינויים', color: 'neutral' }

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
        onDelete: handleRemoveFromGame,
      }}
      texts={{
        save: 'שמירה',
        saving: 'שומר...',
        cancel: 'ביטול',
      }}
      tooltips={{
        reset: 'איפוס השינויים',
        delete: 'הסרת השחקן מהמשחק',
      }}
      status={status}
      header={
        <DrawerHeaderShell
          entity="player"
          title={player?.playerFullName || 'שחקן'}
          subline={`${gameTitle} - ${getFullDateIl(gameDate)}`}
          titleIconId="games"
          avatar={headerAvatar}
        />
      }
    >
      <GameEntryFields
        draft={draft}
        onFieldChange={setField}
        limits={limits}
        pending={pending}
      />
    </DrawerShell>
  )
}
