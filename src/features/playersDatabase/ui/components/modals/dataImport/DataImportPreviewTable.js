// features/playersDatabase/ui/components/modals/dataImport/DataImportPreviewTable.js

import * as React from 'react'
import {
  Box,
  Card,
  Chip,
  Stack,
  Table,
  Typography,
} from '@mui/joy'

import { dataImportPreviewTableSx as sx } from './DataImportPreviewTable.sx.js'
import DataImportPreviewCell from './DataImportPreviewCell.js'
import DataImportStatusCell from './DataImportStatusCell.js'
import { resolveDataImportRowStatus } from './dataImport.model.js'

export default function DataImportPreviewTable({
  columns,
  rows,
  onCellChange,
  getRowStatus,
}) {
  return (
    <Card sx={sx.previewPanel}>
      <Box sx={sx.previewHeader}>
        <Box>
          <Typography
            level='title-md'
            sx={sx.sectionTitle}
          >
            תצוגה ועריכת נתונים
          </Typography>

          <Typography
            level='body-xs'
            sx={sx.sectionDescription}
          >
            ניתן לבדוק ולתקן את הנתונים לפני הטעינה.
          </Typography>
        </Box>

        <Stack
          direction='row'
          spacing={0.75}
          sx={sx.summaryChips}
        >
          <Chip
            size='sm'
            variant='soft'
            color='success'
          >
            {rows.length} שורות
          </Chip>

          <Chip
            size='sm'
            variant='soft'
            color='neutral'
          >
            {columns.length} עמודות
          </Chip>
        </Stack>
      </Box>

      <Box
        className='dpScrollThin'
        sx={sx.tableWrap}
      >
        <Table
          stickyHeader
          hoverRow
          size='sm'
          sx={sx.table}
        >
          <thead>
            <tr>
              <Box
                component='th'
                sx={sx.statusColumn}
              >
                תקין
              </Box>

              {columns.map(column => (
                <Box
                  component='th'
                  key={column.key}
                  sx={column.sx}
                >
                  {column.label}
                </Box>
              ))}
            </tr>
          </thead>

          <tbody>
            {rows.map((row, rowIndex) => {
              const rowStatus = resolveDataImportRowStatus({
                columns,
                row,
                rowIndex,
                getRowStatus,
              })

              return (
                <tr key={row.id || rowIndex}>
                  <Box
                    component='td'
                    sx={sx.statusColumn}
                  >
                    <DataImportStatusCell
                      valid={rowStatus.valid}
                      message={rowStatus.message}
                    />
                  </Box>

                  {columns.map(column => (
                    <Box
                      component='td'
                      key={column.key}
                      sx={column.sx}
                    >
                      <DataImportPreviewCell
                        column={column}
                        row={row}
                        rowIndex={rowIndex}
                        onCellChange={onCellChange}
                      />
                    </Box>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </Table>
      </Box>
    </Card>
  )
}
