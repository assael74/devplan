// teamProfile/modules/games/components/entryDrawer/entryEditDrawer.js

// EntryEditDrawer.js
import React, { useEffect, useMemo, useState } from 'react'
import { Box, Button, Drawer, IconButton, Sheet, Tooltip, Typography } from '@mui/joy'

import EntryEditHeaderDrawer from './EntryEditHeaderDrawer.js'
import EntryEditContentDrawer from './EntryEditContentDrawer.js'

import { iconUi } from '../../../../../../../../ui/core/icons/iconUi'
import { useGameHubUpdate } from '../../../../../../hooks/games/useGameHubUpdate.js'

import { entryEditDrawerSx as sx } from './sx/entryEditDrawer.sx.js'
import {
  buildTeamGameEntryInitialDraft,
  buildTeamGameEntryPatch,
  clampStatToRowLimit,
  getTeamGameEntryIsDirty,
  getTeamGameEntryIsValid,
  getValidationMessage,
  setRowField,
} from './../../../../../sharedLogic/games'

const defaultEntryFilters = {
  squad: 'all',
  start: 'all',
}

export default function EntryEditDrawer({
  open,
  game,
  context,
  onClose,
  onSaved,
}) {
  const team = context?.team || game?.team || {}
  const initial = useMemo(() => buildTeamGameEntryInitialDraft(game, team, context), [game, team, context])
  const [draft, setDraft] = useState(initial)
  const [filters, setFilters] = useState(defaultEntryFilters)

  useEffect(() => {
    if (!open) return
    setDraft(initial)
    setFilters(defaultEntryFilters)
  }, [open, initial])

  const isValid = useMemo(() => getTeamGameEntryIsValid(draft), [draft])
  const isDirty = useMemo(() => getTeamGameEntryIsDirty(draft), [draft])
  const patch = useMemo(() => buildTeamGameEntryPatch(draft), [draft])
  const validationMessage = useMemo(() => getValidationMessage(draft), [draft])

  const { run, pending } = useGameHubUpdate(game)
  const canSave = !!draft?.id && isDirty && isValid && !pending

  const handleChangeRow = (playerId, field, value) => {
    setDraft((prev) => {
      const safeValue =
        field === 'goals' || field === 'assists' || field === 'timePlayed'
          ? clampStatToRowLimit(prev?.rows || [], playerId, field, value, prev)
          : value

      return {
        ...prev,
        rows: setRowField(prev?.rows || [], playerId, field, safeValue),
      }
    })
  }

  const handleReset = () => {
    setDraft(initial)
  }

  const handleBulkSetOnSquad = (value) => {
    setDraft((prev) => ({
      ...prev,
      rows: (prev?.rows || []).map((row) => ({
        ...row,
        onSquad: value,
        onStart: value ? row.onStart : false,
        goals: value ? row.goals : '',
        assists: value ? row.assists : '',
        timePlayed: value ? row.timePlayed : '',
      })),
    }))
  }

  const handleBulkResetStats = () => {
    setDraft((prev) => ({
      ...prev,
      rows: (prev?.rows || []).map((row) => ({
        ...row,
        goals: '',
        assists: '',
        timePlayed: '',
      })),
    }))
  }

  const handleSetFilter = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: prev?.[key] === value ? 'all' : value,
    }))
  }

  const handleResetFilters = () => {
    setFilters(defaultEntryFilters)
  }

  const handleSave = async () => {
    if (!canSave) return

    await run('teamEntryGameEdit', patch, {
      section: 'teamEntryGameEdit',
      gameId: draft.id,
      createIfMissing: true
    })

    onSaved(patch, { ...initial.raw, ...patch })
    onClose()
  }

  return (
    <Drawer
      size="lg"
      variant="plain"
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{ content: { sx: sx.drawerSx } }}
    >
      <Sheet sx={sx.drawerSheet}>
        <EntryEditHeaderDrawer
          game={game}
          draft={draft}
          context={context}
          onClose={onClose}
        />

        <EntryEditContentDrawer
          draft={draft}
          filters={filters}
          onSetFilter={handleSetFilter}
          onResetFilters={handleResetFilters}
          onChangeRow={handleChangeRow}
          onBulkSetOnSquad={handleBulkSetOnSquad}
          onBulkResetStats={handleBulkResetStats}
        />

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
          </Box>

          <Typography
            level="body-xs"
            color={!isValid ? 'warning' : isDirty ? 'danger' : 'neutral'}
          >
            {!isValid
              ? 'יש שדות חובה חסרים'
              : isDirty
              ? 'יש שינויים שלא נשמרו'
              : 'אין שינויים'}
          </Typography>
        </Box>
      </Sheet>
    </Drawer>
  )
}
