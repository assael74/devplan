// src/features/roles/RolesPage.js

import React from 'react'
import { Box } from '@mui/joy'

import { useCoreData } from '../../coreData/CoreDataProvider.js'
import RolesCard from '../../ui/domains/roles/RolesCard.js'

export default function RolesPage() {
  const core = useCoreData()

  return (
    <Box
      sx={{
        width: '100%',
        minHeight: 0,
        p: { xs: 1, md: 2 },
      }}
    >
      <RolesCard
        roles={core.roles || []}
        pageMode
        context={{
          clubs: core.clubs || [],
          teams: core.teams || [],
          roles: core.roles || [],
        }}
      />
    </Box>
  )
}
