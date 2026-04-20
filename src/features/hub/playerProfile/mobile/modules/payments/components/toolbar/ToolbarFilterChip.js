// playerProfile/mobile/modules/payments/components/toolbar/ToolbarFilterChip.js

import React from 'react'
import { Chip, ChipDelete, Typography } from '@mui/joy'
import { iconUi } from '../../../../../../../../ui/core/icons/iconUi.js'

export default function ToolbarFilterChip({ item, onClear }) {
  return (
    <Chip
      size="sm"
      variant="soft"
      color={item?.color || 'primary'}
      startDecorator={item?.idIcon ? iconUi({ id: item.idIcon, size: 'sm' }) : null}
      endDecorator={
        onClear ? (
          <ChipDelete onDelete={() => onClear(item)} />
        ) : null
      }
      sx={{ maxWidth: '100%' }}
    >
      <Typography level="body-xs" noWrap>
        {item?.label}
      </Typography>
    </Chip>
  )
}
