import React, { useMemo } from 'react'
import { Box } from '@mui/joy'

import SectionPanel from '../../../sharedProfile/SectionPanel.js'
import EmptyState from '../../../sharedProfile/EmptyState.js'

import { resolveTeamTrainingsDomain } from './teamTrainings.domain.logic.js'
import { trainModuleSx } from './trainings.sx'
import { TrainingSchedulePreview } from '../../../../../ui/patterns/schedule'

export default function TeamTrainingsModule({ entity, context, videoActions }) {
  const team = entity || null

  const { summary, state, trainingWeeks } = useMemo(
    () =>
      resolveTeamTrainingsDomain(team, {}, {
        trainingWeeks: context?.trainingWeeks,
        teamTrainingWeeksById: context?.teamTrainingWeeksById,
      }),
    [team, context]
  )

  if (state === 'EMPTY') {
    return (
      <SectionPanel>
        <EmptyState title="אין אימונים" desc="לא נמצאו נתוני אימונים לקבוצה" />
      </SectionPanel>
    )
  }

  return (
    <SectionPanel>
      <TrainingSchedulePreview
        entity={team}
        trainingWeeks={trainingWeeks}
        mode="profile"
        title="אימוני קבוצה"
        showHeader
        showStats
        showNextWeek
      />
    </SectionPanel>
  )
}
