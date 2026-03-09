// preview/previewDomainCard/domains/team/videos/components/TeamVideosTable.js

import React, { useMemo, useState } from 'react'
import { Box, Sheet, Typography } from '@mui/joy'

import TeamVideosRow from './TeamVideosRow.js'
import TeamVideoEmpty from './TeamVideoEmpty.js'

import { iconUi } from '../../../../../../../../../ui/core/icons/iconUi.js'
import { tableSx as sx } from '../sx/teamVideosTable.sx.js'

export default function TeamVideosTable({
  rows = [],
  onWatch,
  onEdit,
  onLink,
  onShare,
}) {
  const [dateSort, setDateSort] = useState('desc')

  const sortedRows = useMemo(() => {
    const list = [...rows]

    list.sort((a, b) => {
      const da = new Date(a?.date || 0).getTime()
      const db = new Date(b?.date || 0).getTime()
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

        <Typography level="title-sm" sx={sx.headTextSx}>כותרת</Typography>
        <Typography level="title-sm" sx={sx.headTextSx}>שחקן</Typography>
        <Typography level="title-sm" sx={sx.headTextSx}>סוג שחקן</Typography>
        <Typography level="title-sm" sx={sx.headTextSx}>תגים</Typography>
        <Typography level="title-sm" sx={sx.headTextSx}>קישור</Typography>
        <Typography level="title-sm" sx={sx.headTextSx}>פעולות</Typography>
      </Box>

      {!sortedRows.length ? (
        <TeamVideoEmpty />
      ) : (
        sortedRows.map((row) => (
          <TeamVideosRow
            key={row.id}
            row={row}
            onWatch={() => onWatch?.(row)}
            onEdit={() => onEdit?.(row)}
            onLink={() => onLink?.(row)}
            onShare={() => onShare?.(row)}
          />
        ))
      )}
    </Sheet>
  )
}
