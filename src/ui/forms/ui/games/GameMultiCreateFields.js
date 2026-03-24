// ui/forms/ui/games/GameMultiCreateFields.js

import React from 'react'
import { Box, Typography, Divider, Button, Chip } from '@mui/joy'

import DateInputField from '../../../fields/dateUi/DateInputField'
import HourInputField from '../../../fields/dateUi/HourInputField'
import ClubSelectField from '../../../fields/selectUi/clubs/ClubSelectField.js'
import TeamSelectField from '../../../fields/selectUi/teams/TeamSelectField.js'
import GameHomeSelector from '../../../fields/checkUi/games/GameHomeSelector.js'
import GameDurationSelectField from '../../../fields/selectUi/games/GameDurationSelectField.js'
import GameTypeSelectField from '../../../fields/selectUi/games/GameTypeSelectField.js'
import GameRivelField from '../../../fields/inputUi/games/GameRivelField.js'

import { makeId } from '../../../../utils/id.js'
import { iconUi } from '../../../core/icons/iconUi.js';
import { gcfSx } from '../../sx/gameMultiCreateForm.sx.js'

function createRow(defaults = {}) {
  return {
    uiKey: makeId('gameRow'),
    rivel: '',
    gameDate: '',
    gameHour: '',
    home: defaults?.home ?? true,
    type: defaults?.type || '',
    gameDuration: defaults?.gameDuration || '',
  }
}

export default function GameMultiCreateFields({
  draft,
  onDraft,
  validity,
  layout,
  context
}) {
  const defaults = draft?.defaults || {}
  const games = Array.isArray(draft?.games) ? draft.games : []

  function updateDefaults(patch) {
    const nextDefaults = { ...defaults, ...patch }

    const nextGames = games.map((row) => ({
      ...row,
      home: patch.home !== undefined ? patch.home : row.home,
      type: patch.type !== undefined ? patch.type : row.type,
      gameDuration: patch.gameDuration !== undefined ? patch.gameDuration : row.gameDuration,
    }))

    onDraft({
      ...draft,
      defaults: nextDefaults,
      games: nextGames,
    })
  }

  function updateRow(rowUiKey, patch) {
    const nextGames = games.map((row) =>
      row.uiKey === rowUiKey ? { ...row, ...patch } : row
    )

    onDraft({
      ...draft,
      games: nextGames,
    })
  }

  function addRow() {
    if (games.length >= 10) return

    onDraft({
      ...draft,
      games: [...games, createRow(defaults)],
    })
  }

  function removeRow(rowUiKey) {
    if (games.length <= 2) return

    onDraft({
      ...draft,
      games: games.filter((row) => row.uiKey !== rowUiKey),
    })
  }

  return (
    <Box sx={gcfSx.root(layout)}>
      <Box sx={gcfSx.header}>
        <Box>
          <Typography level="title-md">הוספת מספר משחקים</Typography>
          <Typography level="body-sm" sx={{ color: 'text.secondary', }}>
            מינימום 2 משחקים · עד 10 משחקים
          </Typography>
        </Box>

        <Chip size="sm" color={validity?.isValid ? 'success' : 'neutral'}>
          {games.length} משחקים
        </Chip>
      </Box>

      <Divider>
        <Typography level="title-sm" sx={{ mt: 0.25, mb: 0.25, }}>
          ברירות מחדל
        </Typography>
      </Divider>

      {/* שורה ראשונה */}

      <Box sx={gcfSx.block(layout.defaultsCols, 1.5)}>
        <ClubSelectField
          value={draft.clubId}
          size="sm"
          options={context?.clubs || []}
          disabled
        />

        <TeamSelectField
          value={draft.teamId}
          size="sm"
          options={context?.teams || []}
          disabled
          clubId={draft.clubId}
        />
      </Box>

      {/* שורה שניה */}

      <Box sx={gcfSx.block(layout.defaultsCols, 1)}>
        <GameTypeSelectField
          id="multiGameType"
          size="sm"
          required
          label="סוג משחק"
          value={defaults?.type || ''}
          onChange={(value) => updateDefaults({ type: value })}
        />

        <GameDurationSelectField
          size="sm"
          required
          placeholder="משך משחק"
          value={defaults?.gameDuration || ''}
          onChange={(value) => updateDefaults({ gameDuration: value })}
        />
      </Box>

      <Divider>
        <Typography level="title-sm" sx={{ mt: 0.25, mb: 0.25, }}>
          רשימת משחקים
        </Typography>
      </Divider>


      {/* שורות משחק */}

      <Box sx={{ display: 'grid', gap: 1, }}>
        {games.map((row, index) => {
          const rowValidity = validity?.rowValidity[index] || {}

          return (
            <Box key={row.uiKey} sx={gcfSx.rowCard(rowValidity?.isValid)}>

              {/* שורת מספור משחק */}

              <Box sx={gcfSx.rowHeader}>
                <Typography level="title-sm">משחק {index + 1}</Typography>

                <Box sx={gcfSx.rowActions}>
                  {!rowValidity?.isValid && (
                    <Chip size="sm" color="danger" variant="soft">
                      חסרים שדות
                    </Chip>
                  )}

                  <Button
                    size="sm"
                    variant="plain"
                    color="danger"
                    disabled={games.length <= 2}
                    onClick={() => removeRow(row.uiKey)}
                  >
                    הסר
                  </Button>
                </Box>
              </Box>

              {/* שורת שדות */}

              <Box sx={gcfSx.block(layout.rowCols, 1)}>
                <GameRivelField
                  id={`rivel-${row.uiKey}`}
                  size="sm"
                  required
                  value={row?.rivel || ''}
                  variant="outlined"
                  onChange={(value) => updateRow(row.uiKey, { rivel: value })}
                />

                <DateInputField
                  label="תאריך משחק"
                  required
                  size="sm"
                  value={row?.gameDate || ''}
                  onChange={(value) => updateRow(row.uiKey, { gameDate: value })}
                />

                <HourInputField
                  size="sm"
                  value={row?.gameHour || ''}
                  onChange={(value) => updateRow(row.uiKey, { gameHour: value })}
                />

                <GameHomeSelector
                  id={`home-${row.uiKey}`}
                  size="sm"
                  value={row?.home}
                  onChange={(value) => updateRow(row.uiKey, { home: value })}
                />
              </Box>
            </Box>
          )
        })}
      </Box>

      <Box sx={gcfSx.footer}>
        <Button
          size="sm"
          variant="soft"
          onClick={addRow}
          startDecorator={iconUi({id: 'add'})}
          disabled={games.length >= 10}
        >
          הוסף משחק
        </Button>

        <Typography level="body-xs" sx={{ color: 'text.secondary', }}>
          סוג משחק ומשך משחק נקבעים כברירת מחדל לכל השורות
        </Typography>
      </Box>
    </Box>
  )
}
