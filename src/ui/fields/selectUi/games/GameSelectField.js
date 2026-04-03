// fields/selectUi/games/GameSelectField.js

import React from 'react'
import { FormControl, FormHelperText, FormLabel, Select, Option } from '@mui/joy'

import { iconUi } from '../../../core/icons/iconUi.js'
import useGameOptions from './logic/useGameOptions.js'
import GameOptionRow from './ui/GameOptionRow.js'
import GameValueView from './ui/GameValueView.js'
import { gamesSelectSx as sx } from './sx/gamesSelect.sx.js'

export default function GameSelectField(props) {
  const {
    value = '',
    onChange,
    disabled = false,
    helperText = '',
    required = false,
    error = false,
    label = 'בחר משחק',
    placeholder = 'בחר משחק לשיוך השחקן',
    size = 'sm',
  } = props

  const { indexedOptions, selectedOption } = useGameOptions(props)

  return (
    <FormControl sx={{ width: '100%', minWidth: 0 }} error={error} required={required}>
      {label ? <FormLabel sx={{ fontSize: 12 }}>{label}</FormLabel> : null}

      <Select
        size={size}
        value={value || null}
        onChange={(_, newValue) => onChange(newValue || '')}
        disabled={disabled}
        color={error ? 'danger' : 'neutral'}
        variant="soft"
        indicator={iconUi({ id: 'games', size: 'sm' })}
        placeholder={placeholder}
        renderValue={() => <GameValueView option={selectedOption} placeholder={placeholder} />}
        slotProps={{
          button: {
            sx: sx.selectButton,
          },
          listbox: {
            className: 'dpScrollThin',
            sx: sx.listbox,
          },
        }}
        sx={{ width: '100%', minWidth: 0 }}
      >
        {indexedOptions.map((option) => (
          <Option
            key={option.value}
            value={option.value}
            label={option.searchKey}
            disabled={option.isAlreadyInGame}
            sx={sx.option}
          >
            <GameOptionRow option={option} />
          </Option>
        ))}
      </Select>

      {helperText ? <FormHelperText>{helperText}</FormHelperText> : null}
    </FormControl>
  )
}
