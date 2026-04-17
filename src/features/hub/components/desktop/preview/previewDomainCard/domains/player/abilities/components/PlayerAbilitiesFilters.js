import React from 'react'
import { Box, IconButton, Sheet, Tooltip } from '@mui/joy'

import AbilitiesMultiSelectField from '../../../../../../../../../../ui/fields/selectUi/abilities/AbilitiesMultiSelectField.js'
import { iconUi } from '../../../../../../../../../../ui/core/icons/iconUi.js'
import { filtersSx as sx } from '../sx/playerAbilitiesFilters.sx.js'

export default function PlayerAbilitiesFilters({
  selectedDomains = [],
  onChangeSelectedDomains,
  onReset,
}) {
  const isDirty = Array.isArray(selectedDomains) && selectedDomains.length > 0

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
