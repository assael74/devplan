import React from 'react'
import { Avatar, Box, Sheet, Typography } from '@mui/joy'

import playerImage from '../../../../../../ui/core/images/playerImage.jpg'
import { previewToolbarSx as sx } from './toolbar.sx.js'

function getToolbarStage(stage, player) {
  if (stage === 'selection' && player) return 'selection'
  if (stage === 'player' && player) return 'selection'
  if (stage === 'primary') return 'primary'

  return 'initial'
}

function getPrimaryTitle({ title, searchMode, leagueLevelsCount, yearsCount }) {
  if (title) return title

  if (searchMode === 'league') {
    return `קיימות ${leagueLevelsCount} רמות ליגה`
  }

  if (searchMode === 'year') {
    return `יש ${yearsCount} שנתונים במערכת`
  }

  return 'בחר סוג חיפוש'
}

function getPrimarySubtitle({ subtitle, searchMode }) {
  if (subtitle) return subtitle

  if (searchMode === 'league') return 'בחר רמת ליגה להצגת פרופילים'
  if (searchMode === 'year') return 'בחר שנתון להצגת פרופילים'

  return 'לא נבחר סוג חיפוש'
}

function getPlayerName(player) {
  return (
    player?.fullName ||
    player?.playerName ||
    player?.name ||
    player?.title ||
    '-'
  )
}

function PreviewInitialContent() {
  return (
    <Typography level="body-sm" sx={sx.subtitleInitial}>
      בחר סוג חיפוש כדי להתחיל
    </Typography>
  )
}

function PreviewPrimaryContent({ title, subtitle }) {
  return (
    <Box sx={sx.primaryContent}>
      <Typography level="body-md" sx={sx.stageTitle}>
        {title}
      </Typography>

      <Typography level="body-sm" sx={sx.subtitle}>
        {subtitle}
      </Typography>
    </Box>
  )
}

function PreviewSelectionContent({ player }) {
  const playerName = getPlayerName(player)
  const playerLeague = player?.leagueName || '-'
  const playerTeam = player?.clubName || player?.teamName || '-'
  const playerYear = player?.birthYear || player?.teamBirthYear || '-'

  return (
    <Box sx={sx.playerRow}>
      <Avatar
        src={player?.photo || playerImage}
        alt={playerName}
        sx={sx.playerAvatar}
      />

      <Box sx={sx.playerText}>
        <Typography sx={sx.playerName}>
          {playerName}
        </Typography>

        <Typography sx={sx.playerSubline}>
          {playerLeague} {' | '} {playerTeam} {' | '} {playerYear}
        </Typography>
      </Box>
    </Box>
  )
}

export default function PreviewToolbar({
  player,
  stage = 'initial',
  searchMode = 'all',
  title = '',
  subtitle = '',
  leagueLevelsCount = 0,
  yearsCount = 0,
  disabled = false,
}) {
  const toolbarStage = getToolbarStage(stage, player)

  const primaryTitle = getPrimaryTitle({
    title,
    searchMode,
    leagueLevelsCount,
    yearsCount,
  })

  const primarySubtitle = getPrimarySubtitle({
    subtitle,
    searchMode,
  })

  return (
    <Sheet sx={sx.root} aria-disabled={disabled || undefined}>
      <Box sx={sx.textBlock}>
        {toolbarStage === 'initial' ? (
          <PreviewInitialContent />
        ) : null}

        {toolbarStage === 'primary' ? (
          <PreviewPrimaryContent
            title={primaryTitle}
            subtitle={primarySubtitle}
          />
        ) : null}

        {toolbarStage === 'selection' ? (
          <PreviewSelectionContent player={player} />
        ) : null}
      </Box>
    </Sheet>
  )
}
