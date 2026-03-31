// ui/fields/selectUi/abilities/AbilitiesMultiSelectField.js

import Select from '@mui/joy/Select'
import Option from '@mui/joy/Option'
import Checkbox from '@mui/joy/Checkbox'
import ListItemDecorator from '@mui/joy/ListItemDecorator'
import Typography from '@mui/joy/Typography'
import Box from '@mui/joy/Box'

import AbilitiesMultiSelectValue from './ui/AbilitiesMultiSelectValue.js'
import { abilitiesMultiSelectSx as sx } from './sx/abilitiesMultiSelect.sx.js'
import {
  buildAbilitiesOptions,
  normalizeAbilitiesValue,
  buildSelectedMap,
  toggleAbilities,
} from './logic/abilitiesMultiSelect.logic.js'

import { iconUi } from '../../../core/icons/iconUi.js'

export default function AbilitiesMultiSelectField({
  value,
  onChange,
  options,
  fieldWidth = 280,
  placeholder = 'בחירת דומיינים לשליחה',
  disabled = false,
  size = 'md',
  color = 'neutral',
  variant = 'outlined',
  clearableChips = true,
  slotProps,
  ...rest
}) {
  const normalizedValue = normalizeAbilitiesValue(value)
  const normalizedOptions = buildAbilitiesOptions(options)
  const selectedMap = buildSelectedMap(normalizedValue)

  const handleChange = (nextValue) => {
    onChange(normalizeAbilitiesValue(nextValue))
  }

  const handleRemoveChip = (domainId) => {
    if (!clearableChips) return
    handleChange(toggleAbilities(normalizedValue, domainId))
  }

  return (
    <Select
      multiple
      value={normalizedValue}
      onChange={(_, nextValue) => {
        handleChange(nextValue)
      }}
      disabled={disabled}
      size={size}
      color={color}
      variant={variant}
      placeholder={placeholder}
      renderValue={() => (
        <AbilitiesMultiSelectValue
          value={normalizedValue}
          options={normalizedOptions}
          placeholder={placeholder}
          onRemove={clearableChips ? handleRemoveChip : undefined}
        />
      )}
      sx={{ width: fieldWidth, minWidth: fieldWidth, flexShrink: 0, minHeight: 42, borderRadius: 'md' }}
      slotProps={{
        listbox: {
          sx: sx.listbox,
        },
        ...slotProps,
      }}
      {...rest}
    >
      {normalizedOptions.map((item) => {
        return (
          <Option key={item.value} value={item.value}>
            <Box sx={sx.optionRow}>
              <Box sx={sx.optionMain}>
                <ListItemDecorator>
                  {iconUi({ id: item.id })}
                  <Checkbox
                    tabIndex={-1}
                    disableIcon
                    checked={Boolean(selectedMap[item.value])}
                  />
                </ListItemDecorator>

                <Typography level="body-sm" sx={sx.optionLabel}>
                  {item.label}
                </Typography>
              </Box>
            </Box>
          </Option>
        )
      })}
    </Select>
  )
}
