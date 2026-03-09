// ui/forms/PaymentCreateForm.js
import React, { useEffect, useMemo } from 'react'
import { Box, FormControl, FormLabel, Input, Typography, Divider } from '@mui/joy'

import MonthYearPicker from '../fields/dateUi/MonthYearPicker'
import DateInputField from '../fields/dateUi/DateInputField'
import PlayerSelectField from '../fields/selectUi/players/PlayerSelectField'
import PaymentTypeSelector from '../fields/checkUi/payments/PaymentTypeSelector'
import PriceField from '../fields/inputUi/payments/PriceField.js'

const clean = (v) => String(v ?? '').trim()

export default function PaymentCreateForm({ draft, onDraft, onValidChange, context }) {
  const paymentFor = draft.paymentFor ? draft.paymentFor : ''
  const type = draft.type ? draft.type: ''
  const price = draft.price ? draft.price : ''

  const players =
    context.playersList ||
    context.players ||
    context.teamPlayers ||
    context.clubPlayers ||
    []

  const validity = useMemo(() => {
    const okFor = !!clean(draft.paymentFor)
    const okType = !!clean(draft.ype)

    const pri = Number(String(draft.price).replace(/,/g, ''))
    const okPrice = Number.isFinite(pri) && pri > 0

    return {
      okFor,
      okType,
      okPrice,
      isValid: okFor && okType && okPrice,
    }
  }, [draft])

  useEffect(() => {
    onValidChange(validity.isValid)
  }, [validity.isValid, onValidChange])

  return (
    <Box sx={{ display: 'grid', gap: 2 }}>
      <Box sx={{ display: 'grid', gap: 1.5, gridTemplateColumns: { xs: '1fr', md: '1.50fr 0.75fr 0.75fr' } }}>
        <PlayerSelectField
          value={draft.playerId}
          options={players}
          size="sm"
          readOnly={true}
          context={context}
        />

        <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
          <PaymentTypeSelector
            required
            value={draft.ype}
            onChange={(v) => onDraft({ ...draft, type: v })}
            size="sm"
          />
        </Box>

        <PriceField
          required
          value={draft.price}
          onChange={(v) => onDraft({ ...draft, price: v })}
          size="sm"
        />

      </Box>

      <Divider />

      <Typography level="title-sm">פרטי תשלום</Typography>
      <Box sx={{ display: 'grid', gap: 1.5, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' } }}>
        <MonthYearPicker
          context="payment"
          required
          value={paymentFor}
          onChange={(v) => onDraft({ ...draft, paymentFor: v })}
          error={!validity.okFor && clean(paymentFor).length > 0}
          size="sm"
        />
      </Box>
    </Box>
  )
}
