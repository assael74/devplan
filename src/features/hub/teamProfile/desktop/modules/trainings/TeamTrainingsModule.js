// teamProfile/desktop/modules/trainings/TeamTrainingsModule.js

import React from 'react'

import SectionPanel from '../../../../sharedProfile/desktop/SectionPanel.js'

import { TrainingSchedulePreview } from '../../../../../../ui/patterns/schedule'

import { useTeamTrainingsModuleModel } from '../../../sharedModules/trainings'

export default function TeamTrainingsModule({ entity, context }) {
  const {
    liveTeam,
    trainingWeeks,
  } = useTeamTrainingsModuleModel({
    entity,
    context,
    buildMobileModel: false,
  })

  return (
    <SectionPanel>
      <TrainingSchedulePreview
        trainingWeeks={trainingWeeks}
        title="אימוני קבוצה"
        entity={liveTeam}
        entityType="team"
        context={context}
        mode="profile"
        showNextWeek
        showHeader
        showStats
      />
    </SectionPanel>
  )
}
