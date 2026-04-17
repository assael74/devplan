// src/features/players/payments/PaymentsTable.js

import React from 'react'
import { Table, Box, Typography, Chip } from '@mui/joy'
import { getPaymentStatusMeta, getPaymentTypeMeta } from '../../../../../../shared/payments/payments.utils.js'

function StatusChip({ statusId }) {
  const meta = getPaymentStatusMeta(statusId) || {}
  return (
    <Chip size="sm" variant="soft" color={meta.color || 'neutral'}>
      {meta.labelH || statusId || '—'}
    </Chip>
  )
}

export default function PaymentsTable({ items }) {
  const list = Array.isArray(items) ? items : []

  if (!list.length) {
    return <Typography level="body-sm" sx={{ opacity: 0.75 }}>אין תשלומים</Typography>
  }

  return (
    <Box sx={{ mt: 1, overflow: 'auto', px: 2 }}>
      <Table size="sm" borderAxis="xBetween" stickyHeader hoverRow sx={{ minWidth: 820 }}>
        <thead>
          <tr>
            <th>עבור</th>
            <th>סוג</th>
            <th>משלם</th>
            <th>סטטוס</th>
            <th>סכום</th>
          </tr>
        </thead>
        <tbody>
          {list.map((p) => {
            console.log(p)
            const t = getPaymentTypeMeta(p.type)
            return (
              <tr key={p.id}>
                <td>{p.paymentFor || '—'}</td>
                <td>{t?.labelH || p.type || '—'}</td>
                <td>{p.payerName || '—'}</td>
                <td><StatusChip statusId={p?.status?.id} /></td>
                <td>{p.price ?? 0} ש"ח</td>
              </tr>
            )
          })}
        </tbody>
      </Table>
    </Box>
  )
}
