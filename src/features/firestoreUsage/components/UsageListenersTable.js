import React from 'react'
import {
  Box,
  Card,
  Chip,
  Table,
  Typography,
} from '@mui/joy'

const formatDateTime = value => {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'

  return new Intl.DateTimeFormat('he-IL', {
    dateStyle: 'short',
    timeStyle: 'medium',
  }).format(date)
}

const buildDuplicateRows = rows => {
  const groups = new Map()

  rows.forEach(row => {
    const key = [
      row.feature || 'unknown',
      row.collection || 'unknown',
      row.action || 'unknown',
    ].join('::')

    const current = groups.get(key) || {
      key,
      feature: row.feature || 'unknown',
      collection: row.collection || 'unknown',
      action: row.action || '-',
      count: 0,
      openedAt: row.openedAt,
    }

    current.count += 1

    if (!current.openedAt || new Date(row.openedAt) < new Date(current.openedAt)) {
      current.openedAt = row.openedAt
    }

    groups.set(key, current)
  })

  return Array.from(groups.values())
    .filter(row => row.count > 1)
    .sort((a, b) => b.count - a.count)
}

export default function UsageListenersTable({ rows = [] }) {
  const duplicateRows = React.useMemo(
    () => buildDuplicateRows(rows),
    [rows]
  )

  if (duplicateRows.length === 0) {
    return null
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
          <Typography level="title-lg">Listeners כפולים</Typography>
          <Typography level="body-xs" textColor="text.tertiary">
            מאזינים זהים שפתוחים במקביל ודורשים בדיקה
          </Typography>
        </Box>

        <Chip size="sm" variant="soft" color="warning">
          {duplicateRows.length}
        </Chip>
      </Box>

      <Box className="dpScrollThin" sx={{ overflowX: 'auto' }}>
        <Table hoverRow stripe="odd" size="sm" sx={{ minWidth: 620 }}>
          <thead>
            <tr>
              <th>Feature</th>
              <th>Collection</th>
              <th>Action</th>
              <th>פתוחים</th>
              <th>נפתח לראשונה</th>
            </tr>
          </thead>
          <tbody>
            {duplicateRows.map(row => (
              <tr key={row.key}>
                <td>{row.feature}</td>
                <td>{row.collection}</td>
                <td>{row.action}</td>
                <td>
                  <Chip size="sm" variant="soft" color="warning">
                    {row.count}
                  </Chip>
                </td>
                <td>{formatDateTime(row.openedAt)}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Box>
    </Card>
  )
}
