// src/features/playersDatabase/ui/pages/leaguePage/components/LeagueClubSlotField.js

import { Box, Tooltip } from '@mui/joy'

import ClubSlotSelect from '../../../components/modals/components/ClubSlotSelect.js'
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
  const clubColor = clubError || errorMessage
    ? 'danger'
    : warningMessage
      ? 'warning'
      : 'neutral'
  const clubField = (
    <Box sx={sx.tooltipAnchor}>
      <ClubSlotSelect
        clubOptions={clubOptions}
        clubValue={clubId}
        slotOptions={teamSlotOptions}
        slotValue={teamSlot}
        clubColor={clubColor}
        slotColor={slotError ? 'danger' : 'neutral'}
        filterClubOptions={filterClubOptions}
        getClubValue={option => option?.value || ''}
        getClubLabel={option => option?.displayLabel || option?.label || ''}
        getSlotValue={option => option?.value || ''}
        getSlotLabel={option => option?.label || ''}
        onClubChange={nextOption => onClubChange(nextOption?.value || '')}
        onSlotChange={nextValue => onTeamSlotChange(nextValue || '')}
        rootSx={sx.root}
        clubSx={sx.clubAutocomplete}
        slotSx={sx.slotSelect}
      />
    </Box>
  )

  return errorMessage ? (
    <Tooltip
      title={errorMessage}
      placement='bottom-end'
      variant='soft'
      slotProps={{
        tooltip: {
          sx: sx.errorTooltip,
        },
      }}
    >
      {clubField}
    </Tooltip>
  ) : clubField
}
