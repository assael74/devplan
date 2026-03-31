// teamProfile/modules/abilities/components/insightsDrawer/InsightsRows.js

import React from 'react'
import { Box, Sheet, Typography, Divider, Chip } from '@mui/joy'
import { iconUi } from '../../../../../../../ui/core/icons/iconUi.js'
import { insightsRowsSx as sx } from './sx/teamAbilities.insightsRows.sx.js'

export function InsightRow({
  title,
  value,
  subValue = '',
  icon = 'insights',
  rowVariant = 'default',
  avatarText = '',
  accentHex = '',
  valueHex = '',
  endText = '',
}) {
  const compact = rowVariant === 'compact'
  return (
    <Sheet variant="soft" sx={sx.insightRow(compact)}>
      <Box sx={sx.insightIconWrap(accentHex)}>
        {avatarText ? (
          <Typography level="body-sm" sx={{ fontWeight: 700, fontSize: 9 }}>
            {avatarText}
          </Typography>
        ) : (
          iconUi({ id: icon, size: 'sm' })
        )}
      </Box>

      <Box sx={sx.insightTextWrap(compact)}>
        <Typography level="body-sm" sx={sx.insightTitle}>
          {title}
        </Typography>

        {subValue ? (
          <Typography level="body-xs" sx={sx.insightSub(compact)}>
            {subValue}
          </Typography>
        ) : null}
      </Box>

      {!compact ? <Divider orientation="vertical" /> : null}

      <Box sx={sx.insightEndWrap}>
        {endText ? (
          <Typography level="body-xs" sx={sx.insightEndText}>
            {endText}
          </Typography>
        ) : null}

        {value ? (
          <Chip size="sm" variant="outlined" color="neutral" sx={sx.insightValue(valueHex)}>
            {value}
          </Chip>
        ) : null}
      </Box>
    </Sheet>
  )
}

export function InsightRowsList({ items = [], emptyText = 'אין נתונים להצגה' }) {
  if (!items.length) {
    return (
      <Typography level="body-sm" sx={{ opacity: 0.7 }}>
        {emptyText}
      </Typography>
    )
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
      {items.map((item) => (
        <InsightRow key={item.id} {...item} />
      ))}
    </Box>
  )
}
