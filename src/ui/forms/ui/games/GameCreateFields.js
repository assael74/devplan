// ui/forms/ui/games/GameCreateFields.js

import React, { useEffect } from 'react'
import { Box, Typography, Divider } from '@mui/joy'

import DateInputField from '../../../fields/dateUi/DateInputField'
import HourInputField from '../../../fields/dateUi/HourInputField'
import ClubSelectField from '../../../fields/selectUi/clubs/ClubSelectField.js'
import ClubNameField from '../../../fields/inputUi/clubs/ClubNameField'
import TeamNameField from '../../../fields/inputUi/teams/TeamNameField'
import TeamSelectField from '../../../fields/selectUi/teams/TeamSelectField.js'
import GameHomeSelector from '../../../fields/checkUi/games/GameHomeSelector.js'
import GameDifficultySelectField from '../../../fields/selectUi/games/GameDifficultySelectField.js'
import GameDurationSelectField from '../../../fields/selectUi/games/GameDurationSelectField.js'
import GameTypeSelectField from '../../../fields/selectUi/games/GameTypeSelectField.js'
import GameRivelField from '../../../fields/inputUi/games/GameRivelField.js'
import GoalsForField from '../../../fields/inputUi/games/GoalsForField.js'
import GoalsAgainstField from '../../../fields/inputUi/games/GoalsAgainstField.js'

import GameChipResult from './GameChipResult.js'

import { createSx as sx } from './sx/create.sx.js'

function getGameCreateFieldsState(draft = {}, context = {}) {
  return {
    gameDate: draft?.gameDate || '',
    gameHour: draft?.gameHour || '',
    rivel: draft?.rivel || '',
    teamId: draft?.teamId || '',
    clubId: draft?.clubId || '',
    clubName: draft?.clubName || context?.player?.clubName || '',
    teamName: draft?.teamName || context?.player?.teamName || '',
    home: draft?.home ?? '',
    difficulty: draft?.difficulty || '',
    type: draft?.type || '',
    gameDuration: draft?.gameDuration || '',
    goalsAgainst: draft?.goalsAgainst ?? 0,
    goalsFor: draft?.goalsFor ?? 0,
  }
}

export default function GameCreateFields({
  draft = {},
  onDraft,
  context = {},
  fieldErrors = {},
  layout,
  isPrivatePlayer = false,
}) {
  const {
    gameDate,
    gameHour,
    rivel,
    teamId,
    clubId,
    clubName,
    teamName,
    home,
    difficulty,
    type,
    gameDuration,
    goalsAgainst,
    goalsFor,
  } = getGameCreateFieldsState(draft, context)

  useEffect(() => {
    const result =
      goalsFor > goalsAgainst ? 'win' : goalsFor < goalsAgainst ? 'loss' : 'draw'

    if (draft?.result === result) return

    onDraft({
      ...draft,
      result,
    })
  }, [goalsFor, goalsAgainst, draft, onDraft])

  return (
    <Box sx={sx.root(layout)}>
      <Box sx={sx.block(layout.topCols, 1.5)}>
        {isPrivatePlayer ? (
          <>
            <ClubNameField value={clubName} size="sm" readOnly />
            <TeamNameField value={teamName} size="sm" readOnly />
          </>
        ) : (
          <>
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
          </>
        )}
      </Box>

      <Divider sx={{ my: 1 }}>
        <Typography level="title-sm" sx={sx.title}>
          פרטי המשחק
        </Typography>
      </Divider>

      <Box sx={sx.block(layout.mainCols)}>
        <GameRivelField
          id="rivel"
          size="sm"
          required
          value={rivel}
          error={!!fieldErrors?.rivel}
          onChange={(value) => onDraft({ ...draft, rivel: value })}
        />

        <GameHomeSelector
          id="game_Home_Selector"
          value={home}
          size="sm"
          error={!!fieldErrors?.home}
          onChange={(value) => onDraft({ ...draft, home: value })}
        />

        <DateInputField
          label="תאריך משחק"
          required
          value={gameDate}
          onChange={(value) => onDraft({ ...draft, gameDate: value })}
          error={!!fieldErrors?.gameDate}
          size="sm"
        />

        <HourInputField
          value={gameHour}
          onChange={(value) => onDraft({ ...draft, gameHour: value })}
          size="sm"
        />
      </Box>

      <Divider sx={{ my: 1 }}>
        <Typography level="title-sm" sx={sx.title}>
          מידע נוסף
        </Typography>
      </Divider>

      <Box sx={sx.block(layout.metaCols, 1)}>
        <GameTypeSelectField
          id="gameType"
          size="sm"
          value={type}
          required
          label="סוג משחק"
          error={!!fieldErrors?.type}
          onChange={(value) => onDraft({ ...draft, type: value })}
        />

        <GameDifficultySelectField
          value={difficulty}
          size="sm"
          onChange={(value) => onDraft({ ...draft, difficulty: value })}
        />

        <GameDurationSelectField
          value={gameDuration}
          size="sm"
          required
          placeholder="משך משחק"
          error={!!fieldErrors?.gameDuration}
          onChange={(value) => onDraft({ ...draft, gameDuration: value })}
        />
      </Box>

      <Divider sx={{ my: 1 }}>
        <Typography level="title-sm" sx={sx.title}>
          תוצאת משחק
        </Typography>
      </Divider>

      <Box sx={sx.block(layout.resultCols, 1)}>
        <GoalsForField
          id="goalsFor"
          size="sm"
          value={goalsFor}
          onChange={(value) => onDraft({ ...draft, goalsFor: value })}
        />

        <GoalsAgainstField
          id="goalsAgainst"
          size="sm"
          value={goalsAgainst}
          onChange={(value) => onDraft({ ...draft, goalsAgainst: value })}
        />

        <GameChipResult size="lg" goalsFor={goalsFor} goalsAgainst={goalsAgainst} />
      </Box>
    </Box>
  )
}
