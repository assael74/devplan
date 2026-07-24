// features/playersDatabase/ui/pages/searchPage/results/SearchResultsSection.js

import * as React from 'react'
import { Box, Card, CircularProgress, Typography } from '@mui/joy'

import DataTable from '../../../components/tables/DataTable.js'
import { buildSearchColumns } from '../logic/search.columns.js'
import { searchResultsSectionSx as sx } from './sx/searchResultsSection.sx.js'

export default function SearchResultsSection({
  rows = [],
  loading = false,
  error = null,
  entityType = 'player',
  onEntityOpen,
}) {
  const columns = React.useMemo(() => buildSearchColumns({
    onEntityOpen,
  }), [onEntityOpen])
  const entityLabel = entityType === 'team' ? 'קבוצות' : 'שחקנים'

  return (
    <Card sx={sx.panel}>
      <Box sx={sx.header}>
        <Box sx={sx.headerCopy}>
          <Typography level='title-lg' sx={sx.title}>
            תוצאות חיפוש
          </Typography>
          <Typography level='body-xs' sx={sx.subtitle}>
            המסמכים שנטענו לפי השאילתה האחרונה.
          </Typography>
        </Box>

        <Box sx={sx.count}>
          {loading ? <CircularProgress size='sm' /> : `${rows.length} ${entityLabel}`}
        </Box>
      </Box>

      {error ? (
        <Box sx={sx.state}>
          <Typography color='danger'>טעינת המסמכים נכשלה.</Typography>
        </Box>
      ) : (
        <DataTable
          className='dpScrollThin'
          columns={columns}
          rows={rows}
          getRowKey={row => row.id}
          wrapSx={sx.tableWrap}
          tableSx={sx.table}
        />
      )}
    </Card>
  )
}
