import { Alert, Box, Typography } from '@mui/joy'

import { deleteModalPresentationSx as sx } from './sx/deleteModalPresentation.sx.js'

export const DELETE_MODAL_STEPS = [
  { id: 'check', label: 'בדיקה' },
  { id: 'preview', label: 'תצוגה מקדימה' },
  { id: 'sync', label: 'מחיקה וסנכרון' },
  { id: 'audit', label: 'בדיקה וסיום' },
]

export const resolveDeleteModalStep = status => {
  if (status === 'preparing' || status === 'loadingPreview') return 0
  if (status === 'preview' || status === 'ready') return 1
  if (status === 'writing' || status === 'steps' || status === 'executing') return 2
  return 3
}

export function DeleteModalSummary({ items = [] }) {
  const visibleItems = items.filter(item => item && item.label)
  if (!visibleItems.length) return null

  return (
    <Box sx={sx.summaryGrid}>
      {visibleItems.map(item => (
        <Box key={item.id || item.label} sx={sx.summaryItem}>
          <Typography level='body-xs' textColor='text.tertiary'>{item.label}</Typography>
          <Typography level='title-sm'>{item.value ?? '—'}</Typography>
        </Box>
      ))}
    </Box>
  )
}

export function DeleteModalPreserved({ children }) {
  if (!children) return null
  return (
    <Alert color='neutral' variant='soft'>
      <Box>
        <Typography level='title-sm'>מה יישמר ללא שינוי</Typography>
        <Typography level='body-sm'>{children}</Typography>
      </Box>
    </Alert>
  )
}

export function DeleteModalDetails({ title = 'פירוט הפעולה', children }) {
  if (!children) return null
  return (
    <Box component='details' sx={sx.details}>
      <Box component='summary' sx={sx.detailsSummary}>{title}</Box>
      <Box sx={sx.detailsBody}>{children}</Box>
    </Box>
  )
}

export function DeleteModalIds({ children }) {
  if (!children) return null
  return (
    <Box component='details' sx={sx.ids}>
      <Box component='summary' sx={sx.detailsSummary}>הצג מזהים</Box>
      <Box sx={sx.idsBody}>{children}</Box>
    </Box>
  )
}

export function DeleteModalProgressRow({ label, written = 0, skipped = 0, failed = 0, total }) {
  const parts = []
  if (written) parts.push(`${written} הושלמו`)
  if (skipped) parts.push(`${skipped} לא דרשו שינוי`)
  if (failed) parts.push(`${failed} לא הושלמו`)
  if (!parts.length) parts.push('ממתין לביצוע')

  return (
    <Box sx={sx.progressRow}>
      <Typography level='body-sm'>{label}</Typography>
      <Typography level='body-xs' textColor={failed ? 'danger.600' : 'text.secondary'}>
        {parts.join(' · ')}{Number.isFinite(total) ? ` · ${total} יעדים` : ''}
      </Typography>
    </Box>
  )
}
