// preview/previewDomainCard/domains/club/teams/components/ClubTeamsTable.js

import React, { useMemo, useState } from 'react'
import { Box, Sheet, Typography } from '@mui/joy'

import ClubTeamsRow from './ClubTeamsRow'
import ClubTeamEmpty from './ClubTeamEmpty'
import { sortClubTeams } from '../logic/clubTeams.sort.logic.js'
import { tableSx as sx } from '../sx/clubTeamsTable.sx'
import { iconUi } from '../../../../../../../../../ui/core/icons/iconUi.js'

export default function ClubTeamsTable({ rows = [], onEditTeam }) {
  const [sortKey, setSortKey] = useState('year')
  const [sortDir, setSortDir] = useState('desc')

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'))
      return
    }

    setSortKey(key)

    if (key === 'name') {
      setSortDir('asc')
      return
    }

    setSortDir('desc')
  }

  const sortedRows = useMemo(() => {
    return sortClubTeams(rows, sortKey, sortDir)
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
              קבוצה
            </Typography>
            {renderSortIcon('name')}
          </Box>
        </Box>

        <Box sx={sortableHeadSx} onClick={() => handleSort('year')}>
          <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
            <Typography level="title-sm" sx={sx.headTextSx}>
              שנתון
            </Typography>
            {renderSortIcon('year')}
          </Box>
        </Box>

        <Box sx={sortableHeadSx} onClick={() => handleSort('playersCount')}>
          <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
            <Typography level="title-sm" sx={sx.headTextSx}>
              שחקנים
            </Typography>
            {renderSortIcon('playersCount')}
          </Box>
        </Box>

        <Box sx={sortableHeadSx} onClick={() => handleSort('rolesCount')}>
          <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
            <Typography level="title-sm" sx={sx.headTextSx}>
              צוות
            </Typography>
            {renderSortIcon('rolesCount')}
          </Box>
        </Box>

        <Box sx={sortableHeadSx} onClick={() => handleSort('levelAvg')}>
          <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
            <Typography level="title-sm" sx={sx.headTextSx}>
              רמה
            </Typography>
            {renderSortIcon('levelAvg')}
          </Box>
        </Box>

        <Typography level="title-sm" sx={sx.headTextSx}></Typography>
      </Box>

      {!sortedRows.length ? (
        <ClubTeamEmpty />
      ) : (
        sortedRows.map((row) => (
          <ClubTeamsRow
            key={row.id}
            row={row}
            onEdit={() => onEditTeam?.(row?.raw || row)}
          />
        ))
      )}
    </Sheet>
  )
}
