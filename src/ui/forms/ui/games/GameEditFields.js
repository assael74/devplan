// ui/forms/ui/games/GameEditFields.js

import React, { useEffect } from 'react'
import { Box, Typography, Divider } from '@mui/joy'

import DateInputField from '../../../fields/dateUi/DateInputField.js'
import HourInputField from '../../../fields/dateUi/HourInputField.js'

import ClubSelectField from '../../../fields/selectUi/clubs/ClubSelectField.js'
import ClubNameField from '../../../fields/inputUi/clubs/ClubNameField.js'
import TeamNameField from '../../../fields/inputUi/teams/TeamNameField.js'
import TeamSelectField from '../../../fields/selectUi/teams/TeamSelectField.js'

import GameHomeSelector from '../../../fields/checkUi/games/GameHomeSelector.js'
import GameDifficultySelectField from '../../../fields/selectUi/games/GameDifficultySelectField.js'
import GameDurationSelectField from '../../../fields/selectUi/games/GameDurationSelectField.js'
import GameTypeSelectField from '../../../fields/selectUi/games/GameTypeSelectField.js'
import GameStatusSelectField from '../../../fields/selectUi/games/GameStatusSelectField.js'


import GameRivelField from '../../../fields/inputUi/games/GameRivelField.js'
import GameLeagueNumField from '../../../fields/inputUi/games/GameLeagueNumField.js'
import GoalsForField from '../../../fields/inputUi/games/GoalsForField.js'
import GoalsAgainstField from '../../../fields/inputUi/games/GoalsAgainstField.js'
import GameVideoLinkField from '../../../fields/inputUi/games/GameVideoLinkField.js'

import GameChipResult from './GameChipResult.js'

import { createSx as sx } from './sx/create.sx.js'

const GAME_STATUS_PLAYED = 'played'
const GAME_STATUS_SCHEDULED = 'scheduled'

const resolveResult = ({ goalsFor, goalsAgainst }) => {
  const gf = Number(goalsFor)
  const ga = Number(goalsAgainst)

  if (!Number.isFinite(gf) || !Number.isFinite(ga)) return ''
  if (gf > ga) return 'win'
  if (gf < ga) return 'loss'

  return 'draw'
}

function getGameEditFieldsState(draft = {}, context = {}) {
  return {
    gameDate: draft?.gameDate || '',
    gameHour: draft?.gameHour || '',
    rivel: draft?.rivel || '',

    teamId: draft?.teamId || '',
    clubId: draft?.clubId || '',
    clubName: draft?.clubName || context?.player?.clubName || '',
    teamName: draft?.teamName || context?.player?.teamName || '',

    gameLeagueNum: draft?.gameLeagueNum ?? '',
    home: draft?.home ?? '',
    difficulty: draft?.difficulty || '',
    type: draft?.type || '',
    gameDuration: draft?.gameDuration || '',
    gameStatus: draft?.gameStatus || GAME_STATUS_SCHEDULED,

    goalsAgainst: draft?.goalsAgainst ?? 0,
    goalsFor: draft?.goalsFor ?? 0,

    vLink: draft?.vLink || '',
  }
}

