// src/features/liveTagging/ui/toolbar/selection/LiveSelectionFields.js

import React from 'react'
import { Box } from '@mui/joy'

import {
  LIVE_SUBJECT_TYPES,
  filterGamesBySelection,
  getPlayersBySubjectType,
  hasSelectedSubject,
  isAnyPlayerSelection,
  isTeamSelection,
  resolveSelectionTeamId,
} from '../../../logic/index.js'

import GameSelectField from '../../../../../ui/fields/selectUi/games/GameSelectField.js'
import PlayerSelectField from '../../../../../ui/fields/selectUi/players/PlayerSelectField.js'
import TeamSelectField from '../../../../../ui/fields/selectUi/teams/TeamSelectField.js'

import { LiveSubjectTypeButtons } from './LiveSubjectTypeButtons.js'
import { selectionFieldsSx as sx } from './sx/selectionFields.sx.js'

export function LiveSelectionFields({
  selection,
  players,
  teams,
  games,
  clubId,
  disabled,
  onSubjectTypeChange,
  onPlayerChange,
  onTeamChange,
  onGameChange,
}) {
  const isTeam = isTeamSelection(selection)
  const isAnyPlayer = isAnyPlayerSelection(selection)

  const playerOptions = getPlayersBySubjectType({
    players,
    subjectType: selection.subjectType,
  })

  const selectedPlayer = playerOptions.find(player => {
    return String(player?.id) === String(selection.playerId)
  })

  const selectedTeam = teams.find(team => {
    return String(team?.id) === String(selection.teamId)
  })

  const selectedSubject = isTeam ? selectedTeam : selectedPlayer
  const teamId = resolveSelectionTeamId({ selection, players })
  const hasSubject = hasSelectedSubject({ selection, players })

  const gameOptions = filterGamesBySelection({
    games,
    selection,
    players,
  })

  const playerPlaceholder =
    selection.subjectType === LIVE_SUBJECT_TYPES.PRIVATE_PLAYER
      ? 'בחר שחקן פרטי'
      : selection.subjectType === LIVE_SUBJECT_TYPES.SCOUT_PLAYER
        ? 'שחקן במעקב'
        : 'בחר שחקן'

  return (
    <Box sx={sx.selectionFields}>
      <LiveSubjectTypeButtons
        value={selection.subjectType}
        disabled={disabled}
        onChange={onSubjectTypeChange}
      />

      {isAnyPlayer && (
        <PlayerSelectField
          value={selection.playerId}
          onChange={onPlayerChange}
          options={playerOptions}
          teamId={selection.teamId}
          disabled={disabled || selection.subjectType === LIVE_SUBJECT_TYPES.SCOUT_PLAYER}
          label=""
          placeholder={playerPlaceholder}
        />
      )}

      {isTeam && (
        <TeamSelectField
          value={selection.teamId}
          onChange={onTeamChange}
          options={teams}
          clubId={clubId}
          disabled={disabled}
          label=""
          placeholder="בחר קבוצה"
        />
      )}

      <GameSelectField
        value={selection.gameId}
        onChange={onGameChange}
        options={gameOptions}
        subject={selectedSubject}
        subjectType={selection.subjectType}
        player={isAnyPlayer ? selectedPlayer : null}
        team={isTeam ? selectedTeam : null}
        teamId={teamId}
        disabled={disabled || !hasSubject}
        label=""
        pickerMode="createStats"
        disableAlreadyInGame={false}
        placeholder="בחירת משחק"
      />
    </Box>
  )
}
