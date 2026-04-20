// playerProfile/mobile/modules/payments/components/cardUi/PaymentCard.js

import React from 'react'
import { Box, Chip, Sheet, Typography } from '@mui/joy'
import {
  getPaymentStatusMeta,
  getPaymentTypeMeta,
} from '../../../../../../../../shared/payments/payments.utils.js'
import { iconUi } from '../../../../../../../../ui/core/icons/iconUi.js'

import { cardSx as sx } from '../../sx/card.sx.js'

function StatusChip({ statusId }) {
  const meta = getPaymentStatusMeta(statusId) || {}

  return (
    <Chip
      size="sm"
      variant="soft"
      color={meta.color || 'neutral'}
      sx={{ border: '1px solid', borderColor: 'divider' }}
      startDecorator={iconUi({ id: 'payments', size: 'sm' })}
    >
      {meta.labelH || statusId || '—'}
    </Chip>
  )
}

function MetaRow({ label, value }) {
  return (
    <Chip size="md" variant="outlined">
      {label}: {value || '—'}
    </Chip>
  )
}

export default function PaymentCard({ item, onClick }) {
  const typeMeta = getPaymentTypeMeta(item?.typeId) || {}

  return (
    <Sheet
      variant="soft"
      onClick={onClick}
      sx={sx.sheet(onClick)}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.75 }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography level="title-sm" noWrap sx={{ fontWeight: 700 }}>
            {item?.paymentFor || 'תשלום'}
          </Typography>

          <Typography level="body-xs" sx={{ color: 'text.tertiary', mt: 0.2 }} noWrap>
            {typeMeta?.labelH || item?.typeId || '—'}
          </Typography>
        </Box>

        <StatusChip statusId={item?.status?.id} />
      </Box>

      <Box sx={sx.metaWrap}>
        <MetaRow label="משלם" value={item?.payerName} />
        <MetaRow label="חודש" value={item?.dueMonth} />
        <MetaRow label="סכום" value={`${item?.price ?? 0} ₪`} />
      </Box>
    </Sheet>
  )
}
