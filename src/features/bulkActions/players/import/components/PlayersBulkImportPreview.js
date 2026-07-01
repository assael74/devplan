// src/features/bulkActions/players/import/components/PlayersBulkImportPreview.js

import React from 'react'
import {
  Box,
  Button,
  Chip,
  Link,
  Sheet,
  Table,
  Typography,
} from '@mui/joy'

import { iconUi } from '../../../../../ui/core/icons/iconUi.js'

import PlayersBulkImportStatusChip from './PlayersBulkImportStatusChip.js'
import { playersImportSx as sx } from './sx/playersImport.sx.js'

function SummaryChips({ summary }) {
  return (
    <Box sx={sx.summaryChips}>
      <Chip size="sm" variant="soft">
        {summary?.total || 0} שורות
      </Chip>

      <Chip size="sm" color="success" variant="soft">
        {summary?.valid || 0} לייבוא
      </Chip>

      <Chip size="sm" color="warning" variant="soft">
        {summary?.warning || 0} אזהרות
      </Chip>

      <Chip size="sm" color="neutral" variant="soft">
        {summary?.existing || 0} כבר קיימים
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

function resolveHeaderLabel(header) {
  if (typeof header === 'string') return header

  return (
    header?.header ||
    header?.label ||
    header?.name ||
    header?.value ||
    ''
  )
}

function UnknownColumns({ unknownHeaders = [] }) {
  const labels = unknownHeaders
    .map(resolveHeaderLabel)
    .filter(Boolean)

  if (!labels.length) return null

  return (
    <Sheet variant="soft" color="warning" sx={sx.warningSheet}>
      <Typography level="title-sm">
        עמודות שלא ייובאו
      </Typography>

      <Typography level="body-sm">
        {labels.join(', ')}
      </Typography>
    </Sheet>
  )
}

function getFullName(data = {}) {
  return `${data.playerFirstName || ''} ${data.playerLastName || ''}`.trim() || '—'
}

function getMessages(row = {}) {
  const messages = [
    ...(Array.isArray(row.errors) ? row.errors : []),
    ...(Array.isArray(row.warnings) ? row.warnings : []),
  ]

  return messages
    .map(item => item?.message)
    .filter(Boolean)
    .join(', ')
}

function getRowStatus(row = {}) {
  if (row.alreadyExists) return 'existing'
  return row.status
}

function PlayerLink({ url }) {
  if (!url) return '—'

  return (
    <Link
      href={url}
      target="_blank"
      rel="noreferrer"
      level="body-xs"
    >
      פתח קישור
    </Link>
  )
}

export default function PlayersBulkImportPreview({
  preview,
  onRemoveRow,
}) {
  const rows = Array.isArray(preview?.rows)
    ? preview.rows
    : []

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
            color={preview?.allRowsHandled ? 'success' : 'warning'}
          >
            {preview.message}
          </Typography>
        ) : null}
      </Box>

      <MissingColumns missingRequired={preview?.missingRequired} />
      <UnknownColumns unknownHeaders={preview?.unknownHeaders} />

      {!rows.length ? (
        <Sheet variant="soft" sx={sx.emptySheet}>
          <Typography level="body-sm" sx={sx.mutedText}>
            אין שורות להצגה
          </Typography>
        </Sheet>
      ) : (
        <Sheet
          variant="outlined"
          sx={sx.tableWrap}
          className="dpScrollThin"
        >
          <Table
            size="sm"
            stickyHeader
            sx={sx.previewTable}
          >
            <thead>
              <tr>
                <th>סטטוס</th>
                <th>#</th>
                <th>שם שחקן</th>
                <th>תאריך לידה</th>
                <th>קישור</th>
                <th>הערות</th>
                <th>פעולה</th>
              </tr>
            </thead>

            <tbody>
              {rows.map(row => {
                const data = row?.data || {}

                return (
                  <tr key={row.rowIndex}>
                    <td>
                      <PlayersBulkImportStatusChip
                        status={getRowStatus(row)}
                      />
                    </td>

                    <td>{row.displayIndex}</td>
                    <td>{getFullName(data)}</td>
                    <td>{data.birth || '—'}</td>

                    <td>
                      <PlayerLink url={data.ifaLink} />
                    </td>

                    <td>{getMessages(row) || '—'}</td>

                    <td>
                      <Button
                        size="sm"
                        variant="plain"
                        color="danger"
                        startDecorator={iconUi({ id: 'delete' })}
                        onClick={() => onRemoveRow?.(row)}
                      >
                        הסר
                      </Button>
                    </td>
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
