import React, { useMemo, useState } from 'react'
import { Box, Sheet, Typography } from '@mui/joy'

import PlayerMeetingsRow from './PlayerMeetingsRow.js'
import PlayerMeetingEmpty from './PlayerMeetingEmpty.js'
import { iconUi } from '../../../../../../../../../ui/core/icons/iconUi.js'
import { tableSx as sx } from '../sx/playerMeetingsTable.sx.js'

export default function PlayerMeetingsTable({ rows = [], onEditMeeting, onCreateVideo }) {
  const [dateSort, setDateSort] = useState('desc')

  const sortedRows = useMemo(() => {
    const list = [...rows]

    list.sort((a, b) => {
      const da = Number(a?.ts || 0)
      const db = Number(b?.ts || 0)
      return dateSort === 'asc' ? da - db : db - da
    })

    return list
  }, [rows, dateSort])

  return (
    <Sheet variant="plain" sx={sx.tableWrapSx}>
      <Box sx={sx.headRowSx}>
        <Typography
          level="title-sm"
          sx={{ ...sx.headTextSx, cursor: 'pointer', justifyContent: 'center' }}
          onClick={() => setDateSort((s) => (s === 'asc' ? 'desc' : 'asc'))}
          startDecorator={iconUi({ id: dateSort === 'desc' ? 'sortUp' : 'sortDown', size: 'sm' })}
        >
          תאריך
        </Typography>

        <Typography level="title-sm" sx={sx.headTextSx}>חודש</Typography>
        <Typography level="title-sm" sx={sx.headTextSx}>סוג</Typography>
        <Typography level="title-sm" sx={sx.headTextSx}>סטטוס</Typography>
        <Typography level="title-sm" sx={sx.headTextSx}>וידאו</Typography>
        <Typography level="title-sm" sx={sx.headTextSx}>הערות</Typography>
        <Typography level="title-sm" sx={sx.headTextSx}></Typography>
      </Box>

      {!sortedRows.length ? (
        <PlayerMeetingEmpty />
      ) : (
        sortedRows.map((row) => (
          <PlayerMeetingsRow
            key={row.id || `${row.dateRaw}-${row.typeId}`}
            row={row}
            onEdit={() => onEditMeeting(row)} 
            onCreate={() => onCreateVideo(row)}
          />
        ))
      )}
    </Sheet>
  )
}
