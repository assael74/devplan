// src/features/liveTagging/ui/toolbar/selection/LiveObjectGameSelector.js

import React from 'react'
import {
  Box,
  Button,
  Drawer,
  ModalClose,
  Typography,
} from '@mui/joy'

import {
  buildSelectionLabel,
  getPlayersBySubjectType,
  isAnyPlayerSelection,
  isTeamSelection,
} from '../../../logic/index.js'

import { LiveSelectionFields } from './LiveSelectionFields.js'
import { LiveSelectionMobileCard } from './LiveSelectionMobileCard.js'
import { selectorSx as sx } from './sx/selector.sx.js'

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

  const isAnyPlayer = isAnyPlayerSelection(selection)
  const isTeam = isTeamSelection(selection)

  const playerOptions = getPlayersBySubjectType({
    players,
    subjectType: selection.subjectType,
  })

  const selectedPlayer = isAnyPlayer
    ? playerOptions.find(player => String(player?.id) === String(selection.playerId)) || null
    : null

  const selectedTeam = isTeam
    ? teams.find(team => String(team?.id) === String(selection.teamId)) || null
    : null

  const selectedGame = games.find(game => {
    return String(game?.id || game?.gameId) === String(selection.gameId)
  }) || null

  const closeDrawer = () => setOpen(false)

  const fields = (
    <LiveSelectionFields
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
      <LiveSelectionMobileCard
        label={label}
        selection={selection}
        player={selectedPlayer}
        team={selectedTeam}
        game={selectedGame}
        disabled={disabled}
        onOpen={() => setOpen(true)}
      />

      <Box sx={sx.selectionDesktop}>
        <Typography level="body-xs" sx={sx.mutedText}>
          בחירת מדידה
        </Typography>

        {fields}
      </Box>

      <Drawer
        anchor="bottom"
        open={open}
        onClose={closeDrawer}
        slotProps={{
          content: {
            sx: sx.selectionDrawer,
          },
        }}
      >
        <ModalClose />

        <Box sx={sx.selectionDrawerInner}>
          <Box sx={sx.selectionDrawerHead}>
            <Typography level="title-md" sx={sx.selectionDrawerTitle}>
              בחירת אובייקט ומשחק
            </Typography>

            <Typography level="body-sm" sx={sx.mutedText}>
              בחר סוג מדידה, אובייקט רלוונטי ומשחק.
            </Typography>
          </Box>

          {fields}

          <Box sx={sx.selectionDrawerFooter}>
            <Button
              fullWidth
              size="lg"
              variant="solid"
              color="primary"
              disabled={!label.ready}
              onClick={closeDrawer}
              sx={sx.selectionConfirmButton}
            >
              אישור בחירה
            </Button>
          </Box>
        </Box>
      </Drawer>
    </Box>
  )
}
