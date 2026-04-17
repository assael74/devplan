// preview/previewDomainCard/domains/club/players/components/ClubPlayersTable.js

import React, { useMemo, useState } from 'react'
import { Box, Sheet, Typography } from '@mui/joy'
import ClubPlayersRow from './ClubPlayersRow'
import ClubPlayerEmpty from './ClubPlayerEmpty'

import { sortClubPlayers } from '../logic/clubPlayers.sort.logic.js'
import { tableSx as sx } from '../sx/clubPlayersTable.sx'

import { iconUi } from '../../../../../../../../../../ui/core/icons/iconUi.js'

export default function ClubPlayersTable({ rows = [], onEditPlayer }) {
  const [sortKey, setSortKey] = useState('level')
  const [sortDir, setSortDir] = useState('desc')

  const isTextSortKey = (key) => {
    return key === 'name' || key === 'position' || key === 'squadRole'
  }

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'))
      return
    }

    setSortKey(key)
    setSortDir(isTextSortKey(key) ? 'asc' : 'desc')
  }

  const sortedRows = useMemo(() => {
    return sortClubPlayers(rows, sortKey, sortDir)
  }, [rows, sortKey, sortDir])

  const renderSortIcon = (key) => {
    if (sortKey !== key) return null

    const isText = isTextSortKey(key)

    return iconUi({
      id:
        sortDir === 'desc'
          ? isText
            ? 'sortUp'
            : 'sortDown'
          : isText
            ? 'sortDown'
            : 'sortUp',
      size: 'sm',
    })
  }

  return (
    <Sheet variant="plain" sx={sx.tableWrapSx}>
      <Box sx={sx.headRowSx}>
        <Box sx={sx.headTextSx} onClick={() => handleSort('name')}>
          <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
            <Typography level="title-sm" sx={sx.headTextSx}>
              שחקן
            </Typography>
            {renderSortIcon('name')}
          </Box>
        </Box>

        <Box sx={sx.headTextSx} onClick={() => handleSort('level')}>
          <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
            <Typography level="title-sm" sx={sx.headTextSx}>
              רמה
            </Typography>
            {renderSortIcon('level')}
          </Box>
        </Box>

        <Box sx={sx.headTextSx} onClick={() => handleSort('position')}>
          <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
            <Typography level="title-sm" sx={sx.headTextSx}>
              עמדה
            </Typography>
            {renderSortIcon('position')}
          </Box>
        </Box>

        <Box sx={sx.headTextSx} onClick={() => handleSort('minutesPct')}>
          <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
            <Typography level="title-sm" sx={sx.headTextSx}>
              % דקות
            </Typography>
            {renderSortIcon('minutesPct')}
          </Box>
        </Box>

        <Box sx={sx.headTextSx} onClick={() => handleSort('squadRole')}>
          <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
            <Typography level="title-sm" sx={sx.headTextSx}>
              תפקיד
            </Typography>
            {renderSortIcon('squadRole')}
          </Box>
        </Box>

        <Typography level="title-sm" sx={sx.headTextSx}></Typography>
      </Box>

      {!sortedRows.length ? (
        <ClubPlayerEmpty />
      ) : (
        sortedRows.map((row) => (
          <ClubPlayersRow
            key={row.id}
            row={row}
            onEdit={() => onEditPlayer(row)}
          />
        ))
      )}
    </Sheet>
  )
}
