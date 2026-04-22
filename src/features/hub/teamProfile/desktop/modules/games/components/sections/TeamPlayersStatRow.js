import React from 'react'
import { Box, Chip, Typography, Avatar, Tooltip } from '@mui/joy'
import { sectionsSx as sx } from '../../sx/sections.sx.js'

export default function TeamPlayersStatRow({ title, players, statKey }) {
  const list = Array.isArray(players) ? players : []

  const renderEmpty = () => (
    <Typography level="body-xs" sx={sx.titleSx}>
      לא נרשמו
    </Typography>
  )

  const renderPlayerChip = (player) => {
    const value = statKey === 'goals' ? player?.goals : player?.assists
    const verb = statKey === 'goals' ? 'כבש' : 'בישל'
    const tooltip = `${player?.playerFullName || 'שחקן'} ${verb} ${value || 0}`

    return (
      <Tooltip key={player?.playerId || player?.id} arrow title={tooltip}>
        <Chip
          size="sm"
          variant="soft"
          sx={{ maxWidth: 80, overflow: 'hidden' }}
          startDecorator={<Avatar src={player?.photo} sx={{ width: 18, height: 18 }} />}
          endDecorator={
            <Typography level="body-sm" sx={{ fontSize: 11, pl: 0.5 }}>
              {value || 0}
            </Typography>
          }
        >
          <Typography
            level="body-xs"
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              minWidth: 0,
            }}
          >
            {player?.playerFullName || 'ללא שם'}
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
        <Box
          sx={{
            display: 'flex',
            gap: 0.5,
            overflow: 'hidden',
            maxWidth: '100%',
          }}
        >
          {list.slice(0, 4).map(renderPlayerChip)}

          {list.length > 4 && (
            <Chip size="sm" variant="plain">
              +{list.length - 4}
            </Chip>
          )}
        </Box>
      )}
    </Box>
  )
}
