import React, { useMemo } from 'react'
import { Box } from '@mui/joy'

import SectionPanel from '../../../../sharedProfile/desktop/SectionPanel.js'
import EmptyState from '../../../../sharedProfile/EmptyState.js'

import { resolveTeamTrainingsDomain } from '../../../sharedLogic/trainings'

import { TrainingSchedulePreview } from '../../../../../../ui/patterns/schedule'

export default function TeamTrainingsModule({ entity, context, videoActions }) {
  const liveTeam = useMemo(() => {
    const teams = Array.isArray(context?.teams) ? context.teams : []
    return teams.find((t) => t?.id === entity?.id) || entity || null
  }, [context?.teams, entity])

  const { summary, state, trainingWeeks } = useMemo(
    () =>
      resolveTeamTrainingsDomain(liveTeam, {}, {
        trainingWeeks: context?.trainingWeeks,
        teamTrainingWeeksById: context?.teamTrainingWeeksById,
      }),
    [liveTeam, context]
  )

  return (
    <SectionPanel>
      <TrainingSchedulePreview
        trainingWeeks={trainingWeeks}
        title="אימוני קבוצה"
        entity={liveTeam}
        entityType='team'
        context={context}
        mode="profile"
        showNextWeek
        showHeader
        showStats
      />
    </SectionPanel>
  )
}
