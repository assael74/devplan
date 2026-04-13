// ui/forms/ui/payments/PaymentCreateFields.js

import React, { useEffect } from 'react'
import { Box, Typography, Divider, Chip } from '@mui/joy'

import MonthYearPicker from '../../../fields/dateUi/MonthYearPicker'
import DateInputField from '../../../fields/dateUi/DateInputField'
import PlayerSelectField from '../../../fields/selectUi/players/PlayerSelectField'
import PaymentTypeSelector from '../../../fields/checkUi/payments/PaymentTypeSelector'
import PriceField from '../../../fields/inputUi/payments/PriceField.js'

import { pcfSx } from './sx/paymentCreateForm.sx.js'

export default function PaymentCreateFields({
  draft,
  onDraft,
  context,
  validity,
  layout,
}) {
  const players = context?.players || []

  return (
    <Box sx={pcfSx.root(layout)}>
      <Box sx={{ height: 10 }} />

      <Box sx={pcfSx.block(layout.topCols, 1.5)}>
        <PlayerSelectField
          value={draft.playerId}
          options={players}
          size="sm"
          disabled={draft.playerId}
          context={context}
        />
      </Box>

      <Box sx={{ height: 30 }} />

      <Divider>
        <Typography level="title-sm" sx={pcfSx.title}>
          פרטי התשלום
        </Typography>
      </Divider>

      <Box sx={pcfSx.block(layout.mainCols)}>
        <PriceField
          required
          value={draft.price}
          onChange={(v) => onDraft({ ...draft, price: v })}
          size="sm"
        />

        <PaymentTypeSelector
          required
          value={draft.type}
          onChange={(v) => onDraft({ ...draft, type: v })}
          size="lg"
        />
      </Box>

      <Box sx={{ height: 30 }} />

      <Divider>
        <Typography level="title-sm" sx={pcfSx.title}>
          עבור איזה חודש התשלום
        </Typography>
      </Divider>

      <Box sx={pcfSx.block(layout.topCols)}>
        <MonthYearPicker
          context="payment"
          required
          value={draft.paymentFor}
          onChange={(v) => onDraft({ ...draft, paymentFor: v })}
          size="sm"
        />
      </Box>
    </Box>
  )
}
