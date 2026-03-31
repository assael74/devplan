// ui/fields/selectUi/abilities/ui/AbilitiesMultiSelectValue.js

import Chip from '@mui/joy/Chip'
import ChipDelete from '@mui/joy/ChipDelete'
import Typography from '@mui/joy/Typography'
import Box from '@mui/joy/Box'

import { abilitiesMultiSelectSx as sx } from '../sx/abilitiesMultiSelect.sx.js'
import {
  buildAbilitiesOptions,
  normalizeAbilitiesValue,
} from '../logic/abilitiesMultiSelect.logic.js'

import { iconUi } from '../../../../core/icons/iconUi.js'

export default function AbilitiesMultiSelectValue({
  value,
  options,
  placeholder = 'בחירת דומיינים',
  onRemove,
}) {
  const normalizedValue = normalizeAbilitiesValue(value)
  const normalizedOptions = buildAbilitiesOptions(options)

  if (!normalizedValue.length) {
    return (
      <Typography level="body-sm" sx={{ color: 'text.tertiary' }}>
        {placeholder}
      </Typography>
    )
  }

  const optionsMap = new Map(
    normalizedOptions.map((item) => [item.value, item.label])
  )

  return (
    <Box sx={sx.valueWrap}>
      {normalizedValue.map((id) => (
        <Chip
          key={id}
          size="sm"
          variant="soft"
          color="primary"
          sx={{ borderRadius: '999px' }}
          startDecorator={iconUi({ id })}
          endDecorator={
            onRemove ? (
              <ChipDelete
                variant="plain"
                onMouseDown={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                }}
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  onRemove(id)
                }}
              >
                {iconUi({ id: 'close' })}
              </ChipDelete>
            ) : null
          }
        >
          {optionsMap.get(id) || id}
        </Chip>
      ))}
    </Box>
  )
}
