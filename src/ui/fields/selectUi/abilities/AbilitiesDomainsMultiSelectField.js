// ui/fields/selectUi/abilities/AbilitiesDomainsMultiSelectField.js

import Select from '@mui/joy/Select'
import Option from '@mui/joy/Option'
import Checkbox from '@mui/joy/Checkbox'
import ListItemDecorator from '@mui/joy/ListItemDecorator'
import Typography from '@mui/joy/Typography'
import Box from '@mui/joy/Box'

import AbilitiesDomainsMultiSelectValue from './ui/AbilitiesDomainsMultiSelectValue.js'
import { abilitiesDomainsMultiSelectSx as sx } from './sx/abilitiesDomainsMultiSelect.sx.js'
import {
  buildAbilitiesDomainsOptions,
  normalizeAbilitiesDomainsValue,
  buildSelectedDomainsMap,
} from './logic/abilitiesDomainsMultiSelect.logic.js'

import { iconUi } from '../../../core/icons/iconUi.js';

export default function AbilitiesDomainsMultiSelectField({
  value,
  onChange,
  options,
  placeholder = 'בחירת דומיינים לשליחה',
  disabled = false,
  size = 'md',
  color = 'neutral',
  variant = 'outlined',
  slotProps,
  ...rest
}) {
  const normalizedValue = normalizeAbilitiesDomainsValue(value)
  const normalizedOptions = buildAbilitiesDomainsOptions(options)
  const selectedMap = buildSelectedDomainsMap(normalizedValue)

  return (
    <Select
      multiple
      value={normalizedValue}
      onChange={(_, nextValue) => {
        onChange(normalizeAbilitiesDomainsValue(nextValue))
      }}
      disabled={disabled}
      size={size}
      color={color}
      variant={variant}
      renderValue={() => (
        <AbilitiesDomainsMultiSelectValue
          value={normalizedValue}
          options={normalizedOptions}
          placeholder={placeholder}
        />
      )}
      sx={sx.select}
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
                  {iconUi({id: item.id})}
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
      } )}
    </Select>
  )
}
