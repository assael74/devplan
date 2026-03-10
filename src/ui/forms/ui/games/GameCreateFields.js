// ui/forms/ui/games/GameCreateFields.js

import React, { useEffect } from 'react'
import { Box, Typography, Divider, Chip } from '@mui/joy'

import DateInputField from '../../../fields/dateUi/DateInputField'
import HourInputField from '../../../fields/dateUi/HourInputField'
import ClubSelectField from '../../../fields/selectUi/clubs/ClubSelectField.js'
import TeamSelectField from '../../../fields/selectUi/teams/TeamSelectField.js'
import GameHomeSelector from '../../../fields/checkUi/games/GameHomeSelector.js'
import GameDifficultySelectField from '../../../fields/selectUi/games/GameDifficultySelectField.js'
import GameDurationSelectField from '../../../fields/selectUi/games/GameDurationSelectField.js'
import GameTypeSelectField from '../../../fields/selectUi/games/GameTypeSelectField.js'
import GameRivelField from '../../../fields/inputUi/games/GameRivelField.js'
import GoalsForField from '../../../fields/inputUi/games/GoalsForField.js'
import GoalsAgainstField from '../../../fields/inputUi/games/GoalsAgainstField.js'

import GameChipResult from './GameChipResult.js'

import { gcfSx } from '../../sx/gameCreateForm.sx.js'

export default function GameCreateFields({
  draft,
  onDraft,
  context,
  validity,
  layout,
}) {
  const gameDate = draft?.gameDate || ''
  const gameHour = draft?.gameHour || ''
  const rivel = draft?.rivel || ''
  const teamId = draft?.teamId || ''
  const clubId = draft?.clubId || ''
  const home = draft?.home || ''
  const difficulty = draft?.difficulty || ''
  const type = draft?.type || ''
  const gameDuration = draft?.gameDuration || ''
  const goalsAgainst = draft?.goalsAgainst ?? 0
  const goalsFor = draft?.goalsFor ?? 0

  useEffect(() => {
    const result = goalsFor > goalsAgainst ? 'win' : goalsFor < goalsAgainst ? 'loss' : 'draw'

    onDraft({
      ...draft,
      result,
    })
  }, [goalsFor, goalsAgainst])

  return (
    <Box sx={gcfSx.root(layout)}>
      <Box sx={gcfSx.block(layout.topCols, 1.5)}>
        <ClubSelectField
          value={clubId}
          size="sm"
          options={context?.clubs || []}
          disabled
        />

        <TeamSelectField
          value={teamId}
          size="sm"
          options={context?.teams || []}
          disabled
          clubId={clubId}
        />
      </Box>

      <Divider>
        <Typography level="title-sm" sx={gcfSx.title}>
          פרטי המשחק
        </Typography>
      </Divider>

      <Box sx={gcfSx.block(layout.mainCols)}>
        <GameRivelField
          id="rivel"
          size="sm"
          required
          value={rivel}
          onChange={(v) => onDraft({ ...draft, rivel: v })}
        />

        <GameHomeSelector
          id="game_Home_Selector"
          value={home}
          size="sm"
          onChange={(v) => onDraft({ ...draft, home: v })}
        />

        <DateInputField
          label="תאריך משחק"
          required
          value={gameDate}
          onChange={(v) => onDraft({ ...draft, gameDate: v })}
          error={!validity.okDate && !!gameDate}
          size="sm"
        />

        <HourInputField
          value={gameHour}
          onChange={(v) => onDraft({ ...draft, gameHour: v })}
          size="sm"
        />
      </Box>

      <Divider>
        <Typography level="title-sm" sx={gcfSx.title}>
          מידע נוסף
        </Typography>
      </Divider>

      <Box sx={gcfSx.block(layout.metaCols, 1)}>
        <GameTypeSelectField
          id="gameType"
          size="sm"
          value={type}
          required
          label="סוג משחק"
          onChange={(v) => onDraft({ ...draft, type: v })}
        />

        <GameDifficultySelectField
          value={difficulty}
          size="sm"
          onChange={(v) => onDraft({ ...draft, difficulty: v })}
        />

        <GameDurationSelectField
          value={gameDuration}
          size="sm"
          required
          placeholder="משך משחק"
          onChange={(v) => onDraft({ ...draft, gameDuration: v })}
        />
      </Box>

      <Divider>
        <Typography level="title-sm" sx={gcfSx.title}>
          תוצאת משחק
        </Typography>
      </Divider>

      <Box sx={gcfSx.block(layout.resultCols, 1)}>
        <GoalsForField
          id="goalsFor"
          size="sm"
          value={goalsFor}
          onChange={(v) => onDraft({ ...draft, goalsFor: v })}
        />

        <GoalsAgainstField
          id="goalsAgainst"
          size="sm"
          value={goalsAgainst}
          onChange={(v) => onDraft({ ...draft, goalsAgainst: v })}
        />

        <GameChipResult size='lg' goalsFor={goalsFor} goalsAgainst={goalsAgainst} />
      </Box>
    </Box>
  )
}
