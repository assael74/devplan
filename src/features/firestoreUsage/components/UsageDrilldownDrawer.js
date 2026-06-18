import React from 'react'
import {
  Box,
  Chip,
  Divider,
  Modal,
  ModalClose,
  Sheet,
  Table,
  Typography,
} from '@mui/joy'

const numberFormatter = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 2,
})

const formatDateTime = value => {
  if (!value) return '-'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'

  return new Intl.DateTimeFormat('he-IL', {
    dateStyle: 'short',
    timeStyle: 'medium',
  }).format(date)
}

const matchesSelection = (entry, selection) => {
  if (!selection?.type || !selection?.name) return false

  if (selection.type === 'collection') {
    return entry.collection === selection.name
  }

  if (selection.type === 'feature') {
    return entry.feature === selection.name
  }

  if (selection.type === 'action') {
    return entry.action === selection.name
  }

  return false
}

export default function UsageDrilldownDrawer({
  open,
  selection,
  entries = [],
  onClose,
}) {
  const rows = entries
    .filter(entry => matchesSelection(entry, selection))
    .slice(0, 30)

  const totals = rows.reduce(
    (acc, row) => {
      acc.reads += Number(row.reads || 0)
      acc.writes += Number(row.writes || 0)
      acc.kb += Number(row.totalEstimatedKb || 0)
      return acc
    },
    {
      reads: 0,
      writes: 0,
      kb: 0,
    }
  )

  return (
    <Modal open={open} onClose={onClose}>
      <Sheet
        variant="outlined"
        sx={{
          position: 'fixed',
          top: 0,
          right: 0,
          width: { xs: '100%', sm: 520 },
          height: '100dvh',
          p: 2,
          borderRadius: 0,
          boxShadow: 'lg',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        <ModalClose />

        <Box sx={{ pr: 4 }}>
          <Typography level="title-lg">
            פירוט שימוש
          </Typography>

          <Typography level="body-sm" textColor="text.tertiary">
            {selection?.label || selection?.name || '-'}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip size="sm" variant="soft" color="primary">
            Reads {numberFormatter.format(totals.reads)}
          </Chip>

          <Chip size="sm" variant="soft" color="success">
            Writes {numberFormatter.format(totals.writes)}
          </Chip>

          <Chip size="sm" variant="soft" color="warning">
            {numberFormatter.format(totals.kb)} KB
          </Chip>
        </Box>

        <Divider />

        <Box className="dpScrollThin" sx={{ minHeight: 0, overflow: 'auto' }}>
          {rows.length === 0 ? (
            <Typography level="body-sm" textColor="text.tertiary">
              אין עדיין אירועים אחרונים להצגה עבור הבחירה הזו.
            </Typography>
          ) : (
            <Table size="sm" stickyHeader sx={{ minWidth: 620 }}>
              <thead>
                <tr>
                  <th>זמן</th>
                  <th>Operation</th>
                  <th>Feature</th>
                  <th>Action</th>
                  <th>Reads</th>
                  <th>Writes</th>
                  <th>KB</th>
                </tr>
              </thead>

              <tbody>
                {rows.map(row => (
                  <tr key={row.id}>
                    <td>{formatDateTime(row.createdAt)}</td>
                    <td>{row.operation}</td>
                    <td>{row.feature}</td>
                    <td>{row.action}</td>
                    <td>{numberFormatter.format(row.reads)}</td>
                    <td>{numberFormatter.format(row.writes)}</td>
                    <td>{numberFormatter.format(row.totalEstimatedKb)}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Box>
      </Sheet>
    </Modal>
  )
}
