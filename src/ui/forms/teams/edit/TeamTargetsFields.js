// ui/forms/teams/edit/TeamTargetsFields.js

import React from 'react'
import { Box, FormControl, FormLabel, Input, Typography } from '@mui/joy'

import GoalsAgainstField from '../../../fields/games/GoalsAgainstField.js'
import GoalsForField from '../../../fields/games/GoalsForField.js'
import TeamLeaguePointsField from '../../../fields/leagues/TeamLeaguePointsField.js'
import TeamLeaguePosField from '../../../fields/leagues/TeamLeaguePosField.js'

export default function TeamTargetsFields({
  draft,
  onField,
  mainLayout,
  goalsLayout,
  disabled = false,
  fieldDisabled = {},
}) {
  return (
    <>
      <Box sx={mainLayout}>
        <TeamLeaguePosField
          size='sm'
          variant='soft'
          color='primary'
          label='יעד מיקום בליגה'
          value={draft?.targetPosition == null ? '' : draft.targetPosition}
          disabled={disabled || fieldDisabled?.targetPosition}
          onChange={(value) => onField('targetPosition', value)}
        />

        <TeamLeaguePointsField
          size='sm'
          variant='soft'
          color='primary'
          label='יעד נקודות'
          value={draft?.targetPoints == null ? '' : draft.targetPoints}
          disabled={disabled || fieldDisabled?.targetPoints}
          onChange={(value) => onField('targetPoints', value)}
        />

        <FormControl
          size='sm'
          disabled={disabled || fieldDisabled?.targetSuccessRate}
        >
          <FormLabel>יעד אחוז הצלחה</FormLabel>
          <Input
            size='sm'
            variant='soft'
            color='primary'
            value={draft?.targetSuccessRate == null ? '' : draft.targetSuccessRate}
            onChange={(event) => {
              onField('targetSuccessRate', event.target.value)
            }}
            endDecorator={(
              <Typography level='body-xs' sx={{ color: 'text.tertiary' }}>
                %
              </Typography>
            )}
          />
        </FormControl>
      </Box>

      <Box sx={goalsLayout}>
        <GoalsForField
          size='sm'
          variant='soft'
          color='primary'
          label='יעד שערי זכות'
          value={draft?.targetGoalsFor == null ? '' : draft.targetGoalsFor}
          disabled={disabled || fieldDisabled?.targetGoalsFor}
          onChange={(value) => onField('targetGoalsFor', value)}
        />

        <GoalsAgainstField
          size='sm'
          variant='soft'
          color='primary'
          label='יעד שערי חובה'
          value={draft?.targetGoalsAgainst == null ? '' : draft.targetGoalsAgainst}
          disabled={disabled || fieldDisabled?.targetGoalsAgainst}
          onChange={(value) => onField('targetGoalsAgainst', value)}
        />
      </Box>
    </>
  )
}
