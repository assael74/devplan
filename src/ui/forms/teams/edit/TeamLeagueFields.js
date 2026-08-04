// ui/forms/teams/edit/TeamLeagueFields.js

import React from 'react'
import { Box } from '@mui/joy'

import GoalsAgainstField from '../../../fields/games/GoalsAgainstField.js'
import GoalsForField from '../../../fields/games/GoalsForField.js'
import TeamLeagueLevelField from '../../../fields/leagues/TeamLeagueLevelField.js'
import TeamLeagueNameField from '../../../fields/leagues/TeamLeagueNameField.js'
import TeamLeaguePointsField from '../../../fields/leagues/TeamLeaguePointsField.js'
import TeamLeaguePosField from '../../../fields/leagues/TeamLeaguePosField.js'
import TeamLeagueRoundField from '../../../fields/leagues/TeamLeagueRoundField.js'

export default function TeamLeagueFields({
  draft,
  onField,
  mainLayout,
  statsLayout,
  disabled = false,
  fieldDisabled = {},
  showPosition = true,
  showStats = true,
  showRounds = false,
  variant,
}) {
  return (
    <>
      <Box sx={mainLayout}>
        <TeamLeagueNameField
          label='ליגה'
          size='sm'
          variant={variant}
          value={draft?.league || ''}
          disabled={disabled || fieldDisabled?.league}
          onChange={(value) => onField('league', value)}
        />

        <TeamLeagueLevelField
          label='רמת ליגה'
          size='sm'
          variant={variant}
          value={draft?.leagueLevel == null ? '' : draft.leagueLevel}
          disabled={disabled || fieldDisabled?.leagueLevel}
          onChange={(value) => onField('leagueLevel', value)}
        />

        {showPosition ? (
          <TeamLeaguePosField
            size='sm'
            variant={variant}
            value={draft?.leaguePosition == null ? '' : draft.leaguePosition}
            disabled={disabled || fieldDisabled?.leaguePosition}
            onChange={(value) => onField('leaguePosition', value)}
          />
        ) : null}

        {showRounds ? (
          <TeamLeagueRoundField
            max={40}
            size='sm'
            variant={variant}
            value={draft?.leagueRound || ''}
            disabled={disabled || fieldDisabled?.leagueRound}
            onChange={(value) => onField('leagueRound', value)}
          />
        ) : null}

        {showRounds ? (
          <TeamLeagueRoundField
            max={40}
            size='sm'
            variant={variant}
            label='מחזורי ליגה'
            placeholder='סך מחזורים'
            value={draft?.leagueNumGames || ''}
            disabled={disabled || fieldDisabled?.leagueNumGames}
            onChange={(value) => onField('leagueNumGames', value)}
          />
        ) : null}
      </Box>

      {showStats ? (
        <Box sx={statsLayout}>
          <TeamLeaguePointsField
            size='sm'
            value={draft?.points == null ? '' : draft.points}
            disabled={disabled || fieldDisabled?.points}
            onChange={(value) => onField('points', value)}
          />

          <GoalsForField
            size='sm'
            label='שערי זכות בליגה'
            value={draft?.leagueGoalsFor == null ? '' : draft.leagueGoalsFor}
            disabled={disabled || fieldDisabled?.leagueGoalsFor}
            onChange={(value) => onField('leagueGoalsFor', value)}
          />

          <GoalsAgainstField
            size='sm'
            label='שערי חובה בליגה'
            value={draft?.leagueGoalsAgainst == null ? '' : draft.leagueGoalsAgainst}
            disabled={disabled || fieldDisabled?.leagueGoalsAgainst}
            onChange={(value) => onField('leagueGoalsAgainst', value)}
          />
        </Box>
      ) : null}
    </>
  )
}
