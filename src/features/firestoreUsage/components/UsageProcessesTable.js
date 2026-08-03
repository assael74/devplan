import React, { useMemo, useState } from 'react'
import {
  Box,
  Card,
  Chip,
  Table,
  Typography,
} from '@mui/joy'

const numberFormatter = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 2,
})

const RISK_LABELS = {
  danger: 'גבוה',
  warning: 'בדיקה',
  success: 'תקין',
}

const TABLE_COLUMN_WIDTHS = {
  action: '18%',
  feature: '11%',
  collection: '17%',
  calls: '8%',
  reads: '8%',
  averageReads: '9%',
  writes: '8%',
  documentDeletes: '7%',
  averageDurationMs: '8%',
  risk: '6%',
}

const SORTABLE_COLUMNS = [
  { key: 'action', label: 'תהליך', type: 'text' },
  { key: 'feature', label: 'Feature', type: 'text' },
  { key: 'collection', label: 'Collection', type: 'text' },
  { key: 'calls', label: 'Calls', type: 'number' },
  { key: 'reads', label: 'Reads', type: 'number' },
  { key: 'averageReads', label: 'Avg Reads', type: 'number' },
  { key: 'writes', label: 'Writes', type: 'number' },
  { key: 'documentDeletes', label: 'Deletes', type: 'number' },
  { key: 'averageDurationMs', label: 'Avg ms', type: 'number' },
  { key: 'risk', label: 'Risk', type: 'text' },
]

function getSortIndicator(active, direction) {
  if (!active) {
    return '↕'
  }

  return direction === 'asc' ? '▲' : '▼'
}

function compareValues(a, b, type) {
  if (type === 'number') {
    return (Number(a) || 0) - (Number(b) || 0)
  }

  return String(a || '').localeCompare(String(b || ''), 'he')
}

export default function UsageProcessesTable({ rows = [], onRowClick }) {
  const [sortKey, setSortKey] = useState('reads')
  const [sortDirection, setSortDirection] = useState('desc')

  const visibleRows = useMemo(() => {
    const column = SORTABLE_COLUMNS.find(item => item.key === sortKey)
    const type = column?.type || 'text'
    const sortedRows = [...rows].sort((left, right) => {
      const baseResult = compareValues(left?.[sortKey], right?.[sortKey], type)
      if (baseResult !== 0) {
        return sortDirection === 'asc' ? baseResult : -baseResult
      }

      return String(left?.key || '').localeCompare(String(right?.key || ''), 'he')
    })

    return sortedRows.slice(0, 20)
  }, [rows, sortDirection, sortKey])

  const handleSort = columnKey => {
    if (columnKey === sortKey) {
      setSortDirection(current => (current === 'asc' ? 'desc' : 'asc'))
      return
    }

    setSortKey(columnKey)
    setSortDirection('desc')
  }

  return (
    <Card variant="outlined" sx={{ p: 2, borderRadius: 'lg', boxShadow: 'sm' }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 2,
          mb: 1.5,
        }}
      >
        <Box>
          <Typography level="title-lg">תהליכי Firestore</Typography>
          <Typography level="body-xs" textColor="text.tertiary">
            אגרגציה מלאה של הסשן לפי Feature, Action ו־Collection
          </Typography>
        </Box>

        <Chip size="sm" variant="soft" color="primary">
          {rows.length} תהליכים
        </Chip>
      </Box>

      {visibleRows.length === 0 ? (
        <Typography level="body-sm" textColor="text.tertiary">
          אין עדיין תהליכים שנמדדו בסשן.
        </Typography>
      ) : (
        <Box className="dpScrollThin" sx={{ overflowX: 'auto' }}>
          <Table
            hoverRow
            stripe="odd"
            size="sm"
            sx={{
              width: '100%',
              minWidth: 1080,
              tableLayout: 'fixed',
              '& th:nth-of-type(5), & td:nth-of-type(5)': {
                bgcolor: 'primary.50',
              },
              '& th:nth-of-type(7), & td:nth-of-type(7)': {
                bgcolor: 'success.50',
              },
              '& th:nth-of-type(1), & td:nth-of-type(1)': {
                whiteSpace: 'normal',
                overflowWrap: 'anywhere',
              },
              '& th:nth-of-type(3), & td:nth-of-type(3)': {
                whiteSpace: 'normal',
                overflowWrap: 'anywhere',
              },
              '& th': {
                userSelect: 'none',
              },
            }}
          >
            <colgroup>
              {SORTABLE_COLUMNS.map(column => (
                <col key={column.key} style={{ width: TABLE_COLUMN_WIDTHS[column.key] }} />
              ))}
            </colgroup>

            <thead>
              <tr>
                {SORTABLE_COLUMNS.map(column => {
                  const isActive = sortKey === column.key
                  return (
                    <th key={column.key}>
                      <Box
                        onClick={() => handleSort(column.key)}
                        sx={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 0.75,
                          cursor: 'pointer',
                          fontWeight: isActive ? 700 : 600,
                          color: isActive ? 'primary.700' : 'text.primary',
                        }}
                      >
                        <span>{column.label}</span>
                        <Typography
                          component="span"
                          level="body-xs"
                          sx={{
                            color: isActive ? 'primary.500' : 'text.tertiary',
                            fontWeight: 700,
                          }}
                        >
                          {getSortIndicator(isActive, sortDirection)}
                        </Typography>
                      </Box>
                    </th>
                  )
                })}
              </tr>
            </thead>

            <tbody>
              {visibleRows.map(row => (
                <tr
                  key={row.key}
                  onClick={() => onRowClick?.(row)}
                  style={{ cursor: onRowClick ? 'pointer' : 'default' }}
                >
                  <td>{row.action}</td>
                  <td>{row.feature}</td>
                  <td>{row.collection}</td>
                  <td>{numberFormatter.format(row.calls)}</td>
                  <td>
                    <Typography level="body-sm" fontWeight={700} color={row.reads > 0 ? 'primary' : 'neutral'}>
                      {numberFormatter.format(row.reads)}
                    </Typography>
                  </td>
                  <td>{numberFormatter.format(row.averageReads)}</td>
                  <td>
                    <Typography level="body-sm" fontWeight={700} color={row.writes > 0 ? 'success' : 'neutral'}>
                      {numberFormatter.format(row.writes)}
                    </Typography>
                  </td>
                  <td>{numberFormatter.format(row.documentDeletes)}</td>
                  <td>{numberFormatter.format(row.averageDurationMs)}</td>
                  <td>
                    <Chip size="sm" variant="soft" color={row.risk}>
                      {RISK_LABELS[row.risk] || row.risk}
                    </Chip>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Box>
      )}
    </Card>
  )
}
