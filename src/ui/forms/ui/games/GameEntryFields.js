// ui/forms/ui/games/GameEntryFields.js

import React from 'react'
import { Box, Typography } from '@mui/joy'

import OnSquadSelector from '../../../fields/checkUi/games/OnSquadSelector.js'
import OnSquadStart from '../../../fields/checkUi/games/OnSquadStart.js'
import GoalField from '../../../fields/inputUi/games/GoalField.js'
import AssistField from '../../../fields/inputUi/games/AssistField.js'
import TimePlayedField from '../../../fields/inputUi/games/TimePlayedField.js'

import { entrySx as sx } from './sx/create.sx.js'

function getGameEntryFieldsState(draft = {}, limits = {}) {
  return {
    isSelected: draft?.isSelected === true,
    isStarting: draft?.isStarting === true,
    goals: draft?.goals ?? 0,
    assists: draft?.assists ?? 0,
    timePlayed: draft?.timePlayed ?? 0,
    gameId: draft?.gameId || '',
    gameDuration: draft?.raw?.gameDuration ?? draft?.gameDuration ?? '',
    goalsMax: limits?.goalsMax ?? 0,
    assistsMax: limits?.assistsMax ?? 0,
    goalsLeft: limits?.goalsLeft ?? 0,
    assistsLeft: limits?.assistsLeft ?? 0,
    totalGoalsInGame: limits?.totalGoalsInGame ?? 0,
    totalAssistsInGame: limits?.totalAssistsInGame ?? 0,
    otherGoalsUsed: limits?.otherGoalsUsed ?? 0,
    otherAssistsUsed: limits?.otherAssistsUsed ?? 0,
    hasGoalUpdates: limits?.hasGoalUpdates === true,
  }
}

export default function GameEntryFields({
  draft = {},
  onFieldChange,
  limits = {},
  pending = false,
  labels = {},
}) {
  const {
    isSelected,
    isStarting,
    goals,
    assists,
    timePlayed,
    gameId,
    gameDuration,
    goalsMax,
    assistsMax,
    goalsLeft,
    assistsLeft,
    totalGoalsInGame,
    totalAssistsInGame,
    otherGoalsUsed,
    otherAssistsUsed,
    hasGoalUpdates,
  } = getGameEntryFieldsState(draft, limits)

  const isFieldsDisabled = pending || !gameId
  const goalsLocked = !!gameId && goalsLeft <= 0
  const assistsLocked = !!gameId && assistsLeft <= 0

  const goalsText = `נכבשו ${totalGoalsInGame} שערים · עודכנו כבר ${otherGoalsUsed} · נותר ${goalsLeft} לעדכון`
  const assistsText = `נכבשו ${totalAssistsInGame} · ${otherAssistsUsed} נרשמו לאחרים · נותר ${assistsLeft} לעדכון`

  return (
    <Box sx={{ display: 'grid', gap: 1, height: '100%' }}>
      {hasGoalUpdates ? (
        <Typography level="body-xs" color="warning" sx={{ px: 0.25 }}>
          {labels.goalUpdatesNotice || 'כבר קיים עדכון שערים או בישולים למשחק זה'}
        </Typography>
      ) : null}

      <Box sx={sx.fieldsBlock}>
        <Box sx={sx.booleanGrid}>
          <OnSquadSelector
            value={isSelected}
            onChange={(value) => {
              onFieldChange('isSelected', value)

              if (!value) {
                onFieldChange('isStarting', false)
                onFieldChange('timePlayed', 0)
                onFieldChange('goals', 0)
                onFieldChange('assists', 0)
              }
            }}
            disabled={isFieldsDisabled}
            size="md"
            label={labels.isSelected || 'נכלל בסגל'}
          />

          <OnSquadStart
            value={isStarting}
            onChange={(value) => onFieldChange('isStarting', value)}
            disabled={isFieldsDisabled || !isSelected}
            size="md"
            label={labels.isStarting || 'פותח בהרכב'}
          />
        </Box>

        <Box sx={sx.statsGrid}>
          <GoalField
            value={goals}
            size="md"
            max={goalsMax}
            onChange={(value) => onFieldChange('goals', value)}
            disabled={isFieldsDisabled || !isSelected || goalsLocked}
            helperText={
              goalsLocked
                ? labels.goalsLockedText || 'לא ניתן להוסיף שערים, כבר קיים עדכון מלא למשחק'
                : goalsText
            }
          />

          <AssistField
            value={assists}
            size="md"
            max={assistsMax}
            onChange={(value) => onFieldChange('assists', value)}
            disabled={isFieldsDisabled || !isSelected || assistsLocked}
            helperText={
              assistsLocked
                ? labels.assistsLockedText || 'לא ניתן להוסיף בישולים, כבר קיים עדכון מלא למשחק'
                : assistsText
            }
          />

          <TimePlayedField
            value={timePlayed}
            size="md"
            max={gameDuration}
            onChange={(value) => onFieldChange('timePlayed', value)}
            disabled={isFieldsDisabled || !isSelected}
          />
        </Box>
      </Box>
    </Box>
  )
}
