// playerProfile/mobile/modules/games/components/entryDrawer/EntryEditDrawer.js

import React, { useEffect, useMemo, useState, useCallback } from 'react'

import playerImage from '../../../../../../../../ui/core/images/playerImage.jpg'
import { getFullDateIl } from '../../../../../../../../shared/format/dateUtiles.js'

import DrawerShell from '../../../../../../../../ui/patterns/drawer/DrawerShell.js'
import DrawerHeaderShell from '../../../../../../../../ui/patterns/drawer/DrawerHeaderShell.js'

import { useGameHubUpdate } from '../../../../../../hooks/games/useGameHubUpdate.js'

import GameEntryFields from '../../../../../../../../ui/forms/ui/games/GameEntryFields.js'

import {
  buildPlayerGameEntryInitial,
  buildUpdatePlayerGameEntryPatch,
  buildRemovePlayerGameEntryPatch,
  getPlayerGameEntryLimits,
  isPlayerGameEntryDirty,
} from '../../../../../../editLogic/games/entryGames/index.js'

const getGameId = game => {
  return game?.id || game?.gameId || game?.game?.id || game?.game?.gameId || ''
}

const isPrivatePlayerEntity = player => {
  return player?.isPrivatePlayer === true || player?.playerSource === 'private'
}

const isExternalGame = game => {
  return game?.gameSource === 'external' || game?.isExternalGame === true
}

const getRouterMeta = ({ game, player, createIfMissing }) => {
  const externalMode = isPrivatePlayerEntity(player) || isExternalGame(game)
  const gameId = getGameId(game)

  return {
    game,
    gameId,
    gameSource: externalMode ? 'external' : game?.gameSource,
    isExternalGame: externalMode,
    routerEntityType: externalMode ? 'externalGames' : 'games',
    createIfMissing,
  }
}

export default function EntryEditDrawer({
  open,
  game,
  onClose,
  onSaved,
  context,
}) {
  const player = context?.player || {}
  const isPrivatePlayer = isPrivatePlayerEntity(player)
  const activeGame = game || null

  const initial = useMemo(() => {
    return buildPlayerGameEntryInitial(game, player)
  }, [game, player])

  const [draft, setDraft] = useState(initial)

  useEffect(() => {
    if (!open) return
    setDraft(initial)
  }, [open, initial])

  const { run, pending } = useGameHubUpdate(activeGame)

  const limits = useMemo(() => {
    return getPlayerGameEntryLimits({
      game: draft?.raw,
      playerId: draft?.playerId,
      draft,
    })
  }, [draft])

  const isDirty = useMemo(() => {
    return isPlayerGameEntryDirty(draft, initial)
  }, [draft, initial])

  const gameId = getGameId(activeGame)
  const canSave = !!gameId && !!draft?.playerId && isDirty && !pending

  const setField = useCallback((key, value) => {
    setDraft(prev => ({
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

    const patch = buildUpdatePlayerGameEntryPatch({
      game: activeGame,
      draft,
    })

    await run('updateGamePlayer', patch, getRouterMeta({
      game: activeGame,
      player,
      createIfMissing: true,
    }))

    onSaved(patch)
    onClose()
  }, [canSave, activeGame, player, draft, run, onSaved, onClose])

  const handleRemoveFromGame = useCallback(async () => {
    if (!draft?.playerId || !gameId) return

    const patch = buildRemovePlayerGameEntryPatch({
      game: activeGame,
      playerId: draft.playerId,
    })

    await run('removePlayerFromGame', patch, getRouterMeta({
      game: activeGame,
      player,
      createIfMissing: false,
    }))

    onSaved(patch)
    onClose()
  }, [activeGame, player, draft?.playerId, gameId, run, onSaved, onClose])

  const headerAvatar = player?.photo || playerImage
  const gameTitle = activeGame?.rivel || activeGame?.rival || 'משחק'
  const gameDate = activeGame?.gameDate || activeGame?.dateRaw || ''

  const status = isDirty
    ? { text: 'יש שינויים שלא נשמרו', color: 'danger' }
    : { text: 'אין שינויים', color: 'neutral' }

  const drawerActions = {
    onSave: handleSave,
    onReset: handleReset,
    ...(!isPrivatePlayer ? { onDelete: handleRemoveFromGame } : {}),
  }

  const drawerTooltips = {
    reset: 'איפוס השינויים',
    ...(!isPrivatePlayer ? { delete: 'הסרת השחקן מהמשחק' } : {}),
  }

  return (
    <DrawerShell
      entity="player"
      open={open}
      size='lg'
      anchor='bottom'
      onClose={onClose}
      saving={pending}
      isDirty={isDirty}
      canSave={canSave}
      texts={{
        save: 'שמירה',
        saving: 'שומר...',
        cancel: 'ביטול',
      }}
      header={
        <DrawerHeaderShell
          entity="player"
          title={player?.playerFullName || 'שחקן'}
          subline={`${gameTitle} - ${getFullDateIl(gameDate)}`}
          titleIconId="games"
          avatar={headerAvatar}
        />
      }
      status={status}
      actions={drawerActions}
      tooltips={drawerTooltips}
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
