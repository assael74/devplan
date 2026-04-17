// playerProfile/desktop/modules/abilities/components/insightsDrawer/InsightsRows.js

import React from 'react'
import { Box, Sheet, Typography, Divider, Chip } from '@mui/joy'
import { iconUi } from '../../../../../../../../ui/core/icons/iconUi.js'
import { getEntityColors } from '../../../../../../../../ui/core/theme/Colors.js'
import { insightsRowsSx as sx } from './sx/playerAbilities.insightsRows.sx.js'

const c = getEntityColors('players')

const toNum = (v) => {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

export function InsightRow({
  title,
  value,
  subValue = '',
  icon = 'insights',
  color = '',
  accentHex = '',
  valueHex = '',
  endText = '',
}) {
  return (
    <Sheet variant="soft" sx={sx.insightRow}>
      <Box sx={sx.insightIconWrap(accentHex)}>
        {iconUi({ id: icon, size: 'sm' })}
      </Box>

      <Box sx={sx.insightTextWrap}>
        <Typography level="body-sm" sx={sx.insightTitle}>
          {title}
        </Typography>

        {subValue ? (
          <Typography level="body-xs" sx={sx.insightSub}>
            {subValue}
          </Typography>
        ) : null}
      </Box>

      <Divider orientation="vertical" />

      <Box sx={sx.insightEndWrap}>
        {endText ? (
          <Typography level="body-xs" sx={sx.insightEndText}>
            {endText}
          </Typography>
        ) : null}

       {value && (
         <Chip size="sm" variant="outlined" color="neutral" sx={sx.insightValue(valueHex)}>
           {value}
         </Chip>
       )}
      </Box>
    </Sheet>
  )
}

export function InsightRowsList({ items = [], emptyText = 'אין נתונים להצגה' }) {
  if (!items.length) {
    return <Typography level="body-sm" sx={{ opacity: 0.7 }}>{emptyText}</Typography>
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
      {items.map((item) => (
        <InsightRow key={item.id} {...item} />
      ))}
    </Box>
  )
}
