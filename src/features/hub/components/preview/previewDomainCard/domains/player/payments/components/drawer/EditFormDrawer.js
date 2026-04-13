// previewDomainCard/domains/player/payments/components/drawer/EditFormDrawer.js

import React from 'react'
import { Box, Typography, Divider } from '@mui/joy'

import MonthYearPicker from '../../../../../../../../../../ui/fields/dateUi/MonthYearPicker.js'
import PlayerSelectField from '../../../../../../../../../../ui/fields/selectUi/players/PlayerSelectField'
import PaymentTypeSelector from '../../../../../../../../../../ui/fields/checkUi/payments/PaymentTypeSelector'
import PaymentStatusSteps from '../../../../../../../../../../ui/fields/checkUi/payments/PaymentStatusSelector'
import PriceField from '../../../../../../../../../../ui/fields/inputUi/payments/PriceField.js'

import { drawerSx as sx } from './editDrawer.sx.js'

export default function EditFormDrawer({ draft, setDraft, context }) {
  const onChange = (key) => (value) => {
    setDraft((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  return (
    <Box sx={sx.body}>
      <Box sx={{ ...sx.sectionCard, my: 2 }}>
        <Divider>
          <Typography sx={sx.sectionTitle}>שיוך התשלום</Typography>
        </Divider>

        <Box sx={{ display: 'grid', gap: 1 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 1 }}>
            <PlayerSelectField
              value={draft?.playerId || ''}
              options={context?.players || []}
              size="sm"
              disabled
              context={context}
            />
          </Box>
        </Box>
      </Box>

      <Box sx={{ ...sx.sectionCard, my: 2 }}>
        <Divider>
          <Typography sx={sx.sectionTitle}>פרטי התשלום</Typography>
        </Divider>

        <Box sx={{ display: 'grid', gap: 3 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <PaymentTypeSelector
              required
              value={draft?.type || ''}
              onChange={onChange('type')}
              size="md"
            />

            <PriceField
              required
              value={draft?.price ?? ''}
              onChange={onChange('price')}
              size="sm"
            />
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
            <MonthYearPicker
              required
              value={draft?.paymentFor || ''}
              onChange={onChange('paymentFor')}
              size="sm"
            />
          </Box>
        </Box>
      </Box>

      <Box sx={{ ...sx.sectionCard, mt: 2 }}>
        <Divider>
          <Typography sx={sx.sectionTitle}>סטטוס תשלום</Typography>
        </Divider>

        <Box sx={{ display: 'grid', gap: 0.85 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 0.85 }}>
            <PaymentStatusSteps
              value={draft?.status || ''}
              onChange={onChange('status')}
              size="sm"
            />
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
