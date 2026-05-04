// teamProfile/mobile/modules/games/components/drawer/EditDrawer.js

import React, { useEffect, useMemo, useState, useCallback } from 'react'

import { getFullDateIl } from '../../../../../../../../shared/format/dateUtiles.js'
import { resolveEntityAvatar } from '../../../../../../../../ui/core/avatars/fallbackAvatar.js'

import DrawerShell from '../../../../../../../../ui/patterns/drawer/DrawerShell.js'
import DrawerHeaderShell from '../../../../../../../../ui/patterns/drawer/DrawerHeaderShell.js'

import { useGameHubUpdate } from '../../../../../../hooks/games/useGameHubUpdate.js'
import { useLifecycle } from '../../../../../../../../ui/domains/entityLifecycle/LifecycleProvider'

import GameEditFields from '../../../../../../../../ui/forms/ui/games/GameEditFields.js'

import {
  buildGameEditInitial,
  buildGameEditPatch,
  getGameEditFieldErrors,
  getIsGameEditValid,
  isGameEditDirty,
} from '../../../../../../editLogic/games/index.js'

export default function EditDrawer({
  open,
  game,
  context,
  onClose,
  onSaved,
}) {
  const initial = useMemo(() => buildGameEditInitial(game), [game])
  const [draft, setDraft] = useState(initial)
  const lifecycle = useLifecycle()

  const team = context?.team || game?.team || {}
  const headerAvatar = resolveEntityAvatar({
    entityType: 'team',
    entity: team,
    parentEntity: team?.club,
    subline: team?.club?.name,
  })

  useEffect(() => {
    if (!open) return
    setDraft(initial)
  }, [open, initial])

  const layout = useMemo(
    () => ({
      topCols: { xs: '1fr 1fr' },
      mainCols: { xs: '1fr 1fr' },
      metaCols: { xs: '1fr 1fr 1fr' },
      resultCols: { xs: '1fr 1fr 1fr' },
    }),
    []
  )

  const fieldErrors = useMemo(() => getGameEditFieldErrors(draft), [draft])
  const isDirty = useMemo(() => isGameEditDirty(draft, initial), [draft, initial])
  const isValid = useMemo(() => getIsGameEditValid(draft), [draft])
  const patch = useMemo(() => buildGameEditPatch(draft, initial), [draft, initial])

  const { run, pending } = useGameHubUpdate(game)
  const canSave = !!initial?.id && isDirty && isValid && !pending

  const handleSave = useCallback(async () => {
    if (!canSave) return

    await run('teamGameEdit', patch, {
      section: 'teamGameEdit',
      gameId: initial.id,
      createIfMissing: true,
    })

    onSaved(patch, { ...initial.raw, ...patch })
    onClose()
  }, [canSave, run, patch, initial.id, initial.raw, onSaved, onClose])

  const handleReset = useCallback(() => {
    if (pending) return
    setDraft({ ...initial })
  }, [initial, pending])

  const handleDelete = useCallback(() => {
    if (!game?.id) return

    lifecycle.openLifecycle(
      {
        entityType: 'game',
        id: game.id,
        name: `${game?.rivel || game?.rival || 'משחק'} ${game?.gameDate || ''}`,
      },
      {
        onAfterSuccess: ({ action, entityType, id }) => {
          if (action !== 'delete') return
          if (entityType !== 'game') return
          if (id !== game.id) return

          onClose()
        },
      }
    )
  }, [lifecycle, game?.id, game?.rivel, game?.rival, game?.gameDate, onClose])

  const status = !isValid
    ? { text: 'יש שדות חובה חסרים', color: 'warning' }
    : isDirty
    ? { text: 'יש שינויים שלא נשמרו', color: 'danger' }
    : { text: 'אין שינויים', color: 'neutral' }

  return (
    <DrawerShell
      entity="team"
      open={open}
      size='lg'
      anchor='bottom'
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
        delete: 'מחיקת משחק',
      }}
      status={status}
      header={
        <DrawerHeaderShell
          entity="team"
          title={team?.teamName || team?.name || 'קבוצה'}
          subline={`${draft?.rivel || game?.rivel || game?.rival || 'משחק'} - ${getFullDateIl(
            draft?.gameDate || game?.gameDate || ''
          )}`}
          titleIconId="games"
          avatar={headerAvatar}
        />
      }
    >
      <GameEditFields
        draft={draft}
        onDraft={setDraft}
        context={{
          clubs: context?.clubs || [],
          teams: context?.teams || [],
          team,
        }}
        fieldErrors={fieldErrors}
        layout={layout}
       />
    </DrawerShell>
  )
}
