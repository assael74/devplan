// previewDomainCard/domains/player/payments/components/drawer/EditFormDrawer.js

import React from 'react'
import { Box, Typography, Divider } from '@mui/joy'

import DateInputField from '../../../../../../../../../../ui/fields/dateUi/DateInputField.js'
import MonthYearPicker from '../../../../../../../../../../ui/fields/dateUi/MonthYearPicker.js'
import PlayerSelectField from '../../../../../../../../../../ui/fields/selectUi/players/PlayerSelectField'
import PaymentTypeSelector from '../../../../../../../../../../ui/fields/checkUi/payments/PaymentTypeSelector'
import PaymentStatusSteps from '../../../../../../../../../../ui/fields/checkUi/payments/PaymentStatusSelector'
import PriceField from '../../../../../../../../../../ui/fields/inputUi/payments/PriceField.js'

import { drawerFormrSx as sx } from '../../sx/editFormDrawer.sx.js'

export default function EditFormDrawer({ draft, setDraft, context }) {
  const onChange = (key) => (value) => {
    setDraft((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  return (
    <Box sx={sx.bodySx} className="dpScrollThin">
      <Box sx={{...sx.sectionCardSx, my: 2}}>
        <Divider>
          <Typography sx={sx.sectionTitleSx}>שיוך התשלום</Typography>
        </Divider>

        <Box sx={{ display: 'grid', gap: 1 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 1 }}>
            <PlayerSelectField
              value={draft.playerId}
              options={context?.players}
              size="sm"
              disabled
              context={context}
            />
          </Box>
        </Box>
      </Box>

      <Box sx={{...sx.sectionCardSx, my: 2}}>
        <Divider>
          <Typography sx={sx.sectionTitleSx}>פרטי התשלום</Typography>
        </Divider>

        <Box sx={{ display: 'grid', gap: 3 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <PaymentTypeSelector
              required
              value={draft.type}
              onChange={onChange('type')}
              size="md"
            />

            <PriceField
              required
              value={draft.price}
              onChange={onChange('price')}
              size="sm"
            />
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
            <MonthYearPicker
              required
              value={draft.paymentFor}
              onChange={onChange('paymentFor')}
              size="sm"
            />
          </Box>
        </Box>
      </Box>

      <Box sx={{...sx.sectionCardSx, mt: 2}}>
        <Divider>
          <Typography sx={sx.sectionTitleSx}>סטטוס תשלום</Typography>
        </Divider>

        <Box sx={{ display: 'grid', gap: 0.85 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 0.85 }}>
            <PaymentStatusSteps
              value={draft.status}
              onChange={onChange('status')}
              size="sm"
            />
          </Box>

        </Box>
      </Box>
    </Box>
  )
}
