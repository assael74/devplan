// playerProfile/desktop/modules/games/components/drawer/EditDrawer.js

import React, { useEffect, useMemo, useState, useCallback } from 'react'

import { getFullDateIl } from '../../../../../../../../shared/format/dateUtiles.js'
import playerImage from '../../../../../../../../ui/core/images/playerImage.jpg'

import DrawerShell from '../../../../../../../../ui/patterns/drawer/DrawerShell.js'
import DrawerHeaderShell from '../../../../../../../../ui/patterns/drawer/DrawerHeaderShell.js'

import { useGameHubUpdate } from '../../../../../../hooks/games/useGameHubUpdate.js'
import { useLifecycle } from '../../../../../../../../ui/domains/entityLifecycle/LifecycleProvider.js'

import GameEditFields from '../../../../../../../../ui/forms/ui/games/GameEditFields.js'

import {
  buildExternalGameEditInitial,
  buildExternalGameEditFieldErrors,
  getIsExternalGameEditValid,
  isExternalGameEditDirty,
  buildExternalGameEditPatch,
} from '../../../../../../editLogic/games/externalGames/index.js'

const layout = {
  topCols: { xs: '1fr 1fr', md: '1fr 1fr' },
  mainCols: { xs: '1fr', md: '1fr 1fr' },
  metaCols: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
  resultCols: { xs: '1fr 1fr', md: '1fr 1fr auto' },
}

const getGameId = (game = {}, draft = {}) => {
  return game?.id || game?.gameId || draft?.gameId || ''
}

const getGameTitle = (game = {}, draft = {}) => {
  return game?.rivel || game?.rival || draft?.rivel || 'משחק'
}

const getGameDate = (game = {}, draft = {}) => {
  return game?.gameDate || game?.dateRaw || game?.dateLabel || draft?.gameDate || ''
}

export default function EditDrawer({
  open,
  game,
  onClose,
  onSaved,
  context,
}) {
  const player = context?.player || {}
  const activeGame = game || null
  const lifecycle = useLifecycle()

  const initial = useMemo(() => {
    return buildExternalGameEditInitial(activeGame, {
      ...context,
      player,
    })
  }, [activeGame, context, player])

  const [draft, setDraft] = useState(initial)

  useEffect(() => {
    if (!open) return
    setDraft(initial)
  }, [open, initial])

  const { run, pending } = useGameHubUpdate(activeGame)

  const fieldErrors = useMemo(() => {
    return buildExternalGameEditFieldErrors(draft)
  }, [draft])

  const isValid = useMemo(() => {
    return getIsExternalGameEditValid(draft)
  }, [draft])

  const isDirty = useMemo(() => {
    return isExternalGameEditDirty(draft, initial)
  }, [draft, initial])

  const canSave = !!draft?.gameId && isDirty && isValid && !pending

  const handleReset = useCallback(() => {
    if (pending) return
    setDraft(initial)
  }, [initial, pending])

  const handleSave = useCallback(async () => {
    if (!canSave) return

    const patch = buildExternalGameEditPatch({ draft })
    const gameId = getGameId(activeGame, draft)

    await run('updateExternalGame', patch, {
      game: activeGame,
      gameId,
      routerEntityType: 'externalGames',
      gameSource: 'external',
      isExternalGame: true,
      createIfMissing: true,
    })

    onSaved?.(patch, {
      ...activeGame,
      ...patch,
      id: gameId,
      gameId,
      gameSource: 'external',
      isExternalGame: true,
    })

    onClose()
  }, [canSave, activeGame, draft, run, onSaved, onClose])

  const handleDelete = useCallback(() => {
    const gameId = getGameId(activeGame, draft)
    if (!gameId) return

    lifecycle.openLifecycle(
      {
        entityType: 'externalGame',
        id: gameId,
        name: `${getGameTitle(activeGame, draft)} ${getGameDate(activeGame, draft)}`.trim(),
      },
      {
        onAfterSuccess: ({ action, entityType, id }) => {
          if (action !== 'delete') return
          if (entityType !== 'externalGame') return
          if (id !== gameId) return

          onSaved({ deleted: true, id })
          onClose()
        },
      }
    )
  }, [lifecycle, activeGame, draft, onSaved, onClose])

  const headerAvatar = player?.photo || playerImage
  const gameTitle = getGameTitle(activeGame, draft)
  const gameDate = getGameDate(activeGame, draft)

  const status = !isValid
    ? { text: 'יש שדות חובה חסרים', color: 'warning' }
    : isDirty
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
        onDelete: handleDelete,
      }}
      texts={{
        save: 'שמירה',
        saving: 'שומר...',
        cancel: 'ביטול',
      }}
      tooltips={{
        reset: 'איפוס השינויים',
        delete: 'מחיקת משחק חיצוני',
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
      <GameEditFields
        draft={draft}
        onDraft={setDraft}
        context={{
          ...context,
          player,
          isPrivatePlayer: true,
        }}
        fieldErrors={fieldErrors}
        layout={layout}
        isPrivatePlayer
      />
    </DrawerShell>
  )
}
