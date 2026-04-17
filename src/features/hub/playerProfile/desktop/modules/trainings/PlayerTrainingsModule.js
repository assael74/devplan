import React, { useMemo } from 'react'
import { Box } from '@mui/joy'

import SectionPanel from '../../../../sharedProfile/desktop/SectionPanel.js'
import EmptyState from '../../../../sharedProfile/EmptyState.js'

import { resolvePlayerTrainingsDomain } from './playerTrainings.domain.logic.js'
import { trainModuleSx } from './trainings.sx'
import { TrainingSchedulePreview } from '../../../../../../ui/patterns/schedule'

export default function PlayerTrainingsModule({ entity, context, videoActions }) {
  const player = entity || null

  const { summary, state, trainingWeeks } = useMemo(
    () =>
      resolvePlayerTrainingsDomain(player, {}, {
        trainingWeeks: context?.trainingWeeks,
        playerTrainingWeeksById: context?.playerTrainingWeeksById,
      }),
    [player, context]
  )

  if (state === 'EMPTY') {
    return (
      <SectionPanel>
        <EmptyState title="אין אימונים" desc="לא נמצאו נתוני אימונים לשחקן" />
      </SectionPanel>
    )
  }

  return (
    <SectionPanel>
      <TrainingSchedulePreview
        entity={player}
        trainingWeeks={trainingWeeks}
        mode="profile"
        title="אימוני שחקן"
        showHeader
        showStats
        showNextWeek
      />
    </SectionPanel>
  )
}
