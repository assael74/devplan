// preview/previewDomainCard/domains/player/videos/components/PlayerVideosTable.js

import React, { useMemo, useState } from 'react'
import { Box, Sheet, Typography } from '@mui/joy'

import PlayerVideosRow from './PlayerVideosRow.js'
import PlayerVideoEmpty from './PlayerVideoEmpty.js'

import { iconUi } from '../../../../../../../../../../ui/core/icons/iconUi.js'
import { tableSx as sx } from '../sx/playerVideosTable.sx.js'

const safe = (v) => (v == null ? '' : String(v).trim().toLowerCase())

export default function PlayerVideosTable({
  rows = [],
  context,
  onWatch,
  onEdit,
}) {
  const [sortBy, setSortBy] = useState('date')
  const [sortDir, setSortDir] = useState({
    name: 'desc',
    date: 'desc'
  })

  const handleSort = (key) => {
    setSortBy(key)

    setSortDir((prev) => ({
      ...prev,
      [key]: prev[key] === 'asc' ? 'desc' : 'asc'
    }))
  }

  const sortIconId = (key) => {
    return sortDir[key] === 'asc' ? 'sortDown' : 'sortUp'
  }

  const sortedRows = useMemo(() => {
    const list = [...rows]
    list.sort((a, b) => {
      if (sortBy === 'name') {
        const an = safe(a?.name)
        const bn = safe(b?.name)
        const cmp = an.localeCompare(bn, 'he')
        return sortDir.name === 'asc' ? cmp : -cmp
      }

      if (sortBy === 'date') {
        const da = safe(a?.ym)
        const db = safe(b?.ym)
        const cmp = da.localeCompare(db)
        return sortDir.date === 'asc' ? cmp : -cmp
      }
      return 0
    })
    return list
  }, [rows, sortBy, sortDir])

  return (
    <Sheet variant="plain" sx={sx.tableWrapSx}>
      <Box sx={sx.headRowSx}>
        <Typography level="title-sm" sx={sx.headTextSx}></Typography>

        <Typography
          level="title-sm"
          sx={sx.headTextSx}
          onClick={() => handleSort('name')}
          startDecorator={iconUi({ id: sortIconId('name'), size: 'sm' })}
        >
          שם
        </Typography>

        <Typography level="title-sm" sx={sx.headTextSx}>
          שיוך
        </Typography>

        <Typography
          level="title-sm"
          sx={sx.headTextSx}
          onClick={() => handleSort('date')}
          startDecorator={iconUi({ id: sortIconId('date'), size: 'sm' })}
        >
          תאריך
        </Typography>

        <Typography level="title-sm" sx={sx.headTextSx}>
          תגים
        </Typography>

        <Typography level="title-sm" sx={sx.headTextSx}>
          הערות
        </Typography>

        <Typography level="title-sm" sx={sx.headTextSx}></Typography>
      </Box>

      {!sortedRows.length ? (
        <PlayerVideoEmpty />
      ) : (
        sortedRows.map((row) => (
          <PlayerVideosRow
            key={row.id}
            row={row}
            context={context}
            onWatch={onWatch}
            onEdit={onEdit}
          />
        ))
      )}
    </Sheet>
  )
}
