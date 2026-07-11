// src/features/hub/teamProfile/sharedUi/players/print/ReportParts.js

import React from 'react'
import { Avatar, Box, Chip, Typography } from '@mui/joy'

import { iconUi } from '../../../../../../ui/core/icons/iconUi.js'
import playerImage from '../../../../../../ui/core/images/playerImage.jpg'

export function TableColumns({ columns = [] }) {
  return (
    <colgroup>
      {columns.map(column => (
        <col
          key={column.key}
          style={{ width: column.width }}
        />
      ))}
    </colgroup>
  )
}

export function TableHead({ columns = [], styles = {} }) {
  return (
    <Box component='thead'>
      <Box component='tr'>
        {columns.map(column => (
          <Box
            key={column.key}
            component='th'
            sx={styles.th}
          >
            {column.label}
          </Box>
        ))}
      </Box>
    </Box>
  )
}

export function PlayerCell({ row, styles = {} }) {
  return (
    <Box sx={styles.playerCell}>
      <Avatar
        src={row.photo || playerImage}
        sx={styles.avatar}
      />

      <Box sx={styles.playerText}>
        <Typography component='span' sx={styles.playerName}>
          {row.playerFullName}
        </Typography>

        <Typography component='span' sx={styles.playerSubline}>
          {row.subline}
        </Typography>
      </Box>
    </Box>
  )
}

export function PositionChips({ positions = [], styles = {} }) {
  if (!positions.length) return null

  return (
    <Box sx={styles.positionChips}>
      {positions.map(position => (
        <Chip
          key={position}
          size='sm'
          variant='soft'
          color='primary'
          startDecorator={iconUi({id: position, size: 'xs'})}
          sx={styles.positionChip}
        />
      ))}
    </Box>
  )
}
