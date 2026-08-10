// src/features/playersDatabase/ui/components/modals/paste/PreviewTable.js

import * as React from 'react'
import {
  Box,
  Card,
  Chip,
  Stack,
  Table,
  Typography,
} from '@mui/joy'

import { previewTableSx as sx } from './sx/previewTable.sx.js'
import PreviewCell from './PreviewCell.js'
import StatusCell from './StatusCell.js'
import { resolvePasteRowStatus } from './paste.model.js'

export default function PreviewTable({
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
              const rowStatus = resolvePasteRowStatus({
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
                    <StatusCell
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
                      <PreviewCell
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
