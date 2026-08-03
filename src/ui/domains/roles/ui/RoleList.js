// src/ui/domains/roles/ui/RoleList.js

import React from 'react'
import { Box, Typography } from '@mui/joy'
import RoleRow from './RoleRow.js'
import { rolesSx } from './roles.sx.js'

export default function RoleList({
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
      <Box sx={rolesSx.empty(compact)}>
        <Box>
          <Typography level="title-sm" sx={{ fontWeight: 700 }}>
            {emptyText}
          </Typography>
        </Box>
      </Box>
    )
  }

  return (
    <Box sx={rolesSx.list(compact)}>
      {value.map((role) => (
        <RoleRow
          key={role.id}
          role={role}
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
