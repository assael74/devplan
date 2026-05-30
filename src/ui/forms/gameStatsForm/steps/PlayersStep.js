// src/ui/forms/gameStatsForm/steps/PlayersStep.js

import React from 'react'
import {
  Avatar,
  Box,
  Button,
  Checkbox,
  Chip,
  Sheet,
  Typography,
} from '@mui/joy'

import { playersStepSx as sx } from './sx/playersStep.sx.js'
import playerImage from '../../../core/images/playerImage.jpg'
import { iconUi } from '../../../core/icons/iconUi.js'

import {
  getDefaultSelectedPlayerIds,
  isStatsEligiblePlayer,
  togglePlayerId,
} from '../logic/index.js'

const isLockedPlayer = player => {
  return player?.isStatsLocked || player?.statsDisabled || player?.readOnly
}

function StepHeader({ onReset }) {
  return (
    <Box sx={sx.stepHeader}>
      <Box>
        <Typography level="title-sm">
          בחירת שחקנים
        </Typography>

        <Typography level="body-sm" color="neutral">
          בחר את השחקנים שיקבלו שדות סטטיסטיקה בטופס.
        </Typography>
      </Box>

      <Button size="sm" variant="soft" color="neutral" onClick={onReset}>
        איפוס
      </Button>
    </Box>
  )
}

function PlayerCard({ player, checked, disabled, locked, onToggle }) {
  const photo = player?.photo || playerImage
  const icon = player.isStarting ? 'isStart' : 'isSquad'
  const roleColor = player.isStarting ? 'success' : 'danger'

  const handleClick = () => {
    if (disabled || locked) return
    onToggle(player)
  }

  const handleKeyDown = event => {
    if (disabled || locked) return

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onToggle(player)
    }
  }

  return (
    <Sheet
      role="button"
      tabIndex={disabled || locked ? -1 : 0}
      variant="outlined"
      sx={sx.playerCardState({ selected: checked, disabled: disabled || locked })}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      <Box sx={sx.playerCardHead}>
        <Checkbox
          checked={checked}
          disabled={disabled || locked}
          onChange={event => {
            event.stopPropagation()
            handleClick()
          }}
          label={player.name}
        />

        <Box sx={{ flex: 1 }} />

        <Avatar aria-hidden="true" src={photo} />
      </Box>

      <Box sx={sx.playerMeta}>
        <Chip
          size="sm"
          variant="soft"
          startDecorator={iconUi({ id: icon })}
          color={roleColor}
        >
          {player.isStarting ? 'הרכב' : 'ספסל'}
        </Chip>

        <Chip size="sm" variant="soft" color={locked ? 'warning' : 'neutral'}>
          {locked ? 'נעול לעריכה' : `${player.timePlayed || 0} דק׳`}
        </Chip>
      </Box>
    </Sheet>
  )
}

export function PlayersStep({ draft, onDraft }) {
  const players = draft?.players || []
  const selectedIds = draft?.selectedPlayerIds || []
  const isPlayerScope = draft?.scope === 'player' || draft?.meta?.scope === 'player'

  const handleToggle = player => {
    if (isPlayerScope && isLockedPlayer(player)) return
    if (!isStatsEligiblePlayer(player)) return

    onDraft({
      selectedPlayerIds: togglePlayerId({
        selectedPlayerIds: selectedIds,
        playerId: player.playerId,
      }),
    })
  }

  const handleReset = () => {
    if (isPlayerScope) {
      onDraft({
        selectedPlayerIds: players.map(player => player.playerId).filter(Boolean),
      })
      return
    }

    onDraft({
      selectedPlayerIds: getDefaultSelectedPlayerIds(players),
    })
  }

  return (
    <Box sx={sx.stepContent}>
      <StepHeader onReset={handleReset} />

      <Box sx={sx.playersGrid}>
        {players.map(player => {
          const checked = selectedIds.includes(player.playerId)
          const locked = isPlayerScope && isLockedPlayer(player)
          const disabled = !isStatsEligiblePlayer(player)

          return (
            <PlayerCard
              key={player.playerId}
              player={player}
              checked={checked}
              disabled={disabled}
              locked={locked}
              onToggle={handleToggle}
            />
          )
        })}
      </Box>

      {!players.length ? (
        <Sheet variant="outlined" sx={sx.placeholder}>
          <Typography level="body-xs" color="neutral">
            לא נמצאו שחקנים ב־game.gamePlayers.
          </Typography>
        </Sheet>
      ) : null}
    </Box>
  )
}
