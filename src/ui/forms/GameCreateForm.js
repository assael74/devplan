// ui/forms/GameCreateForm.js
import React, { useEffect, useMemo } from 'react'
import { Box, FormControl, FormLabel, Input, Typography, Divider } from '@mui/joy'

import DateInputField from '../fields/dateUi/DateInputField'
import ClubSelectField from '../fields/selectUi/clubs/ClubSelectField.js';
import TeamSelectField from '../fields/selectUi/teams/TeamSelectField.js';
import GameHomeSelector from '../fields/checkUi/games/GameHomeSelector.js'
import GameDifficultySelectField from '../fields/selectUi/games/GameDifficultySelectField.js'
import GameDurationSelectField from '../fields/selectUi/games/GameDurationSelectField.js'
import GameTypeSelectField from '../fields/selectUi/games/GameTypeSelectField.js'
import GenericInputField from '../fields/inputUi/GenericInputField.js'

const clean = (v) => String(v ?? '').trim()

export default function GameCreateForm({ draft, onDraft, onValidChange, context }) {
  const gameDate = draft.gameDate ? draft.gameDate : ''
  const rivel = draft.rivel ? draft.rivel : ''
  const teamId = draft.teamId ? draft.teamId : ''
  const clubId = draft.clubId ? draft.clubId : ''

  const home = draft.home ? draft.home : ''
  const difficulty = draft.difficulty ? draft.difficulty : ''
  const type = draft.type ? draft.type : ''
  const gameDuration = draft.gameDuration ? draft.gameDuration : ''

  const validity = useMemo(() => {
    const okDate = !!clean(gameDate)
    const okRivel = !!clean(rivel)
    const okType = !!clean(type)
    const okGameDuration = !!clean(gameDuration)
    const okHome = !!clean(home)

    return {
      okRivel,
      okDate,
      okType,
      okGameDuration,
      okHome,
      isValid: okDate && okRivel && okType && okGameDuration && okHome
    }
  }, [gameDate, rivel, type, home, gameDuration])

  useEffect(() => {
    onValidChange(validity.isValid)
  }, [validity.isValid, onValidChange])

  return (
    <Box sx={{ display: 'grid', gap: 2 }}>
      <Box sx={{ display: 'grid', gap: 1.5, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' } }}>
        <ClubSelectField
          value={clubId}
          size='sm'
          options={context.clubsList}
          readOnly={true}
        />
        <TeamSelectField
          value={teamId}
          size='sm'
          options={context.teamsList}
          readOnly={true}
          clubId={clubId}
        />
      </Box>

      <Typography level="title-sm">פרטי המשחק</Typography>

      <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' } }}>
        <GenericInputField
          id="rivel"
          size='sm'
          required
          value={rivel}
          label="קבוצה יריבה"
          onChange={(v) => onDraft({ ...draft, rivel: v })}
        />
        <DateInputField
          label="תאריך משחק"
          required
          value={gameDate}
          onChange={(v) => onDraft({ ...draft, gameDate: v })}
          error={!validity.okDate && clean(gameDate).length > 0}
          size="sm"
          context="game"
        />
      </Box>

      <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: '0.5fr 1.25fr 1.25fr' } }}>
        <GameHomeSelector
          id="game_Home_Selector"
          value={home}
          size='sm'
          required
          onChange={(v) => onDraft({ ...draft, home: v })}
        />
        <GameTypeSelectField
          id="gameType"
          size='sm'
          value={type}
          required
          label="סוג משחק"
          onChange={(v) => onDraft({ ...draft, type: v })}
        />
        <GameDifficultySelectField
          value={difficulty}
          size='sm'
          onChange={(v) => onDraft({ ...draft, difficulty: v })}
        />
      </Box>

      <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: '0.75fr 1fr' } }}>
        <GameDurationSelectField
          value={gameDuration}
          size='sm'
          required
          placeholder="משך משחק בדקות"
          onChange={(v) => onDraft({ ...draft, gameDuration: v })}
        />
      </Box>
    </Box>
  )
}
