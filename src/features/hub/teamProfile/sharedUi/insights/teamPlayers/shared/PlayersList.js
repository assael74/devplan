// TEAMPROFILE/sharedUi/insights/teamPlayers/shared/PlayersList.js

import React from 'react'
import { Avatar, Box, Chip, Typography } from '@mui/joy'

import playerImage from '../../../../../../../ui/core/images/playerImage.jpg'
import { iconUi } from '../../../../../../../ui/core/icons/iconUi.js'

import { playersSx as sx } from './sx/players.sx.js'

const emptyArray = []

const roleIcons = {
  key: 'keyPlayer',
  core: 'corePlayer',
  rotation: 'rotation',
  fringe: 'fringe',
}

const toText = value => {
  return value == null ? '' : String(value).trim()
}

const getName = player => {
  return player.playerFullName || player.fullName || player.name || 'שחקן'
}

const getPositionLabel = player => {
  return (
    toText(player.positionLabel) ||
    toText(player.primaryPosition) ||
    '-'
  )
}

const getLayerLabel = player => {
  return (
    toText(player.layerLabel) ||
    toText(player.layerKey) ||
    'שכבה'
  )
}

const getRoleLabel = player => {
  return toText(player.squadRoleLabel) || 'מעמד'
}

const getRoleIcon = player => {
  return roleIcons[player.squadRole] || 'keyPlayer'
}

const getTvaColor = value => {
  const n = Number(value)

  if (n > 0) return 'success'
  if (n < 0) return 'warning'

  return 'neutral'
}

const normalizeSource = sourceType => {
  if (sourceType === 'role' || sourceType === 'outcomeRole') {
    return 'outcomeRole'
  }

  if (sourceType === 'position' || sourceType === 'outcomePosition') {
    return 'outcomePosition'
  }

  if (sourceType === 'buildRole') return 'buildRole'
  if (sourceType === 'buildPosition') return 'buildPosition'

  return 'build'
}

const getTopMetrics = ({ player, sourceType }) => {
  const source = normalizeSource(sourceType)

  if (!['outcomeRole', 'outcomePosition'].includes(source)) {
    return emptyArray
  }

  return [
    {
      id: 'rating',
      label: player.ratingLabel || '-',
      color: 'neutral',
    },
    {
      id: 'tva',
      label: player.tvaLabel || player.tva || '0',
      color: getTvaColor(player.tva),
    },
  ]
}

const getBuildChips = player => {
  return [
    {
      id: 'pos-icon',
      icon: player.primaryPosition || 'positions',
      label: '',
      iconOnly: true,
    },
    {
      id: 'position',
      icon: player.primaryPosition || 'positions',
      label: getPositionLabel(player),
    },
    {
      id: 'role',
      icon: getRoleIcon(player),
      label: getRoleLabel(player),
    },
  ]
}

const getOutcomeRoleChips = player => {
  return [
    {
      id: 'position',
      icon: player.primaryPosition || 'positions',
      label: getPositionLabel(player),
    },
    {
      id: 'role',
      icon: getRoleIcon(player),
      label: getRoleLabel(player),
    },
  ]
}

const getOutcomePositionChips = player => {
  return [
    {
      id: 'position',
      icon: player.primaryPosition || 'positions',
      label: getPositionLabel(player),
    },
    {
      id: 'layer',
      icon: player.layerKey || 'layers',
      label: getLayerLabel(player),
    },
  ]
}

const getFooterItems = ({ player, sourceType }) => {
  const source = normalizeSource(sourceType)

  if (source === 'outcomeRole') {
    return getOutcomeRoleChips(player)
  }

  if (source === 'outcomePosition') {
    return getOutcomePositionChips(player)
  }

  return getBuildChips(player)
}

const MiniMetric = ({ item }) => {
  return (
    <Chip
      size="sm"
      variant="soft"
      color={item.color || 'neutral'}
      sx={sx.metricChip}
    >
      {item.label}
    </Chip>
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
  const metrics = getTopMetrics({
    player,
    sourceType,
  })

  return (
    <Box sx={sx.top}>
      <Typography level="body-sm" sx={sx.name} noWrap>
        {getName(player)}
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

const PlayerCard = ({
  player,
  index,
  variant,
  sourceType,
}) => {
  const name = getName(player)
  const footerItems = getFooterItems({
    player,
    sourceType,
  })

  return (
    <Box
      key={player.id || player.playerId || `${name}-${index}`}
      sx={sx.card({
        variant,
        damage: player.damageScore,
        sourceType,
      })}
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
