// src/features/liveTagging/ui/toolbar/selection/LiveSelectionMobileCard.js

import React from 'react'
import { Avatar, Box, Typography } from '@mui/joy'

import playerImage from '../../../../../ui/core/images/playerImage.jpg'
import { getFullDateIl } from '../../../../../shared/format/dateUtiles.js'

import { selectionMobileCardSx as sx } from './sx/selectionMobileCard.sx.js'

const getPlayerName = ({ player, label }) => {
  return (player?.playerFullName || 'לא נבחר')
}

const getPlayerPhoto = player => {
  return (player?.photo || playerImage)
}

const getTeamName = ({ team, label }) => {
  return team?.teamName || 'לא נבחר'
}

const getGameOpponent = ({ game, label }) => {
  return (game?.rivel || game?.rival || 'לא נבחר משחק')
}

const getGameDate = game => {
  return getFullDateIl(game?.gameDate || '')
}

const getGameCompactText = ({ game, label }) => {
  const opponent = getGameOpponent({ game, label })
  const date = getGameDate(game)

  if (!opponent || opponent === 'לא נבחר משחק') return opponent
  if (!date) return `נגד ${opponent}`

  return `נגד ${opponent} · ${date}`
}

export function LiveSelectionMobileCard({
  label,
  player,
  team,
  game,
  disabled,
  onOpen,
}) {
  const handleOpen = () => {
    if (!disabled) onOpen()
  }

  const isPlayer = Boolean(player)
  const subjectName = isPlayer
    ? getPlayerName({ player, label })
    : getTeamName({ team, label })

  const gameText = getGameCompactText({ game, label })

  return (
    <Box
      role="button"
      tabIndex={0}
      sx={sx.selectionMobileCard(label.ready)}
      onClick={handleOpen}
      onKeyDown={event => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          handleOpen()
        }
      }}
    >
      <Box sx={sx.subjectBlock}>
        {isPlayer ? (
          <Avatar
            src={getPlayerPhoto(player)}
            sx={sx.playerAvatar}
          />
        ) : (
          <Box sx={sx.subjectIcon}>
            {label?.typeLabel?.slice(0, 1) || 'ק'}
          </Box>
        )}

        <Box sx={sx.subjectText}>
          <Typography level="body-xs" sx={sx.mutedText}>
            {label.typeLabel}
          </Typography>

          <Typography level="title-sm" sx={sx.subjectTitle}>
            {subjectName}
          </Typography>
        </Box>
      </Box>

      <Box sx={sx.gameBlock}>
        <Typography level="body-xs" sx={sx.mutedText}>
          משחק
        </Typography>

        <Typography level="body-sm" sx={sx.gameTitle}>
          {gameText}
        </Typography>
      </Box>
    </Box>
  )
}
