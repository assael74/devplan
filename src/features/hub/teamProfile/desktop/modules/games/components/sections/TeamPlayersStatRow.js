// teamProfile/desktop/modules/games/components/sections/TeamPlayersStatRow.js

import React from 'react'
import { Box, Chip, Typography, Avatar, Tooltip } from '@mui/joy'
import { sectionsSx as sx } from './sx/sections.sx.js'

import playerImage from '../../../../../../../../ui/core/images/playerImage.jpg'

export default function TeamPlayersStatRow({ title, players, statKey }) {
  const list = Array.isArray(players) ? players : []
  const visibleList = list.slice(0, 4)
  const visibleCount = visibleList.length

  const renderEmpty = () => (
    <Typography level="body-xs" sx={sx.titleSx}>
      לא נרשמו
    </Typography>
  )

  const renderPlayerChip = (player, visibleCount) => {
    const value = statKey === 'goals' ? player?.goals : player?.assists
    const verb = statKey === 'goals' ? 'כבש' : 'בישל'
    const tooltip = `${player?.playerFullName || 'שחקן'} ${verb} ${value || 0}`
    const photo = player?.photo || playerImage

    return (
      <Tooltip key={player?.playerId || player?.id} arrow title={tooltip}>
        <Chip
          size="sm"
          variant="soft"
          sx={sx.chip(visibleCount)}
          startDecorator={<Avatar src={photo} sx={{ width: 16, height: 16, flex: '0 0 auto' }} />}
          endDecorator={
            <Typography level="body-sm" sx={{ fontSize: 12, pl: 0.5, flex: '0 0 auto' }}>
              {value || 0}
            </Typography>
          }
         >
          <Typography level="body-sm" sx={sx.chipText}>
            {player?.playerFullName || 'שחקן'}
          </Typography>
        </Chip>
      </Tooltip>
    )
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Typography level="title-sm" sx={sx.titleSx}>
        {title}
      </Typography>

      {!list.length ? (
        renderEmpty()
      ) : (
        <Box sx={sx.emptyList}>
          {visibleList.map(player => renderPlayerChip(player, visibleCount))}

          {list.length > 4 && (
            <Chip size="sm" variant="plain" sx={sx.moreChip}>
              +{list.length - 4}
            </Chip>
          )}
        </Box>
      )}
    </Box>
  )
}
