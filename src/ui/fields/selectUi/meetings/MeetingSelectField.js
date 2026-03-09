// fields/selectUi/meetings/MeetingSelectField.js
import React from 'react'
import { Autocomplete } from '@mui/joy'
import { FormControl, FormLabel, FormHelperText } from '@mui/joy'
import { iconUi } from '../../../core/icons/iconUi.js'
import useMeetingOptions from './logic/useMeetingOptions'
import MeetingOptionRow from './ui/MeetingOptionRow'

export default function MeetingSelectField(props) {
  const {
    value,
    onChange,
    disabled,
    helperText,
    required,
    readOnly,
    size = 'sm',
    error,
    label = 'בחר פגישה',
    placeholder = 'חפש לפי תאריך / שחקן / קבוצה / מועדון',
  } = props

  const {
    indexedOptions,
    selectedOption,
    filterOptions,
  } = useMeetingOptions(props)

  return (
    <FormControl sx={{ width: '100%' }} error={error} required={required}>
      <FormLabel sx={{ fontSize: '12px' }}>{label}</FormLabel>

      <Autocomplete
        size={size}
        readOnly={readOnly}
        color={error ? 'danger' : 'neutral'}
        options={indexedOptions}
        value={selectedOption}
        onChange={(_, val) => onChange(val?.value || '')}
        getOptionLabel={(option) => {
          if (!option) return ''

          const player = option.playerFullName || ''
          const team = option.players[0].team?.teamName || ''
          const date = option.label || ''

          return [player, team, date].filter(Boolean).join(' · ')
        }}
        isOptionEqualToValue={(option, val) => option?.value === val?.value}
        startDecorator={iconUi({ id: 'meeting' })}
        placeholder={placeholder}
        disabled={disabled}
        variant="soft"
        filterOptions={filterOptions}
        renderOption={(props, option) => (
          <MeetingOptionRow props={props} option={option} />
        )}
      />

      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  )
}
