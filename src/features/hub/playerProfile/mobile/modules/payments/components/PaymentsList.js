// playerProfile/mobile/modules/payments/components/PaymentsList.js

import React from 'react'
import { Box } from '@mui/joy'
import PaymentCard from './cardUi/PaymentCard.js'

export default function PaymentsList({ items, onEditPayment }) {
  const list = Array.isArray(items) ? items : []

  return (
    <Box sx={{ display: 'grid', gap: 0.75, pt: 1 }}>
      {list.map((item) => (
        <PaymentCard
          key={item.id}
          item={item}
          onClick={() => onEditPayment(item)}
        />
      ))}
    </Box>
  )
}
