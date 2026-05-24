// src/features/liveTagging/ui/LiveObjectGameSelector.js

import React from 'react'
import {
  Box,
  Button,
  Drawer,
  ModalClose,
  Typography,
} from '@mui/joy'

import {
  LIVE_SUBJECT_TYPES,
  buildSelectionLabel,
  filterGamesBySelection,
  hasSelectedSubject,
  resolveSelectionTeamId,
} from '../logic/index.js'

import GameSelectField from '../../../ui/fields/selectUi/games/GameSelectField.js'
import PlayerSelectField from '../../../ui/fields/selectUi/players/PlayerSelectField.js'
import TeamSelectField from '../../../ui/fields/selectUi/teams/TeamSelectField.js'

import { sx } from './sx/liveTagging.sx.js'

function SelectionFields({
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
  const isPlayer = selection.subjectType === LIVE_SUBJECT_TYPES.PLAYER

  const selectedPlayer = players.find((player) => {
    return String(player?.id) === String(selection.playerId)
  })

  const selectedTeam = teams.find((team) => {
    return String(team?.id) === String(selection.teamId)
  })

  const selectedSubject = isPlayer ? selectedPlayer : selectedTeam

  const teamId = resolveSelectionTeamId({ selection, players })
  const hasSubject = hasSelectedSubject({ selection, players })

  const gameOptions = filterGamesBySelection({
    games,
    selection,
    players,
  })

  return (
    <Box sx={sx.selectionFields}>
      <Box sx={sx.selectionTypeActions}>
        <Button
          size="sm"
          variant={isPlayer ? 'solid' : 'soft'}
          color={isPlayer ? 'primary' : 'neutral'}
          disabled={disabled}
          onClick={() => onSubjectTypeChange(LIVE_SUBJECT_TYPES.PLAYER)}
        >
          שחקן
        </Button>

        <Button
          size="sm"
          variant={!isPlayer ? 'solid' : 'soft'}
          color={!isPlayer ? 'primary' : 'neutral'}
          disabled={disabled}
          onClick={() => onSubjectTypeChange(LIVE_SUBJECT_TYPES.TEAM)}
        >
          קבוצה
        </Button>
      </Box>

      {isPlayer ? (
        <PlayerSelectField
          value={selection.playerId}
          onChange={onPlayerChange}
          options={players}
          teamId={selection.teamId}
          disabled={disabled}
          label=""
          placeholder="בחר שחקן"
        />
      ) : (
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
        player={isPlayer ? selectedPlayer : null}
        team={isPlayer ? null : selectedTeam}
        teamId={teamId}
        disabled={disabled || !hasSubject}
        label=""
        placeholder={hasSubject ? 'בחר משחק' : 'בחר קודם שחקן או קבוצה'}
      />
    </Box>
  )
}

export function LiveObjectGameSelector({
  selection,
  players = [],
  teams = [],
  games = [],
  clubId = '',
  disabled = false,
  onSubjectTypeChange,
  onPlayerChange,
  onTeamChange,
  onGameChange,
}) {
  const [open, setOpen] = React.useState(false)

  const label = buildSelectionLabel({
    selection,
    players,
    teams,
    games,
  })

  const fields = (
    <SelectionFields
      selection={selection}
      players={players}
      teams={teams}
      games={games}
      clubId={clubId}
      disabled={disabled}
      onSubjectTypeChange={onSubjectTypeChange}
      onPlayerChange={onPlayerChange}
      onTeamChange={onTeamChange}
      onGameChange={onGameChange}
    />
  )

  return (
    <Box sx={sx.selectionWrap}>
      <Box
        role="button"
        tabIndex={0}
        sx={sx.selectionMobileCard(label.ready)}
        onClick={() => {
          if (!disabled) setOpen(true)
        }}
      >
        <Box>
          <Typography level="body-xs" sx={sx.mutedText}>
            {label.typeLabel}
          </Typography>

          <Typography level="title-sm" sx={sx.selectionMobileTitle}>
            {label.subjectLabel}
          </Typography>

          {label.teamLabel ? (
            <Typography level="body-xs" sx={sx.mutedText}>
              {label.teamLabel}
            </Typography>
          ) : null}
        </Box>

        <Box>
          <Typography level="body-xs" sx={sx.mutedText}>
            משחק
          </Typography>

          <Typography level="body-sm" sx={sx.selectionMobileSub}>
            {label.gameLabel}
          </Typography>
        </Box>
      </Box>

      <Box sx={sx.selectionDesktop}>
        <Typography level="body-xs" sx={sx.mutedText}>
          בחירת מדידה
        </Typography>

        {fields}
      </Box>

      <Drawer
        anchor="bottom"
        open={open}
        onClose={() => setOpen(false)}
        slotProps={{
          content: {
            sx: sx.selectionDrawer,
          },
        }}
      >
        <ModalClose />

        <Box sx={sx.selectionDrawerHead}>
          <Typography level="title-md">
            בחירת אובייקט ומשחק
          </Typography>

          <Typography level="body-sm" sx={sx.mutedText}>
            בחר שחקן או קבוצה, ואז משחק מתוך המשחקים הרלוונטיים.
          </Typography>
        </Box>

        {fields}
      </Drawer>
    </Box>
  )
}
