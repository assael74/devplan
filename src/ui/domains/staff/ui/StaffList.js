// C:\projects\devplan\src\ui\domains\staff\ui\StaffList.js

import React from 'react'
import { Box, Typography } from '@mui/joy'
import StaffListRow from './StaffListRow.js'
import { staffSx } from './staff.sx.js'

export default function StaffList({
  value = [],
  disabled = false,
  pending = false,
  onRemove,
  showActions = true,
  formatPhone,
  isMobile = false,
  emptyText = 'עדיין לא שויך צוות מקצועי',
  compact = false,
}) {
  if (!value.length) {
    return (
      <Box sx={staffSx.empty(compact)}>
        <Box>
          <Typography level="title-sm" sx={{ fontWeight: 800 }}>
            {emptyText}
          </Typography>
        </Box>
      </Box>
    )
  }

  return (
    <Box sx={staffSx.list(compact)}>
      {value.map((staff) => (
        <StaffListRow
          key={staff.id}
          staff={staff}
          disabled={disabled}
          pending={pending}
          onRemove={onRemove}
          showActions={showActions}
          formatPhone={formatPhone}
          isMobile={isMobile}
          compact={compact}
        />
      ))}
    </Box>
  )
}
