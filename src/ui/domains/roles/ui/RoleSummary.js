// src/ui/domains/roles/ui/RoleSummary.js

import React from 'react'
import { Box, Chip } from '@mui/joy'
import { iconUi } from '../../../core/icons/iconUi.js'
import { rolesSx } from './roles.sx.js'

export default function RoleSummary({ summary, pageMode = false }) {
  return (
    <Box sx={rolesSx.summary(pageMode)}>
      <Chip size="sm" variant="soft" color="neutral" startDecorator={iconUi({ id: 'role' })}>
        {`צוות: ${summary?.total ?? 0}`}
      </Chip>

      <Chip size="sm" variant="soft" color="success" startDecorator={iconUi({ id: 'link' })}>
        {`מקושרים: ${summary?.linked ?? 0}`}
      </Chip>

      <Chip
        size="sm"
        variant="soft"
        color={(summary?.missingAssignment ?? 0) ? 'warning' : 'neutral'}
        startDecorator={iconUi({ id: 'teams' })}
      >
        {`חסרי שיוך: ${summary?.missingAssignment ?? 0}`}
      </Chip>

      <Chip size="sm" variant="soft" color="neutral" startDecorator={iconUi({ id: 'phone' })}>
        {`יש קשר: ${summary?.withContact ?? 0}`}
      </Chip>

      <Chip
        size="sm"
        variant="soft"
        color={(summary?.missingContact ?? 0) ? 'warning' : 'neutral'}
        startDecorator={iconUi({ id: 'email' })}
      >
        {`חסר קשר: ${summary?.missingContact ?? 0}`}
      </Chip>
    </Box>
  )
}
