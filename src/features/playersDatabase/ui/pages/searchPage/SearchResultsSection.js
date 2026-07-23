// features/playersDatabase/ui/pages/searchPage/SearchResultsSection.js

import * as React from 'react'
import { Box, Card, Typography } from '@mui/joy'

import DataTable from '../../components/tables/DataTable.js'
import { buildSearchColumns } from './logic/search.columns.js'
import { searchResultsSx as sx } from './sx/searchResults.sx.js'

export default function SearchResultsSection({ rows, count, onPlayerOpen }) {
  const columns = React.useMemo(() => buildSearchColumns({ onPlayerOpen }), [onPlayerOpen])

  return (
    <Card sx={sx.panel}>
      <Box sx={sx.header}>
        <Box>
          <Typography level='title-lg' sx={sx.title}>תוצאות חיפוש</Typography>
          <Typography level='body-xs' sx={sx.subtitle}>
            התוצאות מוצגות לפי תנאי החיפוש שנבחרו.
          </Typography>
        </Box>

        <Box sx={sx.count}>{count ?? rows.length} שחקנים</Box>
      </Box>

      <DataTable
        className='dpScrollThin'
        columns={columns}
        rows={rows}
        getRowKey={row => row.id}
        wrapSx={sx.tableWrap}
        tableSx={sx.table}
      />
    </Card>
  )
}
