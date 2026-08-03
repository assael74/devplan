import React, { useEffect, useMemo } from 'react'
import { Box, Divider, Typography } from '@mui/joy'
import { useTheme } from '@mui/joy/styles'
import useMediaQuery from '@mui/material/useMediaQuery'

import PlayerSelectField from '../fields/selectUi/players/PlayerSelectField.js'
import PriceField from '../fields/inputUi/payments/PriceField.js'
import DateInputField from '../fields/dateUi/DateInputField.js'
import { getPaymentCreateFormLayout } from './layouts/paymentCreateForm.layout.js'
import { pcfSx } from './ui/payments/sx/paymentCreateForm.sx.js'

const clean = (value) => String(value == null ? '' : value).trim()

export default function PrivatePaymentAgreementCreateForm({
  draft = {},
  onDraft,
  onValidChange,
  context = {},
  variant = 'modal',
  forceMobile = false,
}) {
  const theme = useTheme()
  const isMobileViewport = useMediaQuery(theme.breakpoints.down('sm'))
  const isMobile = forceMobile || isMobileViewport

  const validity = useMemo(() => {
    const totalAmount = Number(String(draft.totalAmount || '').replace(/,/g, ''))
    const isValid = Boolean(clean(draft.playerId)) && Boolean(clean(draft.startDate)) && Number.isFinite(totalAmount) && totalAmount > 0
    return { isValid }
  }, [draft.playerId, draft.startDate, draft.totalAmount])

  useEffect(() => {
    onValidChange(validity.isValid)
  }, [validity.isValid, onValidChange])

  const layout = useMemo(
    () => getPaymentCreateFormLayout({ variant, isMobile }),
    [variant, isMobile]
  )

  const players = context?.players || []

  return (
    <Box sx={pcfSx.root(layout)}>
      <Box sx={{ height: 10 }} />

      <Box sx={pcfSx.block(layout.topCols, 1.5)}>
        <PlayerSelectField
          size="sm"
          options={players}
          value={draft.playerId}
          context={context}
          onChange={(value) => onDraft({ ...draft, playerId: value || '' })}
          disabled={Boolean(draft.playerId)}
        />
      </Box>

      <Box sx={{ height: 30 }} />

      <Divider>
        <Typography level="title-sm" sx={pcfSx.title}>
          פרטי ההתקשרות
        </Typography>
      </Divider>

      <Box sx={pcfSx.block(layout.mainCols)}>
        <PriceField
          required
          label="סכום כולל"
          value={draft.totalAmount}
          onChange={(value) => onDraft({ ...draft, totalAmount: value })}
          size="sm"
          max={10000000}
        />

        <DateInputField
          required
          label="תאריך התחלה"
          value={draft.startDate}
          onChange={(value) => onDraft({ ...draft, startDate: value })}
          helperText="תאריך הסיום יחושב אוטומטית לאחר 18 חודשים"
        />
      </Box>
    </Box>
  )
}
