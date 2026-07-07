// features/playersDatabase/components/profilesPage/list/PlayerResult.js

import React from 'react'
import { Avatar, Box, Typography } from '@mui/joy'

import PositionCube from './PositionCube.js'
import TeamTooltip from './TeamTooltip.js'
import PlayerNoteTooltip from './PlayerNoteTooltip.js'
import { iconUi } from '../../../../../ui/core/icons/iconUi.js'
import { getPlayerPositionInfo, getPlayerUrls } from './logic/player.logic.js'
import playerImage from '../../../../../ui/core/images/playerImage.jpg'
import { playerSx as sx } from './sx/player.sx.js'

function resolveValue(...values) {
  const value = values.find(item => item !== undefined && item !== null && item !== '')
  return value === undefined ? '-' : value
}

function getPositionLabel(positionInfo) {
  const layerLabel = positionInfo.layerLabel && positionInfo.layerLabel !== '-' ? positionInfo.layerLabel : ''
  const primaryPosition = positionInfo.primaryPosition || ''

  if (layerLabel && primaryPosition) return `${layerLabel} - ${primaryPosition}`
  return layerLabel || primaryPosition || '-'
}

function InlineEntityLink({ href, children, level = 'body-xs' }) {
  const textSx = level === 'title-sm' ? sx.rowTitle : sx.entityText

  if (!href) {
    return (
      <Typography level={level} sx={textSx}>
        {children}
      </Typography>
    )
  }

  return (
    <Box
      component="a"
      href={href}
      target="_blank"
      rel="noreferrer"
      sx={sx.entityLink}
      onClick={event => event.stopPropagation()}
    >
      <Typography level={level} sx={textSx}>
        {children}
      </Typography>
    </Box>
  )
}

function StatCell({ label, value, sx: sxOverride }) {
  return (
    <Box sx={[sx.statCellCompact, sxOverride]}>
      <Typography level="body-xs" sx={sx.statLabelCompact}>
        {label}
      </Typography>

      <Typography level="body-sm" sx={sx.statValueCompact}>
        {value}
      </Typography>
    </Box>
  )
}

export default function PlayerResult({ player, selected = false, loading = false, onClick }) {
  const urls = getPlayerUrls(player)
  const current = player.current || {}
  const positionInfo = getPlayerPositionInfo(player)
  const playerName = player.fullName || player.playerName || player.name || '-'
  const leagueName = player.leagueName || '-'
  const teamName = player.clubName || player.teamName || '-'
  const year = player.birthYear || player.teamBirthYear || '-'
  const games = resolveValue(current.games, player.games)
  const starts = resolveValue(current.starts, player.starts)
  const minutes = resolveValue(current.minutes, player.minutes)
  const goals = resolveValue(current.goals, player.goals)
  const yellowCards = resolveValue(current.yellowCards, player.yellowCards)
  const shirtNumber = resolveValue(
    player.numShirt,
    player.shirtNumber,
    player.statsDoc?.numShirt,
    player.statsDoc?.shirtNumber,
    player.playerSeason?.numShirt,
    player.playerSeason?.shirtNumber,
  )
  const positionLabel = getPositionLabel(positionInfo)

  return (
    <Box
      sx={[
        sx.row,
        selected ? sx.rowSelected : null,
        loading ? sx.rowLoading : null,
        onClick ? sx.rowClickable : sx.rowStatic,
      ]}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <Box sx={sx.mainCompact}>
        <Box sx={sx.identityCellCompact}>
          <Avatar src={player.photo || playerImage} alt={playerName} sx={sx.avatarCompact} />

          <Box sx={sx.identityTextCompact}>
            <Box sx={sx.identityHeadlineRow}>
              <InlineEntityLink href={urls.playerUrl} level="title-sm">
                {playerName}
              </InlineEntityLink>

              <PlayerNoteTooltip player={player} />

              {loading ? (
                <Box sx={sx.rowLoadingBadge}>
                  <Typography level="body-xs" sx={sx.rowLoadingText}>
                    טוען
                  </Typography>
                </Box>
              ) : null}
            </Box>

            <Box sx={sx.subtextCompact}>
              <InlineEntityLink href={urls.leagueUrl}>{leagueName}</InlineEntityLink>

              <Box component="span" sx={sx.subtextDividerCompact}>
                |
              </Box>

              <Box component="span" sx={sx.teamInlineInfo}>
                <InlineEntityLink href={urls.teamUrl}>{teamName}</InlineEntityLink>
                <TeamTooltip player={player} teamName={teamName} />
              </Box>

              <Box component="span" sx={sx.subtextDividerCompact}>
                |
              </Box>

              <Typography level="body-xs" sx={sx.entityText}>
                {year}
              </Typography>
            </Box>
          </Box>
        </Box>

        <Box sx={sx.statsTableCompact}>
          <StatCell label="דק'" value={minutes} />
          <StatCell label="שערים" value={goals} sx={sx.statCellGoals} />
          <StatCell label="צהובים" value={yellowCards} />
          <StatCell label="פתח" value={`${starts}/${games}`} />
        </Box>

        <PositionCube
          shirtNumber={shirtNumber}
          position={positionLabel}
          missingDocumentLayer={positionInfo.missingDocumentLayer}
        />
      </Box>
    </Box>
  )
}
