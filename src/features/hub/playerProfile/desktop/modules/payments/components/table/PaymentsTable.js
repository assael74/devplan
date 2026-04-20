// playerProfile/desktop/modules/payments/components/table/PaymentsTable.js

import React from 'react'
import { Table, Box, Typography, Chip, IconButton, Tooltip } from '@mui/joy'
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded'
import EditRoundedIcon from '@mui/icons-material/EditRounded'

import {
  getPaymentStatusMeta,
  getPaymentTypeMeta
} from '../../../../../../../../shared/payments/payments.utils.js'
import { iconUi } from '../../../../../../../../ui/core/icons/iconUi.js'

function StatusChip({ statusId }) {
  const meta = getPaymentStatusMeta(statusId) || {}
  return (
    <Chip size="sm" variant="soft" color={meta.color || 'neutral'}>
      {meta.labelH || statusId || '—'}
    </Chip>
  )
}

export default function PaymentsTable({ items, onEdit }) {
  const list = Array.isArray(items) ? items : []

  if (!list.length) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography level="body-sm" sx={{ opacity: 0.6 }}>אין תשלומים להצגה</Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ mt: 1, overflow: 'auto', px: 2 }}>
      <Table
        size="sm"
        borderAxis="xBetween"
        stickyHeader
        hoverRow
        sx={{
          minWidth: 850,
          '& tr > *:last-child': { textAlign: 'center' }, // יישור עמודת הפעולות
          '& thead th': { verticalAlign: 'middle' }
        }}
      >
        <thead>
          <tr>
            <th style={{ width: '20%' }}>עבור</th>
            <th style={{ width: '15%' }}>סוג</th>
            <th style={{ width: '20%' }}>משלם</th>
            <th style={{ width: '15%' }}>סטטוס</th>
            <th style={{ width: '15%' }}>סכום</th>
            <th style={{ width: '80px' }}>פעולות</th>
          </tr>
        </thead>
        <tbody>
          {list.map((p) => {
            // שליפת מטא-דאטה מהלוגיקה המשותפת
            const typeMeta = getPaymentTypeMeta(p.typeId)
            const formattedPrice = new Intl.NumberFormat('he-IL', {
              style: 'currency',
              currency: 'ILS',
              maximumFractionDigits: 0
            }).format(p.price)

            return (
              <tr key={p.id}>
                <td>
                  <Typography level="body-sm" sx={{ fontWeight: '500' }}>
                    {p.paymentFor || '—'}
                  </Typography>
                </td>

                <td>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {typeMeta?.idIcon && iconUi({ id: typeMeta.idIcon, sx: { fontSize: '18px', opacity: 0.6 } })}
                    <Typography level="body-sm">{typeMeta?.labelH || p.typeId}</Typography>
                  </Box>
                </td>

                <td>
                  <Typography level="body-sm">{p.payerName || 'לא הוגדר'}</Typography>
                </td>

                <td>
                  <StatusChip statusId={p.status?.id} />
                </td>

                <td>
                  <Typography level="title-sm" color="primary">
                    {formattedPrice}
                  </Typography>
                </td>

                <td>
                  <Tooltip title="עריכת תשלום">
                    <IconButton size="sm" variant="plain" onClick={() => onEdit(p)}>
                      {iconUi({ id: 'more' })}
                    </IconButton>
                  </Tooltip>
                </td>
              </tr>
            )
          })}
        </tbody>
      </Table>
    </Box>
  )
}
