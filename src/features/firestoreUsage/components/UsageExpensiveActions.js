import React from 'react'
import {
  Box,
  Card,
  Chip,
  Table,
  Typography,
} from '@mui/joy'

import { expensSx as sx } from './sx/expens.sx.js'

const numberFormatter = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 2,
})

const formatDateTime = value => {
  if (!value) return '-'

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return '-'
  }

  return new Intl.DateTimeFormat('he-IL', {
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

const resolveRisk = totalKb => {
  const size = Number(totalKb || 0)

  if (size >= 1000) {
    return {
      label: 'גבוה',
      color: 'danger',
    }
  }

  if (size >= 250) {
    return {
      label: 'בינוני',
      color: 'warning',
    }
  }

  return {
    label: 'תקין',
    color: 'success',
  }
}

export default function UsageExpensiveActions({ rows = [] }) {
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

        <Chip size="sm" variant="soft" color={rows.length ? 'danger' : 'success'}>
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
                const risk = resolveRisk(row.totalEstimatedKb)

                return (
                  <tr key={row.id}>
                    <td>{row.collection}</td>
                    <td>{row.feature}</td>
                    <td>{row.action}</td>

                    <td>
                      <Chip size="sm" variant="soft" color={resolveOperationColor(row.operation)}>
                        {row.operation}
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
