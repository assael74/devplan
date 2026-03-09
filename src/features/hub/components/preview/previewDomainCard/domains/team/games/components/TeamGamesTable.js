// // preview/previewDomainCard/domains/team/games/components/TeamGamesTable.js

import React, { useMemo, useState } from 'react'
import { Box, Sheet, Typography } from '@mui/joy'

import TeamGamesRow from './TeamGamesRow.js'
import TeamGamesEmpty from './TeamGamesEmpty.js'

import { iconUi } from '../../../../../../../../../ui/core/icons/iconUi.js'
import { tableSx as sx } from '../sx/teamGamesTable.sx.js'

export default function TeamGamesTable({ rows = [], onEditGame }) {

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
          startDecorator={iconUi({id: dateSort === 'desc' ? 'sortUp' : 'sortDown' })}
        >
          תאריך
        </Typography>

        <Typography level="title-sm" sx={sx.headTextSx}>יריב</Typography>
        <Typography level="title-sm" sx={sx.headTextSx}>בית/חוץ</Typography>
        <Typography level="title-sm" sx={sx.headTextSx}>סוג</Typography>
        <Typography level="title-sm" sx={sx.headTextSx}>תוצאה</Typography>
        <Typography level="title-sm" sx={sx.headTextSx}>נק׳</Typography>
        <Typography level="title-sm" sx={sx.headTextSx}>קושי</Typography>
        <Typography level="title-sm" sx={sx.headTextSx}>וידאו</Typography>
        <Typography level="title-sm" sx={sx.headTextSx}></Typography>

      </Box>

      {!sortedRows.length ? (
        <TeamGamesEmpty />
      ) : (
        sortedRows.map((row) => (
          <TeamGamesRow
            key={row.id}
            row={row}
            onEdit={() => onEditGame(row)}
          />
        ))
      )}
    </Sheet>
  )
}
