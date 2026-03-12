// preview/previewDomainCard/domains/player/info/components/PlayerInfoContactSection.js

import React from 'react'
import { Box, Divider, Typography } from '@mui/joy'

import {
  MonthYearPicker,
  DateInputField,
  PhoneField,
} from '../../../../../../../../../ui/fields'

import { sx } from '../sx/playerInfo.domain.sx.js'

export default function PlayerInfoContactSection({ form, pending, phoneOk, setField }) {
  return (
    <>
      <Typography level="title-sm" sx={sx.sectionTitle}>
        פרטי קשר וגיל
      </Typography>

      <Box sx={sx.contactGrid}>
        <MonthYearPicker
          value={form.birth}
          onChange={(v) => setField('birth', v)}
          disabled={pending}
          size="sm"
        />

        <DateInputField
          value={form.birthDay}
          onChange={(v) => setField('birthDay', v)}
          disabled={pending}
          size="sm"
        />

        <PhoneField
          value={form.phone}
          onChange={(v) => setField('phone', v)}
          disabled={pending}
          size="sm"
          color={phoneOk ? 'neutral' : 'warning'}
        />
      </Box>

      <Divider sx={sx.divider} />
    </>
  )
}
