// src/features/playersDatabase/ui/components/sync/SyncStatusHeader.js

import { Box, Typography } from '@mui/joy'

import { syncStatusHeaderSx as sx } from './syncStatusHeader.sx.js'

export default function SyncStatusHeader({
  title,
  receiptId = '',
  level = 'title-sm',
}) {
  return (
    <Box sx={sx.root}>
      <Typography level={level} sx={sx.title}>{title}</Typography>
      {receiptId ? (
        <Typography level='body-xs' sx={sx.receipt} title={receiptId}>
          קבלה: {receiptId}
        </Typography>
      ) : null}
    </Box>
  )
}
