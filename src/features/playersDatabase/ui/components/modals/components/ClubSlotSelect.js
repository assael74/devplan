import {
  Autocomplete,
  Box,
  Option,
  Select,
} from '@mui/joy'

import { clubSlotSelectSx as sx } from './sx/clubSlotSelect.sx.js'

const defaultValueOf = option => String(option?.value || option?.id || '').trim()
const defaultLabelOf = option => option?.displayLabel || option?.label || option?.name || ''

export default function ClubSlotSelect({
  clubOptions = [],
  clubValue,
  slotOptions = [],
  slotValue,
  getClubValue = defaultValueOf,
  getClubLabel = defaultLabelOf,
  getSlotValue = defaultValueOf,
  getSlotLabel = defaultLabelOf,
  clubPlaceholder = 'חיפוש מועדון',
  slotPlaceholder = '1',
  disabled = false,
  clubColor = 'neutral',
  slotColor = 'neutral',
  filterClubOptions,
  onClubChange,
  onSlotChange,
  rootSx = null,
  clubSx = null,
  slotSx = null,
}) {
  const value = String(clubValue || '').trim()
  const selectedClub = clubOptions.find(option => getClubValue(option) === value) || null
  const resolvedSlotStyle = Number(slotValue) === 2
    ? sx.slotSelectSecond
    : Number(slotValue) === 3
      ? sx.slotSelectThird
      : null

  return (
    <Box sx={[sx.root, rootSx]}>
      <Autocomplete
        size='sm'
        options={clubOptions}
        value={selectedClub}
        placeholder={clubPlaceholder}
        disabled={disabled}
        forcePopupIcon={false}
        color={clubColor}
        getOptionLabel={getClubLabel}
        isOptionEqualToValue={(option, selected) => getClubValue(option) === getClubValue(selected)}
        filterOptions={filterClubOptions}
        slotProps={{ listbox: { className: 'dpScrollThin', sx: sx.listbox } }}
        sx={[sx.clubAutocomplete, clubSx]}
        onChange={(event, nextClub) => onClubChange?.(nextClub || null)}
      />

      <Select
        size='sm'
        value={slotValue || null}
        placeholder={slotPlaceholder}
        disabled={disabled || !slotOptions.length}
        color={slotColor}
        sx={[sx.slotSelect, resolvedSlotStyle, slotSx]}
        onChange={(event, nextSlotValue) => onSlotChange?.(nextSlotValue || '')}
      >
        {slotOptions.map(option => (
          <Option key={getSlotValue(option)} value={getSlotValue(option)}>
            {getSlotLabel(option)}
          </Option>
        ))}
      </Select>
    </Box>
  )
}
