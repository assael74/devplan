// previewDomainCard/domains/team/games/components/drawer/EditDrawer.js

import React, { useEffect, useMemo, useState, useCallback } from 'react'
import { Drawer, Sheet, Box, Typography, Button, IconButton, Tooltip } from '@mui/joy'

import { iconUi } from '../../../../../../../../../../ui/core/icons/iconUi.js'
import { useGameHubUpdate } from '../../../../../../../../hooks/useGameHubUpdate.js'
import { useLifecycle } from '../../../../../../../../../../ui/domains/entityLifecycle/LifecycleProvider'

import EditDrawerHeader from './EditDrawerHeader.js'
import EditFormDrawer from './EditFormDrawer.js'

import {
  buildInitialDraft,
  buildPatch,
  getIsDirty,
  calcResultByGoals,
} from './editDrawer.utils.js'

import { drawerSx as sx } from '../../sx/editDrawer.sx.js'

export default function EditDrawer({ open, game, onClose, onSaved }) {
  const initial = useMemo(() => buildInitialDraft(game), [game])
  const lifecycle = useLifecycle()
  const [draft, setDraft] = useState(initial)

  useEffect(() => {
    if (!open) return
    setDraft(initial)
  }, [open, initial])

  useEffect(() => {
    const autoResult = calcResultByGoals(draft.goalsFor, draft.goalsAgainst)
    if (!autoResult) return

    setDraft((prev) => {
      if (prev.result === autoResult) return prev
      return { ...prev, result: autoResult }
    })
  }, [draft.goalsFor, draft.goalsAgainst])

  const liveGame = useMemo(() => {
    const gf = draft.goalsFor
    const ga = draft.goalsAgainst
    const result = calcResultByGoals(gf, ga) || draft.result || ''

    return {
      ...initial.raw,
      rivel: draft.rivel,
      gameDate: draft.gameDate,
      gameHour: draft.gameHour,
      home: draft.home,
      type: draft.type,
      difficulty: draft.difficulty,
      gameDuration: draft.gameDuration,
      goalsFor: gf,
      goalsAgainst: ga,
      vLink: draft.vLink,
      result,
      score: gf !== '' && ga !== '' ? `${gf} - ${ga}` : '',
      points: result === 'win' ? 3 : result === 'draw' ? 1 : 0,
    }
  }, [initial.raw, draft])

  const isDirty = useMemo(() => getIsDirty(draft, initial), [draft, initial])
  const patch = useMemo(() => buildPatch(draft, initial), [draft, initial])

  const { run, pending } = useGameHubUpdate(initial.raw)
  const canSave = !!initial.id && isDirty && !pending

  const handleSave = async () => {
    if (!canSave) return

    await run('gameQuickEdit', patch, {
      section: 'teamGameQuickEdit',
      gameId: initial.id,
    })

    onSaved(patch, { ...initial.raw, ...patch })
    onClose()
  }

  const handleReset = () => setDraft(initial)

  const handleDelete = useCallback(() => {
    if (!game?.id) return

    lifecycle.openLifecycle(
      { entityType: 'game', id: game.id, name: `${game?.rivel || 'משחק'} ${game?.gameDate || ''}`, },
      {
        onAfterSuccess: ({ action, entityType, id }) => {
          if (action !== 'delete') return
          if (entityType !== 'game') return
          if (id !== game.id) return

          onClose()
        },
      }
    )
  }, [lifecycle, game?.id, game?.rivel, game?.gameDate, onClose])

  return (
    <Drawer
      open={!!open}
      size="md"
      anchor="right"
      onClose={pending ? undefined : onClose}
      slotProps={{
        content: {
          sx: {
            bgcolor: 'transparent',
            p: { xs: 0, md: 2 },
            boxShadow: 'none',
          },
        },
      }}
    >
      <Sheet sx={sx.drawerSheetSx}>
        <Box sx={sx.drawerRootSx}>
          <EditDrawerHeader game={liveGame} />

          <EditFormDrawer draft={draft} setDraft={setDraft} liveGame={liveGame} />

          <Box sx={sx.footerSx}>
            <Box sx={sx.footerActionsSx}>
              <Button
                loading={pending}
                disabled={!canSave}
                startDecorator={iconUi({ id: 'save' })}
                onClick={handleSave}
                sx={sx.conBut}
              >
                שמירה
              </Button>

              <Button
                color="neutral"
                variant="outlined"
                onClick={onClose}
                disabled={pending}
              >
                ביטול
              </Button>

              <Tooltip title="איפוס השינויים">
                <span>
                  <IconButton
                    disabled={!isDirty}
                    size="sm"
                    variant="soft"
                    sx={sx.icoRes}
                    onClick={handleReset}
                  >
                    {iconUi({ id: 'reset' })}
                  </IconButton>
                </span>
              </Tooltip>

              <Tooltip title="מחיקת משחק">
                <span>
                  <IconButton
                    size="sm"
                    color='danger'
                    variant="solid"
                    onClick={handleDelete}
                  >
                    {iconUi({ id: 'delete' })}
                  </IconButton>
                </span>
              </Tooltip>
            </Box>

            <Typography level="body-xs" color={isDirty ? 'danger' : 'neutral'}>
              {isDirty ? 'יש שינויים שלא נשמרו' : 'אין שינויים'}
            </Typography>
          </Box>
        </Box>
      </Sheet>
    </Drawer>
  )
}
