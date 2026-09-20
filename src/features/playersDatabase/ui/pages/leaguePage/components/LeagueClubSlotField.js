// src/features/playersDatabase/ui/pages/leaguePage/components/LeagueClubSlotField.js

import {
  Autocomplete,
  Box,
  Option,
  Select,
  Typography,
} from '@mui/joy'

import { leagueClubSlotFieldSx as sx } from './sx/leagueClubSlotField.sx.js'

export function LeagueClubSlotField({
  clubId,
  clubOptions,
  teamSlot,
  teamSlotOptions,
  onClubChange,
  onTeamSlotChange,
  filterClubOptions,
  clubError = false,
  slotError = false,
  errorMessage = '',
  warningMessage = '',
}) {
  const selectedClub = clubOptions.find(option => option.value === clubId) || null

  return (
    <Box sx={sx.root}>
      <Autocomplete
        size="sm"
        options={clubOptions}
        value={selectedClub}
        placeholder="חיפוש מועדון"
        getOptionLabel={option => option.displayLabel || option.label || ''}
        isOptionEqualToValue={(option, selected) => option.value === selected?.value}
        filterOptions={filterClubOptions}
        color={clubError ? 'danger' : 'neutral'}
        sx={sx.clubAutocomplete}
        onChange={(event, nextOption) => onClubChange(nextOption ? nextOption.value : '')}
      />

      <Select
        size="sm"
        value={teamSlot}
        color={slotError ? 'danger' : 'neutral'}
        sx={[
          sx.slotSelect,
          Number(teamSlot) > 1 ? sx.slotSelectChanged : null,
        ]}
        onChange={(event, nextValue) => onTeamSlotChange(nextValue || '')}
      >
        {teamSlotOptions.map(option => (
          <Option key={option.value} value={option.value}>
            {option.label}
          </Option>
        ))}
      </Select>

      {errorMessage ? (
        <Typography level="body-xs" color="danger" sx={[sx.message, sx.errorMessage]}>
          {errorMessage}
        </Typography>
      ) : null}

      {!errorMessage && warningMessage ? (
        <Typography level="body-xs" color="warning" sx={[sx.message, sx.warningMessage]}>
          {warningMessage}
        </Typography>
      ) : null}
    </Box>
  )
}