export default function GameEditFields({
  draft = {},
  onDraft,
  context = {},
  fieldErrors = {},
  layout,
  isPrivatePlayer = false,
}) {
  const {
    gameLeagueNum,
    gameDuration,
    goalsAgainst,
    difficulty,
    gameStatus,
    goalsFor,
    clubName,
    teamName,
    gameDate,
    gameHour,
    teamId,
    clubId,
    rivel,
    vLink,
    type,
    home,
  } = getGameEditFieldsState(draft, context)

  useEffect(() => {
    if (gameStatus !== GAME_STATUS_PLAYED) {
      if (!draft?.result) return

      onDraft({
        ...draft,
        result: '',
      })

      return
    }

    const result = resolveResult({
      goalsFor,
      goalsAgainst,
    })

    if (draft?.result === result) return

    onDraft({
      ...draft,
      result,
    })
  }, [gameStatus, goalsFor, goalsAgainst, draft, onDraft])

  return (
    <Box sx={sx.root(layout)}>
      <Box sx={sx.block(layout.topCols, 1.5)}>
        {isPrivatePlayer ? (
          <>
            <Box sx={{ minWidth: 0 }}>
              <ClubNameField value={clubName} size="sm" readOnly />
            </Box>

            <Box sx={{ minWidth: 0 }}>
              <TeamNameField value={teamName} size="sm" readOnly />
            </Box>
          </>
        ) : (
          <>
            <Box sx={{ minWidth: 0 }}>
              <ClubSelectField
                value={clubId}
                size="sm"
                options={context?.clubs || []}
                disabled
              />
            </Box>

            <Box sx={{ minWidth: 0 }}>
              <TeamSelectField
                value={teamId}
                size="sm"
                options={context?.teams || []}
                disabled
                clubId={clubId}
              />
            </Box>
          </>
        )}
      </Box>

      <Divider sx={{ my: 1 }}>
        <Typography level="title-sm" sx={sx.title}>
          פרטי המשחק
        </Typography>
      </Divider>

      <Box sx={sx.block(layout.resultCols)}>
        <Box sx={{ minWidth: 0 }}>
          <GameRivelField
            id="rivel"
            size="sm"
            required
            value={rivel}
            error={!!fieldErrors?.rivel}
            onChange={(value) => onDraft({ ...draft, rivel: value })}
          />
        </Box>

        <Box sx={{ minWidth: 0 }}>
          <GameLeagueNumField
            id="game_Num"
            value={gameLeagueNum}
            size="sm"
            onChange={(value) => onDraft({ ...draft, gameLeagueNum: value })}
          />
        </Box>

        <Box sx={{ minWidth: 0 }}>
          <GameHomeSelector
            id="game_Home_Selector"
            value={home}
            size="sm"
            error={!!fieldErrors?.home}
            onChange={(value) => onDraft({ ...draft, home: value })}
          />
        </Box>
      </Box>

      <Divider sx={{ my: 1 }}>
        <Typography level="title-sm" sx={sx.title}>
          זמן משחק
        </Typography>
      </Divider>

      <Box sx={sx.block(layout.mainCols)}>
        <Box sx={{ minWidth: 0 }}>
          <DateInputField
            label="תאריך משחק"
            required
            value={gameDate}
            onChange={(value) => onDraft({ ...draft, gameDate: value })}
            error={!!fieldErrors?.gameDate}
            size="sm"
          />
        </Box>

        <Box sx={{ minWidth: 0 }}>
          <HourInputField
            value={gameHour}
            onChange={(value) => onDraft({ ...draft, gameHour: value })}
            size="sm"
          />
        </Box>
      </Box>

      <Divider sx={{ my: 1 }}>
        <Typography level="title-sm" sx={sx.title}>
          מידע נוסף
        </Typography>
      </Divider>

      <Box sx={sx.block(layout.metaCols, 1)}>
        <Box sx={{ minWidth: 0 }}>
          <GameTypeSelectField
            id="gameType"
            size="sm"
            value={type}
            required
            label="סוג משחק"
            error={!!fieldErrors?.type}
            onChange={(value) => onDraft({ ...draft, type: value })}
          />
        </Box>

        <Box sx={{ minWidth: 0 }}>
          <GameDifficultySelectField
            value={difficulty}
            size="sm"
            onChange={(value) => onDraft({ ...draft, difficulty: value })}
          />
        </Box>

        <Box sx={{ minWidth: 0 }}>
          <GameDurationSelectField
            value={gameDuration}
            size="sm"
            required
            placeholder="משך משחק"
            error={!!fieldErrors?.gameDuration}
            onChange={(value) => onDraft({ ...draft, gameDuration: value })}
          />
        </Box>

        <Box sx={{ minWidth: 0 }}>
          <GameStatusSelectField
            value={gameStatus}
            size="sm"
            label="סטטוס משחק"
            onChange={(value) => {
              const nextStatus = value || GAME_STATUS_SCHEDULED

              onDraft({
                ...draft,
                gameStatus: nextStatus,
                result:
                  nextStatus === GAME_STATUS_PLAYED
                    ? resolveResult({ goalsFor, goalsAgainst })
                    : '',
              })
            }}
          />
        </Box>
      </Box>

      <Divider sx={{ my: 1 }}>
        <Typography level="title-sm" sx={sx.title}>
          תוצאת משחק
        </Typography>
      </Divider>

      <Box sx={sx.block(layout.resultCols, 1)}>
        <Box sx={{ minWidth: 0 }}>
          <GoalsForField
            id="goalsFor"
            size="sm"
            value={goalsFor}
            onChange={(value) => onDraft({ ...draft, goalsFor: value })}
          />
        </Box>

        <Box sx={{ minWidth: 0 }}>
          <GoalsAgainstField
            id="goalsAgainst"
            size="sm"
            value={goalsAgainst}
            onChange={(value) => onDraft({ ...draft, goalsAgainst: value })}
          />
        </Box>

        <Box sx={{ minWidth: 0 }}>
          <GameChipResult
            size="lg"
            goalsFor={goalsFor}
            goalsAgainst={goalsAgainst}
          />
        </Box>
      </Box>

      <Divider sx={{ my: 1 }}>
        <Typography level="title-sm" sx={sx.title}>
          וידאו
        </Typography>
      </Divider>

      <Box sx={sx.block({ xs: '1fr' }, 1)}>
        <Box sx={{ minWidth: 0 }}>
          <GameVideoLinkField
            value={vLink}
            onChange={(value) => {
              onDraft({
                ...draft,
                vLink: value || '',
              })
            }}
          />
        </Box>
      </Box>
    </Box>
  )
}
