// ui/forms/ui/players/PlayerMultiCreateFields.js

import React from 'react'
import { Box, Typography, Divider, Chip, Button } from '@mui/joy'

import PlayerFirstNameField from '../../../fields/inputUi/players/PlayerFirstNameField'
import PlayerLastNameField from '../../../fields/inputUi/players/PlayerLastNameField'
import ClubSelectField from '../../../fields/selectUi/clubs/ClubSelectField'
import TeamSelectField from '../../../fields/selectUi/teams/TeamSelectField'
import MonthPicker from '../../../fields/dateUi/MonthPicker'
import YearPicker from '../../../fields/dateUi/YearPicker'

import { pcfSx } from '../../sx/playerMultiCreateForm.sx.js'
import { makeId } from '../../../../utils/id.js'
import { iconUi } from '../../../core/icons/iconUi.js'

function toText(value) {
  return String(value ?? '').trim()
}

function createRow(defaults = {}) {
  return {
    uiKey: makeId('playerRow'),
    month: '',
    playerLastName: '',
    playerFirstName: '',
    year: defaults?.year || '',
    teamId: defaults?.teamId || '',
    clubId: defaults?.clubId || '',
  }
}

export default function PlayerMultiCreateFields({
  draft,
  onDraft,
  context,
  validity,
  layout,
}) {
  const defaults = draft?.defaults || {}
  const players = Array.isArray(draft?.players) ? draft.players : []

  function updateDefaults(patch) {
    const nextDefaults = { ...defaults, ...patch }

    const nextPlayers = players.map((row) => ({
      ...row,
      teamId: patch.teamId !== undefined ? patch.teamId : row.teamId,
      clubId: patch.clubId !== undefined ? patch.clubId : row.clubId,
      year: patch.year !== undefined ? patch.year : row.year,
    }))

    onDraft({
      ...draft,
      defaults: nextDefaults,
      players: nextPlayers,
    })
  }

  function updateRow(rowUiKey, patch) {
    const nextPlayers = players.map((row) =>
      row.uiKey === rowUiKey ? { ...row, ...patch } : row
    )

    onDraft({
      ...draft,
      players: nextPlayers,
    })
  }

  function addRow() {
    if (players.length >= 10) return

    onDraft({
      ...draft,
      players: [...players, createRow(defaults)],
    })
  }

  function removeRow(rowUiKey) {
    if (players.length <= 2) return

    onDraft({
      ...draft,
      players: players.filter((row) => row.uiKey !== rowUiKey),
    })
  }

  return (
    <Box sx={pcfSx.root(layout)}>
      <Box sx={pcfSx.header}>
        <Box>
          <Typography level="title-md">הוספת מספר שחקנים</Typography>

          <Typography level="body-sm" sx={{ color: 'text.secondary' }}>
            מינימום 2 שחקנים {' · '} מקסימום 10 שחקנים
          </Typography>
        </Box>

        <Chip size="sm" color={validity?.isValid ? 'success' : 'neutral'}>
          {players.length} שחקנים
        </Chip>
      </Box>

      <Divider>
        <Typography level="title-sm" sx={{ mt: 0.25, mb: 0.25 }}>
          ברירות מחדל
        </Typography>
      </Divider>

      <Box sx={pcfSx.block(layout?.defaultsCols, 1.5)}>
        <ClubSelectField
          value={draft?.clubId || defaults?.clubId || ''}
          size="sm"
          options={context?.clubs || []}
          disabled
        />

        <TeamSelectField
          value={draft?.teamId || defaults?.teamId || ''}
          size="sm"
          options={context?.teams || []}
          clubId={draft?.clubId || defaults?.clubId || ''}
          disabled
        />
      </Box>

      <Divider>
        <Typography level="title-sm" sx={{ mt: 0.25, mb: 0.25 }}>
          רשימת שחקנים
        </Typography>
      </Divider>

      <Box sx={{ display: 'grid', gap: 1 }}>
        {players.map((row, index) => {
          const rowValidity = validity?.rowValidity[index] || {}

          return (
            <Box key={row.uiKey} sx={pcfSx.rowCard(rowValidity?.isValid)}>
              <Box sx={pcfSx.rowHeader}>
                <Typography level="title-sm">שחקן {index + 1}</Typography>

                <Box sx={pcfSx.rowActions}>
                  {!rowValidity?.isValid && (
                    <Chip size="sm" color="danger" variant="soft">
                      חסרים שדות
                    </Chip>
                  )}

                  <Button
                    size="sm"
                    variant="plain"
                    color="danger"
                    disabled={players.length <= 2}
                    onClick={() => removeRow(row.uiKey)}
                  >
                    הסר
                  </Button>
                </Box>
              </Box>

              <Box sx={pcfSx.block(layout?.rowCols, 1)}>
                <PlayerFirstNameField
                  id={`playerFirstName-${row.uiKey}`}
                  size="sm"
                  required
                  variant="outlined"
                  value={row?.playerFirstName || ''}
                  onChange={(value) => updateRow(row.uiKey, { playerFirstName: value })}
                />

                <PlayerLastNameField
                  id={`playerLastName-${row.uiKey}`}
                  size="sm"
                  required
                  variant="outlined"
                  value={row?.playerLastName || ''}
                  onChange={(value) => updateRow(row.uiKey, { playerLastName: value })}
                />

                <MonthPicker
                  id={`month-${row.uiKey}`}
                  size="sm"
                  required
                  value={row.month}
                  onChange={(value) => updateRow(row.uiKey, { month: value })}
                />

                <YearPicker
                  id={`year-${row.uiKey}`}
                  size="sm"
                  required
                  value={row?.year || ''}
                  onChange={(value) => updateRow(row.uiKey, { year: value })}
                />
              </Box>
            </Box>
          )
        })}
      </Box>

      <Box sx={pcfSx.footer}>
        <Button
          size="sm"
          variant="soft"
          startDecorator={iconUi({ id: 'add' })}
          onClick={addRow}
          disabled={players.length >= 10}
        >
          הוסף שחקן
        </Button>

        <Typography level="body-xs" sx={{ color: 'text.secondary' }}>
          קבוצה ומועדון נקבעים כברירת מחדל עבור כל השחקנים
        </Typography>
      </Box>
    </Box>
  )
}
