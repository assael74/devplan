// ui/forms/ui/payments/PaymentCreateFields.js

import React, { useEffect } from 'react'
import { Box, Typography, Divider, Chip } from '@mui/joy'

import MonthYearPicker from '../../../fields/dateUi/MonthYearPicker'
import DateInputField from '../../../fields/dateUi/DateInputField'
import PlayerSelectField from '../../../fields/selectUi/players/PlayerSelectField'
import PaymentTypeSelector from '../../../fields/checkUi/payments/PaymentTypeSelector'
import PriceField from '../../../fields/inputUi/payments/PriceField.js'
import PaymentStatusSelectField from '../../../fields/selectUi/payments/PaymentStatusSelectField.js'

import { pcfSx } from './sx/paymentCreateForm.sx.js'

export default function PaymentCreateFields({
  draft,
  layout,
  onDraft,
  context,
  validity,
  fieldDisabled = {},
}) {
  const players = context?.players || []

  return (
    <Box sx={pcfSx.root(layout)}>
      <Box sx={{ height: 10 }} />

      <Box sx={pcfSx.block(layout.topCols, 1.5)}>
        <Box sx={{ minWidth: 0 }}>
          <PlayerSelectField
            size="sm"
            options={players}
            value={draft.playerId}
            context={context}
            onChange={(v) => onDraft({ ...draft, playerId: v || '' })}
            disabled={Boolean(draft.playerId)}
          />
        </Box>

        <Box sx={{ minWidth: 0 }}>
          <PaymentStatusSelectField
            value={draft?.status?.id || 'new'}
            onChange={(v) =>
              onDraft({
                ...draft,
                status: {
                  ...draft?.status,
                  id: v || 'new',
                },
              })
            }
            disabled={fieldDisabled?.status}
            size="sm"
            chip={false}
            label="סטטוס תשלום"
          />
        </Box>
      </Box>

      <Box sx={{ height: 30 }} />

      <Divider>
        <Typography level="title-sm" sx={pcfSx.title}>
          פרטי התשלום
        </Typography>
      </Divider>

      <Box sx={pcfSx.block(layout.mainCols)}>
        <Box sx={{ minWidth: 0 }}>
          <PriceField
            required
            value={draft.price}
            onChange={(v) => onDraft({ ...draft, price: v })}
            size="sm"
          />
        </Box>

        <Box sx={{ minWidth: 0 }}>
          <PaymentTypeSelector
            required
            value={draft.typeId}
            onChange={(v) => onDraft({ ...draft, typeId: v })}
            size="lg"
          />
        </Box>
      </Box>

      <Box sx={{ height: 30 }} />

      <Divider>
        <Typography level="title-sm" sx={pcfSx.title}>
          עבור איזה חודש התשלום
        </Typography>
      </Divider>

      <Box sx={pcfSx.block(layout.topCols)}>
        <Box sx={{ minWidth: 0 }}>
          <MonthYearPicker
            context="payment"
            required
            value={draft.paymentFor}
            onChange={(v) => onDraft({ ...draft, paymentFor: v, dueMonth: v })}
            size="sm"
          />
        </Box>
      </Box>
    </Box>
  )
}
