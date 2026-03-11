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
          1
        </Typography>

        <Typography level="title-sm" sx={sx.headTextSx}>2</Typography>
        <Typography level="title-sm" sx={sx.headTextSx}>3</Typography>
        <Typography level="title-sm" sx={sx.headTextSx}>4</Typography>
        <Typography level="title-sm" sx={sx.headTextSx}>5</Typography>
        <Typography level="title-sm" sx={sx.headTextSx}>6</Typography>
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
