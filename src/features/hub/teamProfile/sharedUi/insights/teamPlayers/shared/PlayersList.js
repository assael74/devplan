// TEAMPROFILE/sharedUi/insights/teamPlayers/shared/PlayersList.js

import React from 'react'
import { Avatar, Box, Chip, Typography } from '@mui/joy'

import { ScoringInfoTooltip } from '../../../../../../../ui/patterns/scoring/index.js'

import playerImage from '../../../../../../../ui/core/images/playerImage.jpg'
import { iconUi } from '../../../../../../../ui/core/icons/iconUi.js'

import { playersSx as sx } from './sx/players.sx.js'

import {
  emptyArray,
  getMetricSolidColor,
  getPlayerFooterItems,
  getPlayerName,
  getPlayerTopMetrics,
  getScoringMetricByItemId,
} from './ui/index.js'

const MiniMetric = ({ item }) => {
  const color = getMetricSolidColor(item)
  const metric = getScoringMetricByItemId(item?.id)

  const chip = (
    <Chip
      size="sm"
      variant="soft"
      color="neutral"
      sx={sx.metricChip(color)}
    >
      {item.label}
    </Chip>
  )

  if (!metric) return chip

  return (
    <ScoringInfoTooltip
      metric={metric}
      mode="short"
      placement="top"
      triggerSx={{ display: 'inline-flex', minWidth: 0 }}
    >
      {chip}
    </ScoringInfoTooltip>
  )
}

const FooterChip = ({ item }) => {
  if (item.iconOnly) {
    return (
      <Chip
        size="sm"
        variant="soft"
        color="neutral"
        sx={sx.iconChip}
      >
        {iconUi({ id: item.icon, size: 'xs' })}
      </Chip>
    )
  }

  return (
    <Chip
      size="sm"
      variant="soft"
      color="neutral"
      startDecorator={iconUi({ id: item.icon, size: 'xs' })}
      sx={sx.chip}
    >
      {item.label}
    </Chip>
  )
}

const CardTop = ({ player, sourceType }) => {
  const metrics = getPlayerTopMetrics({
    player,
    sourceType,
  })

  return (
    <Box sx={sx.top}>
      <Typography level="body-sm" sx={sx.name} noWrap>
        {getPlayerName(player)}
      </Typography>

      {metrics.length ? (
        <Box sx={sx.metrics}>
          {metrics.map(item => (
            <MiniMetric key={item.id} item={item} />
          ))}
        </Box>
      ) : null}
    </Box>
  )
}

const PlayerCard = ({ player, index, variant, sourceType }) => {
  const name = getPlayerName(player)

  const footerItems = getPlayerFooterItems({
    player,
    sourceType,
  })

  return (
    <Box
      key={player.id || player.playerId || `${name}-${index}`}
      sx={sx.card({ variant, damage: player.damageScore, sourceType })}
    >
      <Avatar size="sm" src={player.photo || playerImage} />

      <Box sx={sx.text}>
        <CardTop
          player={player}
          sourceType={sourceType}
        />

        <Box sx={sx.meta}>
          {footerItems.map(item => (
            <FooterChip key={item.id} item={item} />
          ))}
        </Box>
      </Box>
    </Box>
  )
}

export default function PlayersList({
  players = emptyArray,
  title,
  emptyText = 'אין שחקנים להצגה.',
  limit = 8,
  sourceType = 'build',
  variant = 'ok',
}) {
  const safePlayers = Array.isArray(players) ? players : emptyArray
  const visible = safePlayers.slice(0, limit)
  const hidden = Math.max(safePlayers.length - limit, 0)

  if (!safePlayers.length) {
    return (
      <Typography level="body-xs" sx={sx.empty}>
        {emptyText}
      </Typography>
    )
  }

  return (
    <Box sx={sx.root}>
      {title ? (
        <Typography level="title-sm" sx={sx.title}>
          {title}
        </Typography>
      ) : null}

      <Box sx={sx.grid}>
        {visible.map((player, index) => (
          <PlayerCard
            key={player.id || player.playerId || index}
            player={player}
            index={index}
            variant={variant}
            sourceType={sourceType}
          />
        ))}

        {hidden ? (
          <Chip size="sm" variant="soft" color="neutral" sx={sx.moreChip}>
            +{hidden}
          </Chip>
        ) : null}
      </Box>
    </Box>
  )
}
