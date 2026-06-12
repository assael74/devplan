// src/features/bulkActions/games/import/components/BulkActionsPreview.js

import React from 'react'
import {
  Box,
  Chip,
  Sheet,
  Table,
  Typography,
} from '@mui/joy'

import BulkActionsStatusChip from './BulkActionsStatusChip.js'
import { bulkSx as sx } from './sx/bulk.sx.js'

const homeLabel = value => {
  if (value === true) return 'בית'
  if (value === false) return 'חוץ'
  return 'לא תקין'
}

function SummaryChips({ summary }) {
  return (
    <Box sx={sx.summaryChips}>
      <Chip size="sm" variant="soft">
        {summary?.total || 0} שורות
      </Chip>

      <Chip size="sm" color="success" variant="soft">
        {summary?.valid || 0} תקינות
      </Chip>

      <Chip size="sm" color="danger" variant="soft">
        {summary?.error || 0} שגיאות
      </Chip>
    </Box>
  )
}

function MissingColumns({ missingRequired = [] }) {
  if (!missingRequired.length) return null

  return (
    <Sheet variant="soft" color="danger" sx={sx.warningSheet}>
      <Typography level="title-sm">
        חסרות עמודות חובה
      </Typography>

      <Typography level="body-sm">
        {missingRequired.join(', ')}
      </Typography>
    </Sheet>
  )
}

export default function BulkActionsPreview({ preview }) {
  const rows = Array.isArray(preview?.rows) ? preview.rows : []
  const hasRows = rows.length > 0

  return (
    <Box sx={sx.previewRoot}>
      <Box sx={sx.previewHeader}>
        <Typography level="title-sm">
          תצוגה מקדימה
        </Typography>

        <SummaryChips summary={preview?.summary} />

        {preview?.message ? (
          <Typography
            level="body-sm"
            color={preview?.ok ? 'success' : 'danger'}
          >
            {preview.message}
          </Typography>
        ) : null}
      </Box>

      <MissingColumns missingRequired={preview?.missingRequired} />

      {!hasRows ? (
        <Sheet variant="soft" sx={sx.emptySheet}>
          <Typography level="body-sm" sx={sx.mutedText}>
            אין עדיין שורות להצגה
          </Typography>
        </Sheet>
      ) : (
        <Sheet variant="outlined" sx={sx.tableWrap}>
          <Table size="sm" stickyHeader sx={sx.previewTable}>
            <thead>
              <tr>
                <th>סטטוס</th>
                <th>#</th>
                <th>תאריך</th>
                <th>מחזור</th>
                <th>שעה</th>
                <th>יריבה</th>
                <th>בית/חוץ</th>
                <th>סוג</th>
                <th>משך</th>
              </tr>
            </thead>

            <tbody>
              {rows.map(row => {
                const data = row?.data || {}

                return (
                  <tr key={row.rowIndex}>
                    <td>
                      <BulkActionsStatusChip status={row.status} />
                    </td>

                    <td>{row.displayIndex}</td>
                    <td>{data.gameDate || '—'}</td>
                    <td>{data.gameLeagueNum || '—'}</td>
                    <td>{data.gameHour || '—'}</td>
                    <td>{data.rivel || '—'}</td>
                    <td>{homeLabel(data.home)}</td>
                    <td>{data.type || '—'}</td>
                    <td>{data.gameDuration || '—'}</td>
                  </tr>
                )
              })}
            </tbody>
          </Table>
        </Sheet>
      )}
    </Box>
  )
}
