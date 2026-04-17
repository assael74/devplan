// preview/previewDomainCard/domains/team/players/components/TeamPlayersTable.js

import React, { useMemo, useState } from 'react'
import { Box, Sheet, Typography } from '@mui/joy'
import TeamPlayersRow from './TeamPlayersRow'
import TeamPlayersEmpty from './TeamPlayersEmpty'

import { sortPlayers } from '../logic/teamPlayers.sort.logic.js'
import { tableSx as sx } from '../sx/teamPlayersTable.sx'

import { iconUi } from '../../../../../../../../../../ui/core/icons/iconUi.js'

export default function TeamPlayersTable({ rows = [], onEditPlayer }) {
  const [sortKey, setSortKey] = useState('minutesPct')
  const [sortDir, setSortDir] = useState('desc')

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'))
      return
    }

    setSortKey(key)
    setSortDir(key === 'name' || key === 'position' ? 'asc' : 'desc')
  }

  const sortedRows = useMemo(() => {
    return sortPlayers(rows, sortKey, sortDir)
  }, [rows, sortKey, sortDir])

  const renderSortIcon = (key) => {
    if (sortKey !== key) return null

    return iconUi({
      id: sortDir === 'desc' ? 'sortDown' : 'sortUp',
      size: 'sm',
    })
  }

  const sortableHeadSx = {
    ...sx.headTextSx,
    cursor: 'pointer',
    userSelect: 'none',
  }

  return (
    <Sheet variant="plain" sx={sx.tableWrapSx}>
      <Box sx={sx.headRowSx}>
        <Box sx={sortableHeadSx} onClick={() => handleSort('name')}>
          <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
            <Typography level="title-sm" sx={sx.headTextSx}>
              שחקן
            </Typography>
            {renderSortIcon('name')}
          </Box>
        </Box>

        <Box sx={sortableHeadSx} onClick={() => handleSort('potential')}>
          <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
            <Typography level="title-sm" sx={sx.headTextSx}>
              פוטנציאל
            </Typography>
            {renderSortIcon('potential')}
          </Box>
        </Box>

        <Typography level="title-sm" sx={sx.headTextSx}>
          פרויקט
        </Typography>

        <Box sx={sortableHeadSx} onClick={() => handleSort('position')}>
          <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
            <Typography level="title-sm" sx={sx.headTextSx}>
              עמדה
            </Typography>
            {renderSortIcon('position')}
          </Box>
        </Box>

        <Box sx={sortableHeadSx} onClick={() => handleSort('minutesPct')}>
          <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
            <Typography level="title-sm" sx={sx.headTextSx}>
              % דקות
            </Typography>
            {renderSortIcon('minutesPct')}
          </Box>
        </Box>

        <Typography level="title-sm" sx={sx.headTextSx}></Typography>
      </Box>

      {!sortedRows.length ? (
        <TeamPlayersEmpty />
      ) : (
        sortedRows.map((row) => (
          <TeamPlayersRow
            key={row.id}
            row={row}
            onEdit={() => onEditPlayer(row)}
          />
        ))
      )}
    </Sheet>
  )
}
