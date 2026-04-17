// preview/previewDomainCard/domains/player/games/components/PlayerGamesTable.js

import React, { useMemo, useState } from 'react'
import { Box, Sheet, Typography } from '@mui/joy'

import PlayerGamesRow from './PlayerGamesRow.js'
import PlayerGameEmpty from './PlayerGameEmpty.js'

import { iconUi } from '../../../../../../../../../../ui/core/icons/iconUi.js'
import { tableSx as sx } from '../sx/playerGamesTable.sx.js'

export default function PlayerGamesTable({ rows = [], onEditGame }) {
  const [dateSort, setDateSort] = useState('desc')

  const sortedRows = useMemo(() => {
    const list = [...rows]

    list.sort((a, b) => {
      const da = new Date(a?.dateRaw || 0).getTime()
      const db = new Date(b?.dateRaw || 0).getTime()

      return dateSort === 'asc' ? da - db : db - da
    })

    return list
  }, [rows, dateSort])

  const toggleDateSort = () => {
    setDateSort((s) => (s === 'asc' ? 'desc' : 'asc'))
  }

  return (
    <Sheet variant="plain" sx={sx.tableWrapSx}>
      <Box sx={sx.headRowSx}>
        <Typography
          level="title-sm"
          sx={{ ...sx.headTextSx, cursor: 'pointer' }}
          onClick={toggleDateSort}
          startDecorator={iconUi({ id: dateSort === 'desc' ? 'sortUp' : 'sortDown' })}
        >
          תאריך
        </Typography>

        <Typography level="title-sm" sx={sx.headTextSx}>יריב</Typography>
        <Typography level="title-sm" sx={sx.headTextSx}>בית/חוץ</Typography>
        <Typography level="title-sm" sx={sx.headTextSx}>תוצאה</Typography>
        <Typography level="title-sm" sx={sx.headTextSx}>סטטוס</Typography>
        <Typography level="title-sm" sx={sx.headTextSx}>דקות</Typography>
        <Typography level="title-sm" sx={sx.headTextSx}>שערים</Typography>
        <Typography level="title-sm" sx={sx.headTextSx}>בישולים</Typography>
        <Typography level="title-sm" sx={sx.headTextSx}></Typography>
      </Box>

      {!sortedRows.length ? (
        <PlayerGameEmpty />
      ) : (
        sortedRows.map((row) => (
          <PlayerGamesRow
            key={row.id}
            row={row}
            onEdit={() => onEditGame(row)}
          />
        ))
      )}
    </Sheet>
  )
}
