// ui/fields/selectUi/abilities/ui/AbilitiesDomainsMultiSelectValue.js

import Chip from '@mui/joy/Chip'
import Typography from '@mui/joy/Typography'
import Box from '@mui/joy/Box'

import { abilitiesDomainsMultiSelectSx as sx } from '../sx/abilitiesDomainsMultiSelect.sx.js'
import {
  buildAbilitiesDomainsOptions,
  normalizeAbilitiesDomainsValue,
} from '../logic/abilitiesDomainsMultiSelect.logic.js'

import { iconUi } from '../../../../core/icons/iconUi.js';

export default function AbilitiesDomainsMultiSelectValue({
  value,
  options,
  placeholder = 'בחירת דומיינים',
}) {
  const normalizedValue = normalizeAbilitiesDomainsValue(value)
  const normalizedOptions = buildAbilitiesDomainsOptions(options)

  if (!normalizedValue.length) {
    return (
      <Typography level="body-sm" sx={sx.placeholder}>
        {placeholder}
      </Typography>
    )
  }

  const optionsMap = new Map(normalizedOptions.map((item) => [item.value, item.label]))

  return (
    <Box sx={sx.valueWrap}>
      {normalizedValue.map((id) => (
        <Chip key={id} size="sm" variant="soft" color="primary" sx={sx.chip} startDecorator={iconUi({id: id})}>
          {optionsMap.get(id) || id}
        </Chip>
      ))}
    </Box>
  )
}
