import React from 'react'
import { Box, Sheet } from '@mui/joy'

import AbilitiesMultiSelectField from '../../../../../../../../../ui/fields/selectUi/abilities/AbilitiesMultiSelectField.js'
import { filtersSx as sx } from '../sx/teamAbilitiesFilters.sx.js'

export default function TeamAbilitiesFilters({
  selectedDomains = [],
  onChangeSelectedDomains,
  onReset,
}) {
  return (
    <Sheet variant="plain" sx={sx.filtersBoxSx}>
      <Box sx={sx.filtersTopRowSx}>
        <AbilitiesMultiSelectField
          value={selectedDomains || []}
          onChange={(value) => onChangeSelectedDomains(value || [])}
          placeholder="בחירת דומיינים לצפייה"
          clearableChips
          fieldWidth={600}
        />
      </Box>
    </Sheet>
  )
}
