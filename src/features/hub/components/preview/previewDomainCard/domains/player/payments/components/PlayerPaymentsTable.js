import React, { useMemo, useState } from 'react'
import { Box, Sheet, Typography } from '@mui/joy'

import PlayerPaymentsRow from './PlayerPaymentsRow.js'
import PlayerPaymentEmpty from './PlayerPaymentEmpty.js'
import { iconUi } from '../../../../../../../../../ui/core/icons/iconUi.js'
import { tableSx as sx } from '../sx/playerPaymentsTable.sx.js'

export default function PlayerPaymentsTable({ rows = [], onEditPayment }) {
  const [dateSort, setDateSort] = useState('desc')

  const sortedRows = useMemo(() => {
    const list = [...rows]

    list.sort((a, b) => {
      const da = Number(a?.ts || 0)
      const db = Number(b?.ts || 0)
      return dateSort === 'asc' ? da - db : db - da
    })

    return list
  }, [rows, dateSort])

  return (
    <Sheet variant="plain" sx={sx.tableWrapSx}>
      <Box sx={sx.headRowSx}>
        <Typography
          level="title-sm"
          sx={{ ...sx.headTextSx, cursor: 'pointer', justifyContent: 'center' }}
          onClick={() => setDateSort((s) => (s === 'asc' ? 'desc' : 'asc'))}
          startDecorator={iconUi({ id: dateSort === 'desc' ? 'sortUp' : 'sortDown', size: 'sm' })}
        >
          תשלום עבור
        </Typography>

        <Typography level="title-sm" sx={sx.headTextSx}>סכום</Typography>
        <Typography level="title-sm" sx={sx.headTextSx}>סוג</Typography>
        <Typography level="title-sm" sx={sx.headTextSx}>סטטוס</Typography>
        <Typography level="title-sm" sx={sx.headTextSx}>תאריך</Typography>
        <Typography level="title-sm" sx={sx.headTextSx}>סכום ללא מעמ</Typography>
        <Typography level="title-sm" sx={sx.headTextSx}></Typography>
      </Box>

      {!sortedRows.length ? (
        <PlayerPaymentEmpty />
      ) : (
        sortedRows.map((row) => (
          <PlayerPaymentsRow
            key={row.id || `${row.dateRaw}-${row.typeId}`}
            row={row}
            onEdit={() => onEditPayment(row)}
          />
        ))
      )}
    </Sheet>
  )
}
