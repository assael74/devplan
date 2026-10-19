// src/features/firestoreUsage/components/UsageExpensiveActions.js
import React from 'react'
import { createIsraelDateTimeFormatter } from '../../../shared/format/dateUtils.js'
import {
  Box,
  Card,
  Chip,
  Table,
  Typography,
} from '@mui/joy'

import { expensSx as sx } from './sx/expens.sx.js'
import { getUsageStatusColor } from '../sharedLogic/firestoreUsageThresholds.js'

const numberFormatter = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 2,
})

const formatDateTime = value => {
  if (!value) return '-'

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return '-'
  }

  return createIsraelDateTimeFormatter({
    dateStyle: 'short',
    timeStyle: 'medium',
  }).format(date)
}

const resolveOperationColor = operation => {
  if (operation === 'transaction') return 'warning'
  if (operation === 'write') return 'success'
  if (operation === 'document-delete') return 'danger'
  if (operation === 'logical-delete') return 'danger'
  if (operation === 'listener-update') return 'primary'

  return 'neutral'
}

export default function UsageExpensiveActions({ rows = [] }) {
  const status = rows.some(row => row.risk === 'danger')
    ? 'danger'
    : rows.some(row => row.risk === 'warning') ? 'warning' : 'normal'
  return (
    <Card variant="outlined" sx={sx.card}>
      <Box sx={sx.boxWrap}>
        <Box>
          <Typography level="title-lg">
            פעולות כבדות
          </Typography>

          <Typography level="body-xs" textColor="text.tertiary">
            פעולות שחצו את סף הגודל
          </Typography>
        </Box>

        <Chip size="sm" variant="soft" color={getUsageStatusColor(status)}>
          {rows.length}
        </Chip>
      </Box>

      {rows.length === 0 ? (
        <Box sx={sx.boxRowsCompact}>
          <Typography level="body-sm" textColor="text.tertiary">
            אין פעולות כבדות בסשן הנוכחי.
          </Typography>
        </Box>
      ) : (
        <Box className="dpScrollThin" sx={{ overflowX: 'auto' }}>
          <Table
            hoverRow
            stripe="odd"
            size="sm"
            sx={sx.table}
          >
            <thead>
              <tr>
                <th>Collection</th>
                <th>Feature</th>
                <th>Action</th>
                <th>Operation</th>
                <th>Reads</th>
                <th>Writes</th>
                <th>Size</th>
                <th>Risk</th>
                <th>Timestamp</th>
              </tr>
            </thead>

            <tbody>
              {rows.map(row => {
                const risk = {
                  color: getUsageStatusColor(row.risk),
                  label: row.risk === 'danger' ? 'גבוה' : row.risk === 'warning' ? 'בינוני' : 'תקין',
                }

                return (
                  <tr key={row.id}>
                    <td>{row.collection}</td>
                    <td>{row.feature}</td>
                    <td>{row.action}</td>

                    <td>
                      <Chip size="sm" variant="soft" color={resolveOperationColor(row.operation)}>
                        {row.displayOperation}
                      </Chip>
                    </td>

                    <td>{row.reads}</td>
                    <td>{row.writes}</td>

                    <td>
                      {numberFormatter.format(row.totalEstimatedKb)} KB
                    </td>

                    <td>
                      <Chip size="sm" variant="soft" color={risk.color}>
                        {risk.label}
                      </Chip>
                    </td>

                    <td>
                      {formatDateTime(row.createdAt)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </Table>
        </Box>
      )}
    </Card>
  )
}
